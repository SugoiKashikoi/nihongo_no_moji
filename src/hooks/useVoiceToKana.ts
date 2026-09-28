import { useCallback, useEffect, useRef, useState } from "react";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

import { convert, type ConversionResult } from "../lib/kana";
import { getKuromojiTokenizer } from "../lib/kuromojiLoader";

export interface HistoryEntry extends ConversionResult {
  id: string;
}

export function useVoiceToKana() {
  const [isListening, setIsListening] = useState(false);
  const [current, setCurrent] = useState<ConversionResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDictReady, setIsDictReady] = useState(false);
  const latestRequestId = useRef(0);

  useEffect(() => {
    getKuromojiTokenizer()
      .then(() => setIsDictReady(true))
      .catch((error) => {
        console.warn("辞書の読み込みに失敗しました", error);
        setIsDictReady(true); // フォールバック変換で続行する
      });
  }, []);

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

    const requestId = ++latestRequestId.current;
    convert(text).then((result) => {
      if (requestId !== latestRequestId.current) return; // 古い結果は破棄
      setCurrent(result);
      if (event.isFinal) {
        setHistory((prev) => [{ ...result, id: `${Date.now()}` }, ...prev]);
      }
    });
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

  return {
    isListening,
    current,
    history,
    errorMessage,
    isDictReady,
    start,
    stop,
    clear,
  };
}
