declare module "*.gz" {
  const value: number;
  export default value;
}

declare module "kuromoji/src/dict/DynamicDictionaries" {
  const DynamicDictionaries: any;
  export = DynamicDictionaries;
}

declare module "kuromoji/src/Tokenizer" {
  const Tokenizer: any;
  export = Tokenizer;
}
