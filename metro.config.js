const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// kuromoji の辞書ファイル(.dat.gz)をバイナリアセットとしてバンドルするために必要
config.resolver.assetExts.push("gz");

module.exports = config;
