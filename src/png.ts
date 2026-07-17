/**
 * For the given canvas element (with the image already loaded in),
 * render it to a png (attempting to compress it along the way) and
 * return its base64 data url
 */
export async function canvasToPng(canvas: HTMLCanvasElement): Promise<string> {
  try {
    if (typeof CompressionStream === 'undefined') {
      throw new Error('Compression not supported in this browser');
    }

    // use a compressed png if possible
    return compressPng(canvas);
  } catch (_) {
    // fallback to basic canvas export
    return canvas.toDataURL('image/png');
  }
}

/**
 * Encodes a black-and-white canvas as a compact PNG data URL.
 *
 * `canvas.toDataURL` always spends 32 bits on every pixel (red, green, blue,
 * alpha). A QR code only has two colors, so instead we build the PNG file
 * ourselves and store each pixel as a single bit (0 = black, 1 = white),
 * making the result ~20x smaller with no visual difference.
 */
async function compressPng(canvas: HTMLCanvasElement): Promise<string> {
  const { width, height } = canvas;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  // the canvas's pixels as one flat array: 4 bytes (r, g, b, a) per pixel
  const rgba = ctx.getImageData(0, 0, width, height).data;

  // Step 1: repack the pixels at 1 bit each, 8 pixels per byte, plus one
  // extra "filter type" byte that PNG requires at the start of every row
  // (0 = raw pixels, no filtering)
  const bytesPerRow = 1 + Math.ceil(width / 8);
  const raw = new Uint8Array(bytesPerRow * height);
  for (let y = 0; y < height; y++) {
    // + 1 skips the filter type byte
    const rowStart = y * bytesPerRow + 1;
    for (let x = 0; x < width; x++) {
      // every pixel is pure black or pure white, so checking one color
      // channel (red) is enough to tell which
      const isWhite = rgba[(y * width + x) * 4] >= 128;
      if (isWhite) {
        // flip this pixel's bit to 1; the buffer starts all-zero, so black
        // pixels need no write. `x >> 3` is x / 8 (which byte of the row
        // holds this pixel) and `x & 7` is x % 8 (which of that byte's 8
        // bits, counting from the leftmost/highest bit)
        raw[rowStart + (x >> 3)] |= 0x80 >> (x & 7);
      }
    }
  }

  // Step 2: compress the pixel bytes. PNG stores them in "zlib" format,
  // which is exactly what the browser's built-in CompressionStream produces
  const idat = new Uint8Array(
    await new Response(
      new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate'))
    ).arrayBuffer()
  );

  // Step 3: build the IHDR header chunk, which describes the image:
  // dimensions, bits per pixel, and how to interpret them
  const ihdr = new Uint8Array(13);
  const view = new DataView(ihdr.buffer);
  view.setUint32(0, width);
  view.setUint32(4, height);
  // bit depth: 1 bit per pixel
  ihdr[8] = 1;
  // color type: grayscale (bytes 10-12 stay 0: default settings)
  ihdr[9] = 0;

  // Step 4: assemble the file. A PNG is just an 8-byte signature (a fixed
  // magic number identifying the file type) followed by a list of chunks:
  // IHDR (header), IDAT (compressed pixels), and IEND (end marker)
  const png = concatBytes([
    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', new Uint8Array(0)),
  ]);

  // Step 5: wrap the file bytes into a base64 data URL usable as an img src
  let binary = '';
  for (const byte of png) binary += String.fromCharCode(byte);
  return `data:image/png;base64,${btoa(binary)}`;
}

/**
 * Wraps `data` in PNG's chunk format. Every section of a PNG file uses the
 * same framing: the data's length (4 bytes), a 4-letter name saying what
 * kind of chunk it is (e.g. "IHDR"), the data itself, then a checksum of
 * the name + data so readers can detect corruption.
 */
function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const chunk = new Uint8Array(12 + data.length);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) chunk[4 + i] = type.charCodeAt(i);
  chunk.set(data, 8);
  view.setUint32(8 + data.length, crc32(chunk.subarray(4, 8 + data.length)));
  return chunk;
}

let crcTable: Uint32Array | undefined;
/**
 * Computes a CRC-32 checksum — the error-detection code the PNG format
 * requires on every chunk. This is the standard table-driven
 * implementation from the PNG spec; the table of per-byte results is
 * built once and cached.
 */
function crc32(bytes: Uint8Array): number {
  if (!crcTable) {
    crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcTable[n] = c;
    }
  }
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Joins byte arrays into one
 */
function concatBytes(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((sum, p) => sum + p.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}
