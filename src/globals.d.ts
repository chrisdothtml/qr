// non-ts imports, handled by esbuild loaders
declare module '*.css';
declare module '*.svg' {
  const content: string;
  export default content;
}
