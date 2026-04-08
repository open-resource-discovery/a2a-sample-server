#!/usr/bin/env node
/**
 * Generate minimal valid sample media files for the Media Showcase agent.
 * All files are original creations — no copyright issues.
 *
 * Run: node scripts/generate-media.mjs
 */
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import zlib from "zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mediaDir = join(__dirname, "..", "public", "media");
mkdirSync(mediaDir, { recursive: true });

// ─── JPEG ──────────────────────────────────────────────
// Minimal baseline JPEG encoder for small solid-color images.
// Encodes an 8x8 block of a single color as a valid JFIF JPEG.
function createJpeg() {
  const width = 8;
  const height = 8;
  // Solid steel-blue color: R=70, G=130, B=180
  const R = 70, G = 130, B = 180;

  // Convert RGB to YCbCr
  const Y  = Math.round( 0.299 * R + 0.587 * G + 0.114 * B);
  const Cb = Math.round(-0.169 * R - 0.331 * G + 0.500 * B + 128);
  const Cr = Math.round( 0.500 * R - 0.419 * G - 0.081 * B + 128);

  // Standard luminance quantization table
  const lumQuant = [
    16,11,10,16,24,40,51,61,  12,12,14,19,26,58,60,55,
    14,13,16,24,40,57,69,56,  14,17,22,29,51,87,80,62,
    18,22,37,56,68,109,103,77, 24,35,55,64,81,104,113,92,
    49,64,78,87,103,121,120,101, 72,92,95,98,112,100,103,99,
  ];
  // Standard chrominance quantization table
  const chrQuant = [
    17,18,24,47,99,99,99,99,  18,21,26,66,99,99,99,99,
    24,26,56,99,99,99,99,99,  47,66,99,99,99,99,99,99,
    99,99,99,99,99,99,99,99,  99,99,99,99,99,99,99,99,
    99,99,99,99,99,99,99,99,  99,99,99,99,99,99,99,99,
  ];

  // Zigzag order
  const zigzag = [
    0,1,8,16,9,2,3,10,17,24,32,25,18,11,4,5,12,19,26,33,40,48,41,34,27,20,13,6,7,14,21,28,
    35,42,49,56,57,50,43,36,29,22,15,23,30,37,44,51,58,59,52,45,38,31,39,46,53,60,61,54,47,55,62,63,
  ];

  // Standard DC & AC Huffman tables for luminance and chrominance
  const dcLumBits  = [0,0,1,5,1,1,1,1,1,1,0,0,0,0,0,0,0];
  const dcLumVals  = [0,1,2,3,4,5,6,7,8,9,10,11];
  const acLumBits  = [0,0,2,1,3,3,2,4,3,5,5,4,4,0,0,1,0x7d];
  const acLumVals  = [
    0x01,0x02,0x03,0x00,0x04,0x11,0x05,0x12,0x21,0x31,0x41,0x06,0x13,0x51,0x61,0x07,
    0x22,0x71,0x14,0x32,0x81,0x91,0xa1,0x08,0x23,0x42,0xb1,0xc1,0x15,0x52,0xd1,0xf0,
    0x24,0x33,0x62,0x72,0x82,0x09,0x0a,0x16,0x17,0x18,0x19,0x1a,0x25,0x26,0x27,0x28,
    0x29,0x2a,0x34,0x35,0x36,0x37,0x38,0x39,0x3a,0x43,0x44,0x45,0x46,0x47,0x48,0x49,
    0x4a,0x53,0x54,0x55,0x56,0x57,0x58,0x59,0x5a,0x63,0x64,0x65,0x66,0x67,0x68,0x69,
    0x6a,0x73,0x74,0x75,0x76,0x77,0x78,0x79,0x7a,0x83,0x84,0x85,0x86,0x87,0x88,0x89,
    0x8a,0x92,0x93,0x94,0x95,0x96,0x97,0x98,0x99,0x9a,0xa2,0xa3,0xa4,0xa5,0xa6,0xa7,
    0xa8,0xa9,0xaa,0xb2,0xb3,0xb4,0xb5,0xb6,0xb7,0xb8,0xb9,0xba,0xc2,0xc3,0xc4,0xc5,
    0xc6,0xc7,0xc8,0xc9,0xca,0xd2,0xd3,0xd4,0xd5,0xd6,0xd7,0xd8,0xd9,0xda,0xe1,0xe2,
    0xe3,0xe4,0xe5,0xe6,0xe7,0xe8,0xe9,0xea,0xf1,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8,0xf9,0xfa,
  ];
  const dcChrBits  = [0,0,3,1,1,1,1,1,1,1,1,1,0,0,0,0,0];
  const dcChrVals  = [0,1,2,3,4,5,6,7,8,9,10,11];
  const acChrBits  = [0,0,2,1,2,4,4,3,4,7,5,4,4,0,1,2,0x77];
  const acChrVals  = [
    0x00,0x01,0x02,0x03,0x11,0x04,0x05,0x21,0x31,0x06,0x12,0x41,0x51,0x07,0x61,0x71,
    0x13,0x22,0x32,0x81,0x08,0x14,0x42,0x91,0xa1,0xb1,0xc1,0x09,0x23,0x33,0x52,0xf0,
    0x15,0x62,0x72,0xd1,0x0a,0x16,0x24,0x34,0xe1,0x25,0xf1,0x17,0x18,0x19,0x1a,0x26,
    0x27,0x28,0x29,0x2a,0x35,0x36,0x37,0x38,0x39,0x3a,0x43,0x44,0x45,0x46,0x47,0x48,
    0x49,0x4a,0x53,0x54,0x55,0x56,0x57,0x58,0x59,0x5a,0x63,0x64,0x65,0x66,0x67,0x68,
    0x69,0x6a,0x73,0x74,0x75,0x76,0x77,0x78,0x79,0x7a,0x82,0x83,0x84,0x85,0x86,0x87,
    0x88,0x89,0x8a,0x92,0x93,0x94,0x95,0x96,0x97,0x98,0x99,0x9a,0xa2,0xa3,0xa4,0xa5,
    0xa6,0xa7,0xa8,0xa9,0xaa,0xb2,0xb3,0xb4,0xb5,0xb6,0xb7,0xb8,0xb9,0xba,0xc2,0xc3,
    0xc4,0xc5,0xc6,0xc7,0xc8,0xc9,0xca,0xd2,0xd3,0xd4,0xd5,0xd6,0xd7,0xd8,0xd9,0xda,
    0xe2,0xe3,0xe4,0xe5,0xe6,0xe7,0xe8,0xe9,0xea,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8,0xf9,0xfa,
  ];

  // Build Huffman code tables
  function buildHuffTable(bits, vals) {
    const table = {};
    let code = 0, vi = 0;
    for (let len = 1; len <= 16; len++) {
      for (let i = 0; i < bits[len]; i++) {
        table[vals[vi]] = { code, len };
        vi++; code++;
      }
      code <<= 1;
    }
    return table;
  }
  const dcLumTable = buildHuffTable(dcLumBits, dcLumVals);
  const acLumTable = buildHuffTable(acLumBits, acLumVals);
  const dcChrTable = buildHuffTable(dcChrBits, dcChrVals);
  const acChrTable = buildHuffTable(acChrBits, acChrVals);

  // Bitstream writer
  let bitBuf = 0, bitCount = 0;
  const scanBytes = [];
  function writeBits(value, length) {
    bitBuf = (bitBuf << length) | (value & ((1 << length) - 1));
    bitCount += length;
    while (bitCount >= 8) {
      bitCount -= 8;
      const byte = (bitBuf >> bitCount) & 0xFF;
      scanBytes.push(byte);
      if (byte === 0xFF) scanBytes.push(0x00); // byte stuffing
    }
  }
  function flushBits() {
    if (bitCount > 0) {
      writeBits(0x7F, 7); // pad with 1s
    }
  }

  // Encode a single 8x8 block of uniform value
  function encodeBlock(dcVal, quant, dcTable, acTable) {
    // DCT of a uniform block: only DC coefficient is non-zero
    // DC coefficient = value * 8 (from DCT formula for 8x8 uniform block)
    const dcCoeff = Math.round((dcVal * 8) / quant[0]);

    // Encode DC
    const absDc = Math.abs(dcCoeff);
    let cat = 0;
    let tmp = absDc;
    while (tmp > 0) { cat++; tmp >>= 1; }
    const dcHuff = dcTable[cat];
    writeBits(dcHuff.code, dcHuff.len);
    if (cat > 0) {
      const dcBits = dcCoeff >= 0 ? dcCoeff : dcCoeff + (1 << cat) - 1;
      writeBits(dcBits, cat);
    }

    // Encode AC (all zeros for uniform block) — write EOB
    const eob = acTable[0x00]; // EOB marker
    writeBits(eob.code, eob.len);
  }

  // Encode the single MCU (1 block Y, 1 block Cb, 1 block Cr)
  encodeBlock(Y - 128, lumQuant, dcLumTable, acLumTable);
  encodeBlock(Cb - 128, chrQuant, dcChrTable, acChrTable);
  encodeBlock(Cr - 128, chrQuant, dcChrTable, acChrTable);
  flushBits();

  // Assemble JPEG file
  const parts = [];
  function w(...bytes) { parts.push(Buffer.from(bytes)); }
  function w16(v) { parts.push(Buffer.from([v >> 8, v & 0xFF])); }
  function wBuf(buf) { parts.push(Buffer.isBuffer(buf) ? buf : Buffer.from(buf)); }

  // SOI
  w(0xFF, 0xD8);
  // APP0 JFIF
  w(0xFF, 0xE0); w16(16);
  wBuf([0x4A,0x46,0x49,0x46,0x00, 0x01,0x01, 0x00, 0x00,0x01, 0x00,0x01, 0x00,0x00]);

  // DQT (two tables)
  function writeDQT(id, table) {
    w(0xFF, 0xDB); w16(67);
    w(id);
    for (let i = 0; i < 64; i++) wBuf([table[zigzag[i]]]);
  }
  writeDQT(0, lumQuant);
  writeDQT(1, chrQuant);

  // SOF0
  w(0xFF, 0xC0); w16(17);
  w(8); // precision
  w16(height); w16(width);
  w(3); // components
  w(1, 0x11, 0); // Y: id=1, sampling=1x1, quant=0
  w(2, 0x11, 1); // Cb: id=2, sampling=1x1, quant=1
  w(3, 0x11, 1); // Cr: id=3, sampling=1x1, quant=1

  // DHT
  function writeDHT(cls, id, bits, vals) {
    const len = 19 + vals.length;
    w(0xFF, 0xC4); w16(len);
    w((cls << 4) | id);
    for (let i = 1; i <= 16; i++) wBuf([bits[i]]);
    wBuf(vals);
  }
  writeDHT(0, 0, dcLumBits, dcLumVals);
  writeDHT(1, 0, acLumBits, acLumVals);
  writeDHT(0, 1, dcChrBits, dcChrVals);
  writeDHT(1, 1, acChrBits, acChrVals);

  // SOS
  w(0xFF, 0xDA); w16(12);
  w(3); // components
  w(1, 0x00); // Y:  DC=0, AC=0
  w(2, 0x11); // Cb: DC=1, AC=1
  w(3, 0x11); // Cr: DC=1, AC=1
  w(0, 63, 0); // Ss, Se, AhAl

  // Scan data
  wBuf(scanBytes);

  // EOI
  w(0xFF, 0xD9);

  return Buffer.concat(parts);
}

