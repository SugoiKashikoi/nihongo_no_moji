# こえの文字（Koe no Moji）

話した言葉をリアルタイムで「ひらがな」「ローマ字」に変換して大きく表示する Expo (React Native) アプリのプロトタイプです。
未就学児・小学校低学年の文字学習支援、日本語初級学習者の発音確認を目的としています。

## 現状の機能

- マイクボタンタップで音声認識を開始/停止（`expo-speech-recognition`, ja-JP）
- 認識結果を `kuromoji`（形態素解析・IPADIC辞書）で読み仮名に変換し、`wanakana`でひらがな・ローマ字表示
- キッズモード（ひらがなのみ）/ 学習者モード（ひらがな＋ローマ字）切り替え
- 履歴表示とワンタップ消去

## 漢字→ひらがな変換の仕組み

kuromoji は Node.js（`fs`/`zlib`/`path`）前提のため、そのままでは React Native で動きません。
そこで `src/lib/kuromojiLoader.ts` で以下を独自実装しています。

- IPADIC辞書ファイル（`assets/kuromoji-dict/*.dat.gz`, 約18MB）をアプリにバンドル
- `expo-asset` + `expo-file-system` の `File#arrayBuffer()` で辞書を読み込み
- `pako.ungzip` でNode非依存に展開
- kuromojiの `DynamicDictionaries` / `Tokenizer` を直接呼び出してトークナイザーを構築

初回起動時に辞書の読み込み（数秒程度）が発生するため、読み込み中はマイクボタンを無効化しています。
辞書にない語（記号・固有名詞など）は読みが取得できず、その場合は元の文字がそのまま残ります。

## 開発

このプロジェクトは音声認識のネイティブモジュールを使用するため、Expo Go では動作しません。
開発ビルドを作成してください（iOS / Android 両対応）。

```bash
npm install
npx expo prebuild
npx expo run:ios       # iOS 実機/シミュレータ
npx expo run:android   # Android 実機/エミュレータ
```

## 技術スタック

- Expo (React Native) / TypeScript
- expo-speech-recognition（iOS: SFSpeechRecognizer / Android: SpeechRecognizer）
- kuromoji（形態素解析・読み仮名変換） / wanakana（かな⇔ローマ字変換） / pako（辞書展開）
