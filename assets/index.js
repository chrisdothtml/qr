import qrCode from 'https://unpkg.com/qrcode-generator@2.0.4/dist/qrcode.mjs';

const input = document.getElementById('data-input');
const btn = document.getElementById('generate-btn');
const result = document.getElementById('result');
const output = document.getElementById('qr-output');

function generate() {
  const val = input.value.trim();
  if (!val) {
    input.focus();
    return;
  }

  try {
    const qr = qrCode(0, 'L');
    qr.addData(val);
    qr.make();
    output.innerHTML = qr.createImgTag(10, 10);
    result.classList.add('visible');
  } catch (e) {
    // data too large — show a brief inline note
    output.innerHTML =
      '<p style="font-family:\'DM Mono\',monospace;font-size:12px;color:var(--ink-mid);padding:8px 0">Could not encode — try shorter input.</p>';
    result.classList.add('visible');
  }
}

btn.addEventListener('click', generate);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') generate();
});
