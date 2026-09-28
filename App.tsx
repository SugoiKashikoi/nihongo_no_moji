import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";

import { useVoiceToKana } from "./src/hooks/useVoiceToKana";

type Mode = "kids" | "learner";

export default function App() {
  const [mode, setMode] = useState<Mode>("kids");
  const {
    isListening,
    current,
    history,
    errorMessage,
    isDictReady,
    start,
    stop,
    clear,
  } = useVoiceToKana();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.title}>こえの文字</Text>
        <View style={styles.modeSwitch}>
          <ModeButton
            label="キッズ"
            active={mode === "kids"}
            onPress={() => setMode("kids")}
          />
          <ModeButton
            label="学習者"
            active={mode === "learner"}
            onPress={() => setMode("learner")}
          />
        </View>
      </View>

      <View style={styles.display}>
        {current ? (
          <>
            <Text style={styles.hiragana}>{current.hiragana}</Text>
            {mode === "learner" && (
              <Text style={styles.romaji}>{current.romaji}</Text>
            )}
            {current.hasUnconvertedKanji && (
              <Text style={styles.note}>
                （漢字はまだひらがなに変換できません）
              </Text>
            )}
          </>
        ) : !isDictReady ? (
          <Text style={styles.placeholder}>辞書を読み込んでいます...</Text>
        ) : (
          <Text style={styles.placeholder}>
            マイクをタップして{"\n"}話しかけてね
          </Text>
        )}
        {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
      </View>

      <View style={styles.controls}>
        <Pressable
          disabled={!isDictReady}
          onPress={isListening ? stop : start}
          style={[
            styles.micButton,
            isListening && styles.micButtonActive,
            !isDictReady && styles.micButtonDisabled,
          ]}
        >
          <Text style={styles.micButtonText}>
            {isListening ? "きく..." : "マイク"}
          </Text>
        </Pressable>
        <Pressable onPress={clear} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>けす</Text>
        </Pressable>
      </View>

      {history.length > 0 && (
        <ScrollView style={styles.history}>
          {history.map((entry) => (
            <View key={entry.id} style={styles.historyItem}>
              <Text style={styles.historyHiragana}>{entry.hiragana}</Text>
              {mode === "learner" && (
                <Text style={styles.historyRomaji}>{entry.romaji}</Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function ModeButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.modeButton, active && styles.modeButtonActive]}
    >
      <Text
        style={[styles.modeButtonText, active && styles.modeButtonTextActive]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFDF7" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#3A2E1F" },
  modeSwitch: { flexDirection: "row", gap: 8 },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#EEE5D3",
  },
  modeButtonActive: { backgroundColor: "#FFB74D" },
  modeButtonText: { fontSize: 14, color: "#7A6A4F" },
  modeButtonTextActive: { color: "#3A2E1F", fontWeight: "700" },
  display: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  hiragana: {
    fontSize: 56,
    fontWeight: "800",
    textAlign: "center",
    color: "#3A2E1F",
    lineHeight: 68,
  },
  romaji: {
    marginTop: 16,
    fontSize: 28,
    color: "#7A6A4F",
    textAlign: "center",
  },
  placeholder: {
    fontSize: 22,
    color: "#B8AA8A",
    textAlign: "center",
    lineHeight: 32,
  },
  note: { marginTop: 12, fontSize: 14, color: "#C97B4A", textAlign: "center" },
  error: { marginTop: 12, fontSize: 14, color: "#D64545", textAlign: "center" },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    paddingBottom: 12,
  },
  micButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#FFB74D",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  micButtonActive: { backgroundColor: "#FF8A3D" },
  micButtonDisabled: { backgroundColor: "#EEE5D3" },
  micButtonText: { fontSize: 20, fontWeight: "700", color: "#3A2E1F" },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: "#EEE5D3",
  },
  clearButtonText: { fontSize: 16, color: "#7A6A4F" },
  history: {
    maxHeight: 140,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  historyItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE5D3",
  },
  historyHiragana: { fontSize: 18, color: "#3A2E1F" },
  historyRomaji: { fontSize: 13, color: "#B8AA8A" },
});