// ─── PNG ──────────────────────────────────────────────
// Minimal valid PNG: 4x4 green pixels
function createPng() {
  const width = 4;
  const height = 4;

  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = pngChunk("IHDR", ihdrData);

  // IDAT chunk - raw image data
  // Each row: filter byte (0) + RGB pixels
  const rawData = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 3);
    rawData[rowOffset] = 0; // no filter
    for (let x = 0; x < width; x++) {
      const pixOffset = rowOffset + 1 + x * 3;
      rawData[pixOffset] = 34;   // R
      rawData[pixOffset + 1] = 139; // G
      rawData[pixOffset + 2] = 34;  // B (forest green)
    }
  }
  const compressed = zlib.deflateSync(rawData);
  const idat = pngChunk("IDAT", compressed);

  // IEND chunk
  const iend = pngChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);

  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// ─── WAV (audio) ──────────────────────────────────────
// Generate a 1-second 440Hz sine wave as WAV (universally playable)
function createWav() {
  const sampleRate = 22050;
  const duration = 1; // seconds
  const numSamples = sampleRate * duration;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = numSamples * blockAlign;

  const buffer = Buffer.alloc(44 + dataSize);
  let offset = 0;

  // RIFF header
  buffer.write("RIFF", offset); offset += 4;
  buffer.writeUInt32LE(36 + dataSize, offset); offset += 4;
  buffer.write("WAVE", offset); offset += 4;

  // fmt sub-chunk
  buffer.write("fmt ", offset); offset += 4;
  buffer.writeUInt32LE(16, offset); offset += 4; // sub-chunk size
  buffer.writeUInt16LE(1, offset); offset += 2;  // PCM format
  buffer.writeUInt16LE(numChannels, offset); offset += 2;
  buffer.writeUInt32LE(sampleRate, offset); offset += 4;
  buffer.writeUInt32LE(byteRate, offset); offset += 4;
  buffer.writeUInt16LE(blockAlign, offset); offset += 2;
  buffer.writeUInt16LE(bitsPerSample, offset); offset += 2;

  // data sub-chunk
  buffer.write("data", offset); offset += 4;
  buffer.writeUInt32LE(dataSize, offset); offset += 4;

  // Generate 440 Hz sine wave
  const frequency = 440;
  const amplitude = 16000;
  for (let i = 0; i < numSamples; i++) {
    const sample = Math.round(amplitude * Math.sin(2 * Math.PI * frequency * i / sampleRate));
    buffer.writeInt16LE(sample, offset);
    offset += 2;
  }

  return buffer;
}

