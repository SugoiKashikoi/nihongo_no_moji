import { useCallback, useRef, useState } from "react";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

import { convert, type ConversionResult } from "../lib/kana";

export interface HistoryEntry extends ConversionResult {
  id: string;
}

export function useVoiceToKana() {
  const [isListening, setIsListening] = useState(false);
  const [current, setCurrent] = useState<ConversionResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastFinalText = useRef<string>("");

  useSpeechRecognitionEvent("start", () => {
    setIsListening(true);
    setErrorMessage(null);
  });

  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent("result", (event) => {
    const text = event.results[0]?.transcript ?? "";
    if (!text) return;
    setCurrent(convert(text));
    if (event.isFinal) {
      lastFinalText.current = text;
      setHistory((prev) => [
        { ...convert(text), id: `${Date.now()}` },
        ...prev,
      ]);
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    setIsListening(false);
    setErrorMessage(event.message ?? event.error);
  });

  const start = useCallback(async () => {
    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      setErrorMessage("マイク・音声認識の権限が必要です。");
      return;
    }
    ExpoSpeechRecognitionModule.start({
      lang: "ja-JP",
      interimResults: true,
      continuous: false,
    });
  }, []);

  const stop = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  const clear = useCallback(() => {
    setCurrent(null);
    setHistory([]);
    setErrorMessage(null);
  }, []);

  return { isListening, current, history, errorMessage, start, stop, clear };
}
