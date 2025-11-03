# 🎬 Video2PPT - ビデオからPowerPoint変換ツール

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.7+](https://img.shields.io/badge/Python-3.7%2B-blue)](https://www.python.org/downloads/)
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/wangxs404/video2ppt)

🚀 **[クイックスタート](#クイックスタート)** | 📖 **[完全なドキュメント](#ドキュメント)** | 💬 **[GitHub Issues](https://github.com/wangxs404/video2ppt/issues)** | 🌍 **[メインに戻る](../README.md)**

---

ビデオファイルをPowerPointプレゼンテーションに自動変換します。このツールはビデオからキーフレームを抽出し、美しいPowerPointプレゼンテーションを生成します。

## ✨ 機能

- 🎬 **ビデオフレーム抽出** - ビデオから主要なフレームを自動抽出
- 📊 **PPT生成** - 美しいPowerPointプレゼンテーションを生成
- ⏱️ **柔軟な設定** - カスタマイズ可能なフレーム抽出間隔に対応
- 🚀 **高速処理** - 高速処理、小さいファイルサイズ
- 🖼️ **プロフェッショナルレイアウト** - 画像がスライド全体を埋める
- 📋 **自動クリーンアップ** - 一時ファイルの自動クリーンアップ

## 🚀 クイックスタート

### 要件

- Python 3.7+
- FFmpeg（オプション、高度なビデオ処理用）

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/wangxs404/video2ppt.git
cd video2ppt

# 依存関係のインストール
pip install -r requirements.txt
```

### 基本的な使用方法

```bash
# 最もシンプルな方法 - デフォルト設定を使用
python3 video2ppt.py video.mp4

# 出力ファイルとフレーム抽出間隔を指定
python3 video2ppt.py video.mp4 -o output.pptx -i 10

# すべての利用可能なオプションを表示
python3 video2ppt.py -h
```

## 📋 使用例

### クイックプレビュー（最速処理）
```bash
python3 video2ppt.py video.mp4 -i 20
```
- 間隔：20フレーム間隔
- 結果：スライド数が少なく、ファイルサイズが小さく、処理が高速

### 標準変換（推奨）⭐
```bash
python3 video2ppt.py video.mp4 -i 10 -o output.pptx
```
- 間隔：10フレーム間隔
- 結果：品質とファイルサイズのバランスが取れている

### 高品質変換（より多くのスライド）
```bash
python3 video2ppt.py video.mp4 -i 5 -o output_hq.pptx
```
- 間隔：5フレーム間隔
- 結果：より多くのスライド、大きいファイルサイズ、高品質

## 📊 パフォーマンス

| パラメータ | 処理時間 | ファイルサイズ | スライド数 |
|---------|---------|-------------|----------|
| -i 10 | ~14.5秒 | ~17 MB | ~225 |
| -i 5 | ~28秒 | ~33 MB | ~449 |
| -i 1 | ~90+秒 | ~80+ MB | ~2237 |

*76MB、37分のMP4ビデオに基づくテスト*

## 📖 ドキュメント

### コマンドラインオプション

```
使用法: video2ppt.py [-h] [-o 出力] [-i 間隔] 入力ビデオ

位置引数:
  入力ビデオ         入力ビデオファイルのパス

オプション引数:
  -h, --help       ヘルプメッセージを表示して終了
  -o, --output 出力 出力PowerPointファイルのパス（デフォルト：output.pptx）
  -i, --interval 間隔
                   フレーム抽出間隔（デフォルト：10）
```

### 異なるフォーマットの例

**MP4ビデオ**
```bash
python3 video2ppt.py lecture.mp4 -o lecture.pptx
```

**AVIビデオ**
```bash
python3 video2ppt.py presentation.avi -o presentation.pptx
```

**MOVビデオ（Mac）**
```bash
python3 video2ppt.py video.mov -o output.pptx
```

## 🛠️ 技術スタック

- **OpenCV** - ビデオ処理とフレーム抽出
- **python-pptx** - PowerPointファイル生成
- **Pillow** - 画像処理とリサイズ
- **NumPy** - 数値計算

## 💡 よくある質問

### Q: どのビデオフォーマットがサポートされていますか？
A: OpenCVがサポートするほとんどのフォーマット（MP4、AVI、MOV、MKV、FLV、WMVなど）

### Q: 処理速度を上げるにはどうすればよいですか？
A: `-i` パラメータの値を増やしてください。例えば、`-i 20` は `-i 5` の約4倍高速です

### Q: ファイルサイズを削減するにはどうすればよいですか？
A: より大きいフレーム抽出間隔を使用してください。例えば、`-i 10` は `-i 5` より約90%削減です

### Q: スライドレイアウトをカスタマイズできますか？
A: 現在、ツールは標準レイアウトを使用しています。カスタムレイアウトは将来のバージョンで対応予定です。

### Q: サポートされる最大ビデオ期間はどのくらいですか？
A: 厳密な制限はありませんが、処理時間はビデオ長と間隔パラメータに依存します。

### Q: インターネット接続が必要ですか？
A: いいえ、すべての処理はローカルマシンで実行されます。

### Q: macOS/Linuxで実行できますか？
A: はい、このツールはクロスプラットフォーム対応で、Windows、macOS、Linuxで動作します。

## 🐛 トラブルシューティング

### 問題：「OpenCV not found」エラー
```bash
# 解決策：OpenCVをインストール
pip install opencv-python
```

### 問題：「No module named 'pptx'」エラー
```bash
# 解決策：python-pptxをインストール
pip install python-pptx
```

### 問題：ビデオファイルが認識されない
- ビデオファイルのパスが正しいか確認してください
- ビデオフォーマットがサポートされているか確認してください
- 別のビデオファイルを試してください

## 📝 変更履歴

### v1.0.0 (2025-11-03)
- 初期リリース
- 基本的なビデオからPowerPoint変換
- カスタマイズ可能な間隔でのフレーム抽出
- 複数ビデオフォーマット対応

## 🤝 貢献

貢献を歓迎します！Pull Requestを気軽に提出してください。

## 📜 ライセンス

このプロジェクトはMITライセンスの下でライセンスされています。詳細は [LICENSE](../LICENSE) ファイルを参照してください。

## 🔗 リンク

- [GitHub リポジトリ](https://github.com/wangxs404/video2ppt)
- [GitHub Issues](https://github.com/wangxs404/video2ppt/issues)
- [MIT ライセンス](https://opensource.org/licenses/MIT)

---

**最終更新:** 2025-11-03
