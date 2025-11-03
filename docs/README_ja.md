# 🎬 Video2PPT - ビデオからPowerPoint変換ツール

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.7+](https://img.shields.io/badge/Python-3.7%2B-blue)](https://www.python.org/downloads/)
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/wangxs404/video2ppt)

🚀 **[クイックスタート](#クイックスタート)** | 📖 **[完全なドキュメント](#ドキュメント)** | 💬 **[GitHub Issues](https://github.com/wangxs404/video2ppt/issues)** | 🌍 **[メインに戻る](../README.md)**

---

ビデオファイルをPowerPointプレゼンテーションに自動変換します。このツールは指定された時間間隔でビデオからフレームを抽出し、美しいPowerPointプレゼンテーションを生成します。

## ✨ 機能

- 🎬 **ビデオフレーム抽出** - 指定された時間間隔でビデオから自動的にフレームを抽出（秒単位）
- 📊 **PPT生成** - 美しいPowerPointプレゼンテーションを生成
- ⏱️ **柔軟な設定** - カスタマイズ可能なフレーム抽出間隔に対応
- 🚀 **高速処理** - 高速処理、小さいファイルサイズ
- 🖼️ **プロフェッショナルレイアウト** - 画像がスライド全体を埋める
- 📋 **自動クリーンアップ** - 一時ファイルの自動クリーンアップ

## 🚀 クイックスタート

### 要件

- Python 3.7+

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
# デフォルト：1秒ごとに1フレーム抽出
python3 main.py video.mp4

# 5秒ごとに1フレーム抽出
python3 main.py video.mp4 -i 5 -o output.pptx

# 10秒ごとに1フレーム抽出（高速モード）
python3 main.py video.mp4 -i 10

# すべての利用可能なオプションを表示
python3 main.py -h
```

## 📋 使用例

### 例1：クイックプレビュー（最速処理）
```bash
python3 main.py video.mp4 -i 10
```
- 間隔：10秒ごとに1フレーム抽出
- 結果：スライド数が少なく、ファイルサイズが小さく、処理が高速（約7秒）

### 例2：標準変換（推奨）⭐
```bash
python3 main.py video.mp4 -i 5 -o output.pptx
```
- 間隔：5秒ごとに1フレーム抽出
- 結果：品質とファイルサイズのバランスが取れている（約14秒）

### 例3：高品質変換（詳細）
```bash
python3 main.py video.mp4 -i 2 -o detailed.pptx
```
- 間隔：2秒ごとに1フレーム抽出
- 結果：より多くのスライド、大きいファイルサイズ、高品質（約28秒）

### 例4：デフォルト（最大の詳細）
```bash
python3 main.py video.mp4 -i 1 -o maximum.pptx
```
- 間隔：1秒ごとに1フレーム抽出（デフォルト）
- 結果：最大フレーム数、最大ファイルサイズ（37分ビデオで約55秒）

## 📊 パフォーマンス

76MB、37分のMP4ビデオに基づくテスト結果：

| 間隔（秒） | フレームレート | 処理時間 | ファイルサイズ | スライド数 |
|---------|------------|--------|-------------|----------|
| -i 10 | 0.1 fps | ~7秒 | ~9 MB | ~222 |
| -i 5 | 0.2 fps | ~14秒 | ~17 MB | ~444 |
| -i 2 | 0.5 fps | ~28秒 | ~33 MB | ~1110 |
| -i 1 | 1.0 fps | ~55秒 | ~80+ MB | ~2220 |

**推奨：** 品質とファイルサイズの最適なバランスのため `-i 5` を使用してください。

## 📖 ドキュメント

### コマンドラインオプション

```
使用法: main.py [-h] [-o 出力] [-i 間隔] ビデオ

位置引数:
  ビデオ              入力ビデオファイルのパス

オプション引数:
  -h, --help       ヘルプメッセージを表示して終了
  -o, --output 出力 出力PowerPointファイルのパス（デフォルト：video_name_output.pptx）
  -i, --interval 間隔
                   フレーム抽出間隔（秒）、デフォルト：1秒
```

### 異なるビデオフォーマットの例

**MP4ビデオ**
```bash
python3 main.py lecture.mp4 -o lecture.pptx
```

**AVIビデオ**
```bash
python3 main.py presentation.avi -o presentation.pptx -i 3
```

**MOVビデオ（Mac）**
```bash
python3 main.py video.mov -o output.pptx -i 2
```

## 🛠️ 技術スタック

- **OpenCV** - ビデオ処理とフレーム抽出
- **python-pptx** - PowerPointファイル生成
- **Pillow** - 画像処理とリサイズ
- **NumPy** - 数値演算

## 💡 よくある質問

### Q: どのビデオフォーマットがサポートされていますか？
A: OpenCVがサポートするほとんどのフォーマット（MP4、AVI、MOV、MKV、FLV、WMVなど）

### Q: 間隔パラメータはどのように機能しますか？
A: `-i` パラメータはフレーム間の秒数を指定します。例えば、`-i 5` は5秒ごとに1フレームを抽出します。

### Q: 処理速度を上げるにはどうすればよいですか？
A: `-i` パラメータの値を増やしてください。例えば、`-i 10` は `-i 2` の約5倍高速ですが、抽出フレーム数が減ります。

### Q: ファイルサイズを削減するにはどうすればよいですか？
A: より大きいフレーム抽出間隔を使用してください。例えば、`-i 10` は `-i 1` より約90%削減です。

### Q: スライドレイアウトをカスタマイズできますか？
A: 現在、ツールは標準的な全スライド画像レイアウトを使用しています。カスタムレイアウトは将来のバージョンで対応予定です。

### Q: サポートされる最大ビデオ期間はどのくらいですか？
A: 厳密な制限はありませんが、処理時間はビデオ長と間隔パラメータに依存します。

### Q: インターネット接続が必要ですか？
A: いいえ、すべての処理はローカルマシンで実行されます。

### Q: Windows/macOS/Linuxで実行できますか？
A: はい、このツールはクロスプラットフォーム対応で、すべてのシステムで動作します。

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
- 時間間隔ベースのフレーム抽出によるビデオからPowerPoint変換
- カスタマイズ可能な時間間隔でのフレーム抽出（秒単位）
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
