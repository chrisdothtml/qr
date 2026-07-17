import qrCode from 'qrcode-generator';
import './index.css';
import { canvasToPng } from './png.ts';

main();
function main() {
  const input = document.getElementById('data-input') as HTMLInputElement;
  const btn = document.getElementById('generate-btn') as HTMLButtonElement;
  const result = document.getElementById('result') as HTMLDivElement;
  const output = document.getElementById('qr-output') as HTMLDivElement;

  async function generate() {
    const value = input.value.trim();
    if (!value) {
      input.focus();
      return;
    }

    try {
      output.replaceChildren(await createQRImage(value));
      window.location.hash = encodeURIComponent(value);
    } catch (_) {
      const errorMsg = 'Could not encode — try shorter input.';
      output.innerHTML = `<p style="font-family:'DM Mono',monospace;font-size:12px;color:var(--ink-mid);padding:8px 0">${errorMsg}</p>`;
    } finally {
      result.classList.add('visible');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const urlInput = window.location.hash.slice(1);
    if (urlInput) {
      input.value = decodeURIComponent(urlInput);
      generate().catch(() => {});
    }

    input.focus();
  });

  btn.addEventListener('click', () => generate().catch(() => {}));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') generate().catch(() => {});
  });
}

/**
 * Renders `text` as a QR code and returns it as an `<img>` element
 */
async function createQRImage(text: string): Promise<HTMLImageElement> {
  const qr = qrCode(0, 'L');
  qr.addData(text);
  qr.make();

  const scale = 2;
  const cellSize = 10;
  const margin = 9;
  const size = qr.getModuleCount() * cellSize + margin * 2;

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size * scale;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.scale(scale, scale);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);
  ctx.translate(margin, margin);

  qr.renderTo2dContext(ctx, cellSize);

  const img = new Image();
  img.width = img.height = size;
  img.alt = 'QR code';
  img.src = await canvasToPng(canvas);

  return img;
}
