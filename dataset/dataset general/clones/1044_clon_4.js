class AudioBlobCreator {
  static standardSettings = {
    channelCount: 1, // mono
    samplingRate: 22050, // 22050 Hz
    byteDepth: 2, // 16 bit
    performClipping: true
  };

  constructor(sampleCount, configuration) {
    if (!Number.isInteger(sampleCount) || sampleCount < 0) {
      throw new Error('Input sample count must be a non-negative integer.');
    }

    this.sampleCount = sampleCount;
    configuration = configuration || {};

    const standard = AudioBlobCreator.standardSettings;
    this.byteDepth = configuration.byteDepth !== undefined ? configuration.byteDepth : standard.byteDepth;
    this.channelCount = configuration.channelCount !== undefined ? configuration.channelCount : standard.channelCount;
    this.samplingRate = configuration.samplingRate !== undefined ? configuration.samplingRate : standard.samplingRate;
    this.performClipping = configuration.performClipping !== undefined ? !!configuration.performClipping : standard.performClipping;

    const formatIdentifier = 1; // PCM format
    this.bitDepth = this.byteDepth * 8;
    this.bitrate = this.samplingRate * this.byteDepth * this.channelCount;
    this.blockAlignment = this.channelCount * this.byteDepth;

    const formatChunkSize = 16;
    this.audioDataLength = this.sampleCount * this.byteDepth * this.channelCount;
    this.mainChunkSize = 4 + (8 + formatChunkSize) + (8 + this.audioDataLength); // RIFF chunk size (total file size - 8)

    // Total buffer size for the entire WAV file
    const totalBufferSize = this.mainChunkSize + 8; // +8 for 'RIFF' identifier and mainChunkSize field itself

    this.dataBuffer = new ArrayBuffer(totalBufferSize);
    this.dataView = new DataView(this.dataBuffer);

    // Write WAV header immediately upon construction
    this._fillHeader(formatIdentifier, formatChunkSize);

    // Assign sample processing function based on byteDepth
    switch (this.byteDepth) {
      case 1:
        this._currentSampleProcessor = this._processEightBit;
        break;
      case 2:
        this._currentSampleProcessor = this._processSixteenBit;
        break;
      default:
        throw new Error(`Unsupported byte depth: ${this.byteDepth}`);
    }
  }

  // --- Header writing utilities ---
  _writeStringBytes(view, offset, str) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
    return offset + str.length;
  }

  _writeShortInteger(view, offset, value) {
    view.setUint16(offset, value, true); // true for little-endian
    return offset + 2;
  }

  _writeLongInteger(view, offset, value) {
    view.setUint32(offset, value, true); // true for little-endian
    return offset + 4;
  }

  _fillHeader(formatIdentifier, formatChunkSize) {
    let currentOffset = 0;

    // RIFF chunk
    currentOffset = this._writeStringBytes(this.dataView, currentOffset, 'RIFF');
    currentOffset = this._writeLongInteger(this.dataView, currentOffset, this.mainChunkSize);
    currentOffset = this._writeStringBytes(this.dataView, currentOffset, 'WAVE');

    // 'fmt ' sub-chunk
    currentOffset = this._writeStringBytes(this.dataView, currentOffset, 'fmt ');
    currentOffset = this._writeLongInteger(this.dataView, currentOffset, formatChunkSize);
    currentOffset = this._writeShortInteger(this.dataView, currentOffset, formatIdentifier);
    currentOffset = this._writeShortInteger(this.dataView, currentOffset, this.channelCount);
    currentOffset = this._writeLongInteger(this.dataView, currentOffset, this.samplingRate);
    currentOffset = this._writeLongInteger(this.dataView, currentOffset, this.bitrate);
    currentOffset = this._writeShortInteger(this.dataView, currentOffset, this.blockAlignment);
    currentOffset = this._writeShortInteger(this.dataView, currentOffset, this.bitDepth);

    // 'data' sub-chunk
    currentOffset = this._writeStringBytes(this.dataView, currentOffset, 'data');
    currentOffset = this._writeLongInteger(this.dataView, currentOffset, this.audioDataLength);

    this.audioDataOffset = currentOffset; // Store where audio data starts
  }

  // --- Sample processing methods ---
  _processEightBit(inputSamples) {
    if (inputSamples.length !== this.sampleCount) {
      throw new Error('Input sample array length mismatch.');
    }

    const currentView = this.dataView;
    const clippingEnabled = this.performClipping;
    const startOffset = this.audioDataOffset;
    const mathSquareRoot = Math.sqrt;
    const mathFloor = Math.floor;

    inputSamples.forEach((val, idx) => {
      let modifiedVal = val;
      if (clippingEnabled) {
        modifiedVal /= mathSquareRoot(1 + modifiedVal * modifiedVal);
      }
      // 8-bit samples are unsigned, range 0 to 255
      const integerSample = mathFloor(128 * (modifiedVal + 1));
      currentView.setUint8(startOffset + idx, integerSample);
    });
  }

  _processSixteenBit(inputSamples) {
    if (inputSamples.length !== this.sampleCount) {
      throw new Error('Input sample array length mismatch.');
    }

    const currentView = this.dataView;
    const clippingEnabled = this.performClipping;
    const startOffset = this.audioDataOffset;
    const mathSquareRoot = Math.sqrt;
    const mathFloor = Math.floor;

    inputSamples.forEach((val, idx) => {
      let modifiedVal = val;
      if (clippingEnabled) {
        modifiedVal /= mathSquareRoot(1 + modifiedVal * modifiedVal);
      }
      
      let sampleValue = mathFloor(32768 * modifiedVal); // Replicate original scaling
      if (sampleValue < 0) {
        sampleValue += 65536; // Replicate original "conversion to unsigned" bit pattern
      }
      
      // Store the 16-bit sample value (0 to 65535) as little-endian bytes.
      // This correctly replicates the original's behavior for values like 1.0/-1.0
      // which result in 32768 (0x8000), which is written as bytes 00 80.
      currentView.setUint16(startOffset + (idx * 2), sampleValue, true);
    });
  }

  // Main external method to process samples and get the URI
  processSamples(inputSamples) {
    this._currentSampleProcessor(inputSamples); // Populate the data buffer

    const byteCollection = new Uint8Array(this.dataBuffer);
    return AudioBlobCreator._encodeBytesToBase64(byteCollection);
  }

  // --- Standard Base64 encoding (static, operates on Uint8Array) ---
  static _encodeBytesToBase64(byteSequence) {
    const b64Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let output = ['data:audio/wav;base64,'];
    let i = 0;
    const dataLength = byteSequence.length;

    while (i < dataLength) {
      const b1 = byteSequence[i++];
      const b2 = byteSequence[i++];
      const b3 = byteSequence[i++];

      const val = (b1 << 16) | ((b2 || 0) << 8) | (b3 || 0);

      const enc1 = (val >> 18) & 0x3F;
      const enc2 = (val >> 12) & 0x3F;
      const enc3 = (val >> 6) & 0x3F;
      const enc4 = val & 0x3F;

      output.push(b64Alphabet[enc1]);
      output.push(b64Alphabet[enc2]);

      if (b2 !== undefined) {
        output.push(b64Alphabet[enc3]);
      } else {
        output.push('=');
      }

      if (b3 !== undefined) {
        output.push(b64Alphabet[enc4]);
      } else {
        output.push('=');
      }
    }
    return output.join('');
  }
}

// Static convenience method
AudioBlobCreator.makeBlob = (inputData, config) => {
  const processor = new AudioBlobCreator(inputData.length, config);
  return processor.processSamples(inputData);
};