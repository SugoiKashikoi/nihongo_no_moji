# こえの文字（Koe no Moji）

話した言葉をリアルタイムで「ひらがな」「ローマ字」に変換して大きく表示する Expo (React Native) アプリのプロトタイプです。
未就学児・小学校低学年の文字学習支援、日本語初級学習者の発音確認を目的としています。

## 現状の機能

- マイクボタンタップで音声認識を開始/停止（`expo-speech-recognition`, ja-JP）
- 認識結果を `wanakana` でひらがな・ローマ字に変換して巨大表示
- キッズモード（ひらがなのみ）/ 学習者モード（ひらがな＋ローマ字）切り替え
- 履歴表示とワンタップ消去

## 既知の制約

音声認識エンジンが漢字混じりの文字列を返した場合、形態素解析辞書を使わない現状の実装では
漢字を正確な読み仮名に変換できません（漢字はそのまま表示され、注記が出ます）。
将来的に辞書ベースの読み仮名変換（例: kuromoji 等）を組み込む予定です。

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
- wanakana（かな⇔ローマ字変換）
