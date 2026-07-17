import qrCode from 'https://unpkg.com/qrcode-generator@2.0.4/dist/qrcode.mjs';

const input = /** @type {HTMLInputElement} */ (
  document.getElementById('data-input')
);
const btn = /** @type {HTMLButtonElement} */ (
  document.getElementById('generate-btn')
);
const result = /** @type {HTMLDivElement} */ (
  document.getElementById('result')
);
const output = /** @type {HTMLDivElement} */ (
  document.getElementById('qr-output')
);

document.addEventListener('DOMContentLoaded', () => {
  input.focus();
});

btn.addEventListener('click', generate);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') generate();
});

function generate() {
  const value = input.value.trim();
  if (!value) {
    input.focus();
    return;
  }

  try {
    output.replaceChildren(createQRImageTag(value));
  } catch (_) {
    const errorMsg = 'Could not encode — try shorter input.';
    output.innerHTML = `<p style="font-family:\'DM Mono\',monospace;font-size:12px;color:var(--ink-mid);padding:8px 0">${errorMsg}</p>`;
  } finally {
    result.classList.add('visible');
  }
}

/**
 * @param {string} text
 * @returns {HTMLImageElement}
 */
function createQRImageTag(text) {
  const qr = qrCode(0, 'L');
  qr.addData(text);
  qr.make();

  const scale = 2;
  const cellSize = 10;
  const margin = 9;
  const size = qr.getModuleCount() * cellSize + margin * 2;

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size * scale;
  const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
  ctx.scale(scale, scale);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);
  ctx.translate(margin, margin);

  qr.renderTo2dContext(ctx, cellSize);

  const img = new Image();
  img.width = img.height = size;
  img.alt = 'QR code';
  img.src = canvas.toDataURL('image/png');

  return img;
}