// ─── MP4 (video) ──────────────────────────────────────
// Minimal valid MP4 container with a single video frame
// This creates a valid MP4 that browsers recognize and can display
function createMp4() {
  // Build a minimal MP4 with ftyp + moov + mdat boxes
  // Contains a single 2x2 H.264 baseline video frame

  function box(type, ...children) {
    const typeBuffer = Buffer.from(type, "ascii");
    const content = Buffer.concat(children.map(c => Buffer.isBuffer(c) ? c : Buffer.from([])));
    const size = Buffer.alloc(4);
    size.writeUInt32BE(8 + content.length, 0);
    return Buffer.concat([size, typeBuffer, content]);
  }

  function fullBox(type, version, flags, ...children) {
    const vf = Buffer.alloc(4);
    vf.writeUInt8(version, 0);
    vf.writeUInt8((flags >> 16) & 0xff, 1);
    vf.writeUInt8((flags >> 8) & 0xff, 2);
    vf.writeUInt8(flags & 0xff, 3);
    const content = Buffer.concat([vf, ...children.map(c => Buffer.isBuffer(c) ? c : Buffer.from([]))]);
    const typeBuffer = Buffer.from(type, "ascii");
    const size = Buffer.alloc(4);
    size.writeUInt32BE(8 + content.length, 0);
    return Buffer.concat([size, typeBuffer, content]);
  }

  // ftyp box
  const ftyp = box("ftyp",
    Buffer.from("isom"),     // major brand
    Buffer.from([0, 0, 0, 0]), // minor version
    Buffer.from("isomiso2mp41") // compatible brands
  );

  // Minimal H.264 NAL unit (SPS + PPS + IDR slice for a 2x2 frame)
  // This is a minimal valid H.264 baseline stream
  const sps = Buffer.from([
    0x67, 0x42, 0xc0, 0x0a, 0xd9, 0x07, 0x3c, 0x04, 0x40, 0x00, 0x00, 0x03,
    0x00, 0x40, 0x00, 0x00, 0x0c, 0x83, 0xc5, 0x8b, 0xa8
  ]);
  const pps = Buffer.from([0x68, 0xce, 0x38, 0x80]);
  const idr = Buffer.from([
    0x65, 0x88, 0x80, 0x40, 0x00, 0x7e, 0xbf, 0xfe, 0xf7, 0xbf, 0xa0
  ]);

  // Wrap NAL units with start codes for mdat
  function nalUnit(nal) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(nal.length, 0);
    return Buffer.concat([len, nal]);
  }

  const sampleData = Buffer.concat([nalUnit(sps), nalUnit(pps), nalUnit(idr)]);

  // mdat box
  const mdat = box("mdat", sampleData);

  // Build moov box
  const timeScale = 1000;
  const duration = 1000; // 1 second

  // mvhd
  const mvhdData = Buffer.alloc(96);
  mvhdData.writeUInt32BE(timeScale, 12);  // timescale
  mvhdData.writeUInt32BE(duration, 16);   // duration
  mvhdData.writeUInt32BE(0x00010000, 20); // rate (1.0)
  mvhdData.writeUInt16BE(0x0100, 24);     // volume (1.0)
  // Matrix (identity)
  mvhdData.writeUInt32BE(0x00010000, 36);
  mvhdData.writeUInt32BE(0x00010000, 52);
  mvhdData.writeUInt32BE(0x40000000, 68);
  mvhdData.writeUInt32BE(2, 92); // next track ID
  const mvhd = fullBox("mvhd", 0, 0, mvhdData);

  // tkhd
  const tkhdData = Buffer.alloc(80);
  tkhdData.writeUInt32BE(1, 0);          // track ID
  tkhdData.writeUInt32BE(duration, 8);   // duration
  tkhdData.writeUInt32BE(0x00010000, 36); // matrix
  tkhdData.writeUInt32BE(0x00010000, 52);
  tkhdData.writeUInt32BE(0x40000000, 68);
  tkhdData.writeUInt32BE(0x00020000, 72); // width (2.0 fixed point)
  tkhdData.writeUInt32BE(0x00020000, 76); // height (2.0 fixed point)
  const tkhd = fullBox("tkhd", 0, 3, tkhdData);

  // mdhd
  const mdhdData = Buffer.alloc(20);
  mdhdData.writeUInt32BE(timeScale, 4);  // timescale
  mdhdData.writeUInt32BE(duration, 8);   // duration
  const mdhd = fullBox("mdhd", 0, 0, mdhdData);

  // hdlr
  const hdlrData = Buffer.concat([
    Buffer.alloc(4),         // pre-defined
    Buffer.from("vide"),     // handler type
    Buffer.alloc(12),        // reserved
    Buffer.from("VideoHandler\0") // name
  ]);
  const hdlr = fullBox("hdlr", 0, 0, hdlrData);

  // vmhd
  const vmhd = fullBox("vmhd", 0, 1, Buffer.alloc(8));

  // dinf > dref
  const drefEntry = fullBox("url ", 0, 1);
  const drefData = Buffer.concat([Buffer.from([0, 0, 0, 1]), drefEntry]); // entry count + entry
  const dref = fullBox("dref", 0, 0, drefData);
  const dinf = box("dinf", dref);

  // stsd (sample description - avc1)
  const avcC = Buffer.concat([
    Buffer.from([
      0x01,       // configurationVersion
      0x42,       // AVCProfileIndication (baseline)
      0xc0,       // profile_compatibility
      0x0a,       // AVCLevelIndication
      0xff,       // lengthSizeMinusOne = 3 (4 bytes)
      0xe1,       // numOfSequenceParameterSets = 1
    ]),
    // SPS
    Buffer.from([0, sps.length]), sps,
    // PPS
    Buffer.from([1, 0, pps.length]), pps,
  ]);
  const avcCBox = box("avcC", avcC);

  const avc1Data = Buffer.concat([
    Buffer.alloc(6),             // reserved
    Buffer.from([0, 1]),         // data reference index
    Buffer.alloc(16),            // pre-defined + reserved
    Buffer.from([0, 2]),         // width = 2
    Buffer.from([0, 2]),         // height = 2
    Buffer.from([0, 0x48, 0, 0]), // horiz resolution 72 dpi
    Buffer.from([0, 0x48, 0, 0]), // vert resolution 72 dpi
    Buffer.alloc(4),             // reserved
    Buffer.from([0, 1]),         // frame count
    Buffer.alloc(32),            // compressor name
    Buffer.from([0, 0x18]),      // depth = 24
    Buffer.from([0xff, 0xff]),   // pre-defined
    avcCBox,
  ]);

  const stsdEntryCount = Buffer.alloc(4);
  stsdEntryCount.writeUInt32BE(1, 0);
  const avc1Box = box("avc1", avc1Data);
  const stsd = fullBox("stsd", 0, 0, Buffer.concat([stsdEntryCount, avc1Box]));

  // stts
  const sttsData = Buffer.alloc(8);
  sttsData.writeUInt32BE(1, 0); // entry count
  sttsData.writeUInt32BE(duration, 4); // sample duration
  const stts = fullBox("stts", 0, 0, sttsData);

  // stsc
  const stscData = Buffer.alloc(12);
  stscData.writeUInt32BE(1, 0); // entry count
  stscData.writeUInt32BE(1, 4); // first chunk
  stscData.writeUInt32BE(1, 8); // samples per chunk
  const stsc = fullBox("stsc", 0, 0, stscData);

  // stsz
  const stszData = Buffer.alloc(8);
  stszData.writeUInt32BE(sampleData.length, 0); // sample size
  stszData.writeUInt32BE(1, 4); // sample count
  const stsz = fullBox("stsz", 0, 0, stszData);

  // stco (chunk offset - will be patched)
  const stcoData = Buffer.alloc(8);
  stcoData.writeUInt32BE(1, 0); // entry count
  // offset will be: ftyp.length + moov.length + 8 (mdat header)
  // We'll set a placeholder and patch after
  stcoData.writeUInt32BE(0, 4); // placeholder
  const stco = fullBox("stco", 0, 0, stcoData);

  // stss (sync sample)
  const stssData = Buffer.alloc(8);
  stssData.writeUInt32BE(1, 0); // entry count
  stssData.writeUInt32BE(1, 4); // sample 1 is sync
  const stss = fullBox("stss", 0, 0, stssData);

  const stbl = box("stbl", stsd, stts, stsc, stsz, stco, stss);
  const minf = box("minf", vmhd, dinf, stbl);
  const mdia = box("mdia", mdhd, hdlr, minf);
  const trak = box("trak", tkhd, mdia);
  const moov = box("moov", mvhd, trak);

  // Patch stco offset: ftyp.length + moov.length + 8 (mdat box header)
  const result = Buffer.concat([ftyp, moov, mdat]);
  const chunkOffset = ftyp.length + moov.length + 8;

  // Find stco in the result and patch the offset
  // stco contains: size(4) + "stco"(4) + version+flags(4) + count(4) + offset(4)
  for (let i = 0; i < result.length - 4; i++) {
    if (result[i] === 0x73 && result[i + 1] === 0x74 && result[i + 2] === 0x63 && result[i + 3] === 0x6f) {
      // Found "stco" at position i, offset value is at i + 12
      result.writeUInt32BE(chunkOffset, i + 12);
      break;
    }
  }

  return result;
}

