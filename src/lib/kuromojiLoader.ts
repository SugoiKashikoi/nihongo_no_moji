import { Asset } from "expo-asset";
import { File } from "expo-file-system";
import * as pako from "pako";

// kuromoji は Node の path/fs/zlib 前提のローダーしか提供しないため、
// React Native向けに DynamicDictionaries / Tokenizer を直接使い、
// 辞書ファイルの読み込み・展開だけを自前で実装する。
// eslint-disable-next-line @typescript-eslint/no-var-requires
const DynamicDictionaries = require("kuromoji/src/dict/DynamicDictionaries");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Tokenizer = require("kuromoji/src/Tokenizer");

export interface KuromojiToken {
  surface_form: string;
  reading?: string;
  pos: string;
}

export interface KuromojiTokenizer {
  tokenize(text: string): KuromojiToken[];
}

// Metroのrequireは静的な文字列リテラルが必要なため、ファイルごとに列挙する。
const dictAssets = {
  base: require("../../assets/kuromoji-dict/base.dat.gz"),
  check: require("../../assets/kuromoji-dict/check.dat.gz"),
  tid: require("../../assets/kuromoji-dict/tid.dat.gz"),
  tid_pos: require("../../assets/kuromoji-dict/tid_pos.dat.gz"),
  tid_map: require("../../assets/kuromoji-dict/tid_map.dat.gz"),
  cc: require("../../assets/kuromoji-dict/cc.dat.gz"),
  unk: require("../../assets/kuromoji-dict/unk.dat.gz"),
  unk_pos: require("../../assets/kuromoji-dict/unk_pos.dat.gz"),
  unk_map: require("../../assets/kuromoji-dict/unk_map.dat.gz"),
  unk_char: require("../../assets/kuromoji-dict/unk_char.dat.gz"),
  unk_compat: require("../../assets/kuromoji-dict/unk_compat.dat.gz"),
  unk_invoke: require("../../assets/kuromoji-dict/unk_invoke.dat.gz"),
} as const;

type DictKey = keyof typeof dictAssets;

async function loadArrayBuffer(key: DictKey): Promise<ArrayBuffer> {
  const asset = Asset.fromModule(dictAssets[key]);
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  const file = new File(uri);
  const gzipped = await file.arrayBuffer();
  const decompressed = pako.ungzip(new Uint8Array(gzipped));
  // decompressedのバッファは元のUint8Arrayと同じArrayBufferを共有しているため、
  // byteOffset/byteLengthを反映したコピーを返す。
  return decompressed.buffer.slice(
    decompressed.byteOffset,
    decompressed.byteOffset + decompressed.byteLength
  );
}

let tokenizerPromise: Promise<KuromojiTokenizer> | null = null;

export function getKuromojiTokenizer(): Promise<KuromojiTokenizer> {
  if (!tokenizerPromise) {
    tokenizerPromise = buildTokenizer();
  }
  return tokenizerPromise;
}

async function buildTokenizer(): Promise<KuromojiTokenizer> {
  const dic = new DynamicDictionaries();

  const [base, check] = await Promise.all([
    loadArrayBuffer("base"),
    loadArrayBuffer("check"),
  ]);
  dic.loadTrie(new Int32Array(base), new Int32Array(check));

  const [tid, tidPos, tidMap] = await Promise.all([
    loadArrayBuffer("tid"),
    loadArrayBuffer("tid_pos"),
    loadArrayBuffer("tid_map"),
  ]);
  dic.loadTokenInfoDictionaries(
    new Uint8Array(tid),
    new Uint8Array(tidPos),
    new Uint8Array(tidMap)
  );

  const cc = await loadArrayBuffer("cc");
  dic.loadConnectionCosts(new Int16Array(cc));

  const [unk, unkPos, unkMap, unkChar, unkCompat, unkInvoke] =
    await Promise.all([
      loadArrayBuffer("unk"),
      loadArrayBuffer("unk_pos"),
      loadArrayBuffer("unk_map"),
      loadArrayBuffer("unk_char"),
      loadArrayBuffer("unk_compat"),
      loadArrayBuffer("unk_invoke"),
    ]);
  dic.loadUnknownDictionaries(
    new Uint8Array(unk),
    new Uint8Array(unkPos),
    new Uint8Array(unkMap),
    new Uint8Array(unkChar),
    new Uint32Array(unkCompat),
    new Uint8Array(unkInvoke)
  );

  return new Tokenizer(dic) as KuromojiTokenizer;
}
