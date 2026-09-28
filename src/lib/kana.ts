import * as wanakana from "wanakana";

/**
 * 音声認識結果を「ひらがな」「ローマ字」に変換するユーティリティ。
 *
 * 制約: 端末の音声認識エンジンが漢字混じりで返した文字列は、
 * 形態素解析辞書なしでは正確に読み仮名へ戻せない。
 * そのため漢字はそのまま残し、カタカナ・ローマ字部分のみひらがな化する。
 * 完全な漢字→ひらがな変換（辞書ベースの形態素解析）は今後の拡張とする。
 */

const KANJI_REGEX = /[一-龯]/;

export function containsKanji(text: string): boolean {
  return KANJI_REGEX.test(text);
}

export function toHiragana(text: string): string {
  return wanakana.toHiragana(text, { passRomaji: false });
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

export function convert(text: string): ConversionResult {
  const hiragana = toHiragana(text);
  return {
    original: text,
    hiragana,
    romaji: toRomaji(hiragana),
    hasUnconvertedKanji: containsKanji(hiragana),
  };
}
