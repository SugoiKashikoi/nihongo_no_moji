import * as wanakana from "wanakana";

import { getKuromojiTokenizer } from "./kuromojiLoader";

/**
 * 音声認識結果を「ひらがな」「ローマ字」に変換するユーティリティ。
 *
 * kuromoji (IPADIC) で形態素解析し、各トークンの読み（カタカナ）を
 * ひらがなに変換する。辞書に読みがない未知語（記号など）はそのまま残す。
 */

const KANJI_REGEX = /[一-龯]/;

export function containsKanji(text: string): boolean {
  return KANJI_REGEX.test(text);
}

export function toRomaji(hiraganaText: string): string {
  return wanakana.toRomaji(hiraganaText);
}

export interface ConversionResult {
  original: string;
  hiragana: string;
  romaji: string;
  hasUnconvertedKanji: boolean;
}

/**
 * kuromojiが使えない場合の簡易フォールバック（カタカナ・ローマ字のみひらがな化）。
 */
function toHiraganaFallback(text: string): string {
  return wanakana.toHiragana(text, { passRomaji: false });
}

export async function toHiraganaWithKuromoji(text: string): Promise<string> {
  try {
    const tokenizer = await getKuromojiTokenizer();
    const tokens = tokenizer.tokenize(text);
    return tokens
      .map((token) => {
        const reading = token.reading;
        if (reading && reading !== "*") {
          return wanakana.toHiragana(reading);
        }
        return toHiraganaFallback(token.surface_form);
      })
      .join("");
  } catch (error) {
    console.warn("kuromoji tokenize failed, falling back", error);
    return toHiraganaFallback(text);
  }
}

export async function convert(text: string): Promise<ConversionResult> {
  const hiragana = await toHiraganaWithKuromoji(text);
  return {
    original: text,
    hiragana,
    romaji: toRomaji(hiragana),
    hasUnconvertedKanji: containsKanji(hiragana),
  };
}
