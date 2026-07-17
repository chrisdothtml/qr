/**
 * Builds the static site into ./dist:
 * - index.html: SSR'd from ./src/index.html.tsx
 * - index.js + index.css: bundled from ./src/index.ts
 *
 * Run via `yarn build`
 */

/** */
import * as esbuild from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const repoRootDir = path.join(import.meta.dirname, '../..');
const distDir = path.join(repoRootDir, 'dist');
// kept in-repo so `react` resolves from node_modules when imported
const ssrTmpDir = path.join(repoRootDir, 'node_modules/.cache/ssr');

await main();
async function main() {
  await fs.rm(distDir, { recursive: true, force: true });
  await Promise.all([buildHtml(), buildClientAssets()]);
  console.log('built site to dist/');
}

async function buildHtml() {
  try {
    // node can't import .tsx files directly, so the Page component
    // gets bundled to js first
    await esbuild.build({
      entryPoints: [path.join(repoRootDir, 'src/index.html.tsx')],
      bundle: true,
      format: 'esm',
      loader: { '.svg': 'text' },
      packages: 'external',
      platform: 'node',
      outdir: ssrTmpDir,
    });

    const { Page } = await import(
      pathToFileURL(path.join(ssrTmpDir, 'index.html.js')).href
    );
    const html = `<!doctype html>\n${renderToStaticMarkup(createElement(Page))}`;
    await fs.mkdir(distDir, { recursive: true });
    await fs.writeFile(path.join(distDir, 'index.html'), html);
  } finally {
    await fs.rm(ssrTmpDir, { recursive: true, force: true });
  }
}

async function buildClientAssets() {
  await esbuild.build({
    entryPoints: [path.join(repoRootDir, 'src/index.ts')],
    bundle: true,
    format: 'esm',
    minify: true,
    outdir: distDir,
  });
}