// ─── Generate all files ────────────────────────────────

console.log("Generating sample media files...\n");

try {
  const jpegBuf = createJpeg();
  writeFileSync(join(mediaDir, "sample-image.jpg"), jpegBuf);
  console.log(`  sample-image.jpg  (${jpegBuf.length} bytes)`);
} catch (e) {
  console.error("  Failed to create JPEG:", e.message);
}

try {
  const pngBuf = createPng();
  writeFileSync(join(mediaDir, "sample-image.png"), pngBuf);
  console.log(`  sample-image.png  (${pngBuf.length} bytes)`);
} catch (e) {
  console.error("  Failed to create PNG:", e.message);
}

try {
  const wavBuf = createWav();
  writeFileSync(join(mediaDir, "sample-audio.wav"), wavBuf);
  console.log(`  sample-audio.wav  (${wavBuf.length} bytes)`);
} catch (e) {
  console.error("  Failed to create WAV:", e.message);
}

try {
  const mp4Buf = createMp4();
  writeFileSync(join(mediaDir, "sample-video.mp4"), mp4Buf);
  console.log(`  sample-video.mp4  (${mp4Buf.length} bytes)`);
} catch (e) {
  console.error("  Failed to create MP4:", e.message);
}

console.log("\nDone! Files saved to public/media/");
