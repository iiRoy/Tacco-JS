var AudioStreamConverterModule = (function(){

  // Custom error class for audio processing issues
  var AudioDataProcessorError = function (infoMessage) {
    this.message = infoMessage || '(no specific message provided)';
    this.name = "AudioDataProcessorError";
  };
  AudioDataProcessorError.prototype = Object.create(Error.prototype);
  AudioDataProcessorError.prototype.constructor = AudioDataProcessorError;
  AudioDataProcessorError.prototype.toString = function () {
    return this.name + ': ' + this.message;
  };

  // Utility to assert conditions
  var verifyCondition = function (assertionResult, failureMessage) {
    if (!assertionResult) {
      throw new AudioDataProcessorError(failureMessage);
    }
  };

  // Utility to confirm equality, with detailed message on mismatch
  var confirmValueMatch = function (actualValue, expectedValue, customMessage) {
    var stringifiedActual = (typeof actualValue === 'string') ? actualValue : JSON.stringify(actualValue);
    var stringifiedExpected = (typeof expectedValue === 'string') ? expectedValue : JSON.stringify(expectedValue);

    verifyCondition(stringifiedActual === stringifiedExpected,
      (customMessage ? customMessage + '\n' : '') +
      '  Actual value: ' + stringifiedActual +
      '\n  Expected value: ' + stringifiedExpected);
  };

  /**
   * @class AudioStreamConverter
   * @description Manages the conversion of floating-point audio samples into a Base64-encoded WAV data URI.
   *              This implementation is optimized for Web Workers by avoiding `window.btoa`.
   */
  var AudioStreamConverter = function (totalSampleCount, initialSettings) {

    // Store the total number of samples for validation during encoding.
    this.totalSampleCount = totalSampleCount;

    // Merge provided settings with default configuration.
    var currentSettings = initialSettings || {};
    var defaultConfiguration = AudioStreamConverter.defaultConfiguration;

    // Validate essential parameters and apply defaults.
    verifyCondition(totalSampleCount > 0, "Total sample count must be a positive number.");
    var samplingResolutionBits = currentSettings.bitDepth || defaultConfiguration.bitDepth;
    var channelCount = currentSettings.channelCount || defaultConfiguration.channelCount;
    var audioSampleRate = currentSettings.sampleRate || defaultConfiguration.sampleRate;
    this.performClipping = 'applyClipping' in currentSettings ? !!currentSettings.applyClipping : defaultConfiguration.applyClipping;

    // Derived audio format constants.
    var pcmFormatTag = 1; // PCM audio format
    var bytesPerAudioSample = samplingResolutionBits / 8;
    verifyCondition(bytesPerAudioSample === 1 || bytesPerAudioSample === 2,
      "Unsupported bit depth: " + samplingResolutionBits + " bits. Only 8-bit or 16-bit are supported.");

    var overallByteRate = audioSampleRate * bytesPerAudioSample * channelCount;
    var blockAlignment = channelCount * bytesPerAudioSample;

    // WAV header chunk sizes.
    var formatChunkSize = 16;
    var dataPayloadByteSize = totalSampleCount * bytesPerAudioSample * channelCount;
    var mainChunkTotalSize = 4 + (8 + formatChunkSize) + (8 + dataPayloadByteSize);

    // Internal helper functions for writing WAV header components.
    var stringToWordConverter = this._convertStringToWords;
    var uint16ToWordConverter = this._encode16BitValue;
    var uint32ToWordConverter = this._encode32BitValue;

    // Assign the appropriate sample encoding method based on bit depth.
    switch (bytesPerAudioSample) {
      case 1:
        this.processSamples = this._processEightBitMonoSamples;
        break;
      case 2:
        this.processSamples = this._processSixteenBitMonoSamples;
        break;
      default:
        throw new AudioDataProcessorError('An internal error occurred: Invalid bytesPerAudioSample after validation.');
    }

    // Construct the WAV header as an array of 16-bit words (for efficient Base64 conversion).
    var wavHeaderWords = [];

    // RIFF Chunk
    Array.prototype.push.apply(wavHeaderWords, stringToWordConverter('RIFF'));
    Array.prototype.push.apply(wavHeaderWords, uint32ToWordConverter(mainChunkTotalSize));
    Array.prototype.push.apply(wavHeaderWords, stringToWordConverter('WAVE'));

    // Format Subchunk
    Array.prototype.push.apply(wavHeaderWords, stringToWordConverter('fmt '));
    Array.prototype.push.apply(wavHeaderWords, uint32ToWordConverter(formatChunkSize));
    Array.prototype.push.apply(wavHeaderWords, uint16ToWordConverter(pcmFormatTag));
    Array.prototype.push.apply(wavHeaderWords, uint16ToWordConverter(channelCount));
    Array.prototype.push.apply(wavHeaderWords, uint32ToWordConverter(audioSampleRate));
    Array.prototype.push.apply(wavHeaderWords, uint32ToWordConverter(overallByteRate));
    Array.prototype.push.apply(wavHeaderWords, uint16ToWordConverter(blockAlignment));
    Array.prototype.push.apply(wavHeaderWords, uint16ToWordConverter(samplingResolutionBits));

    // Data Subchunk
    Array.prototype.push.apply(wavHeaderWords, stringToWordConverter('data'));
    Array.prototype.push.apply(wavHeaderWords, uint32ToWordConverter(dataPayloadByteSize));

    this.internalWordBuffer = wavHeaderWords; // Store the header words.

    var wordSizeInBytes = 2;
    var requiredDataWords = Math.ceil(dataPayloadByteSize / wordSizeInBytes);
    this.internalWordBuffer.length = this._headerWordCount + requiredDataWords; // Pre-allocate for data.

    // Ensure the total word count is a multiple of 3 for the custom Base64 encoding.
    while (this.internalWordBuffer.length % 3 !== 0) {
        this.internalWordBuffer.push(0);
    }
  };

  AudioStreamConverter.prototype = {

    _headerByteSize: 44, // Standard WAV header size in bytes.
    _headerWordCount: 22, // Corresponds to _headerByteSize / 2 for 16-bit words.

    /**
     * @private
     * @description Converts a string into an array of 16-bit words, assuming 2 chars per word.
     * @param {string} inputString - The string to convert.
     * @returns {number[]} Array of 16-bit word representations.
     */
    _convertStringToWords: function (inputString) {
      verifyCondition(inputString.length % 2 === 0, 'String length must be even for 16-bit word conversion.');
      var wordResults = [];
      for (var charIndex = 0, limit = inputString.length; charIndex < limit; charIndex += 2) {
        var charOneCode = inputString.charCodeAt(charIndex);
        var charTwoCode = inputString.charCodeAt(charIndex + 1);
        verifyCondition(charOneCode < 256 && charTwoCode < 256, 'Invalid character code found (must be < 256).');
        wordResults.push((charOneCode << 8) | charTwoCode);
      }
      return wordResults;
    },

    /**
     * @private
     * @description Encodes a 16-bit unsigned integer into a 16-bit word with byte swapping (little-endian assumed).
     * @param {number} value - The 16-bit unsigned integer.
     * @returns {number[]} Array containing the single byte-swapped 16-bit word.
     */
    _encode16BitValue: function (value) {
      // Swaps the high and low bytes of a 16-bit value.
      var swapBytesInWord = function (inputWord) {
          return ((inputWord & 0x00FF) << 8) | ((inputWord & 0xFF00) >> 8);
      };
      return [swapBytesInWord(value & 0xFFFF)];
    },

    /**
     * @private
     * @description Encodes a 32-bit unsigned integer into two 16-bit words with byte swapping.
     * @param {number} value - The 32-bit unsigned integer.
     * @returns {number[]} Array containing two byte-swapped 16-bit words.
     */
    _encode32BitValue: function (value) {
      // Swaps the high and low bytes of a 16-bit value.
      var swapBytesInWord = function (inputWord) {
          return ((inputWord & 0x00FF) << 8) | ((inputWord & 0xFF00) >> 8);
      };
      // Split 32-bit value into two 16-bit parts, then swap bytes in each.
      return [
          swapBytesInWord(value & 0xFFFF),
          swapBytesInWord((value >> 16) & 0xFFFF)
      ];
    },

    /**
     * @private
     * @description Applies a clipping function to a sample value.
     * @param {number} rawSample - The input sample value.
     * @returns {number} The clipped sample value.
     */
    _applyClipping: function(rawSample) {
        // Equivalent to x / sqrt(1 + x*x)
        return rawSample / Math.hypot(1, rawSample);
    },

    /**
     * @private
     * @description Processes an array of 8-bit mono samples, converting them into 16-bit words.
     * @param {number[]} inputSamples - Array of floating-point samples (normalized to [-1, 1]).
     * @returns {string} Base64-encoded data URI.
     */
    _processEightBitMonoSamples: function (inputSamples) {
      // This method assumes 8-bit, mono audio.

      confirmValueMatch(inputSamples.length, this.totalSampleCount, 'Mismatched sample count for 8-bit processing.');

      var integerTruncate = Math.trunc;
      var shouldClip = this.performClipping;
      var clippingFunc = this._applyClipping;

      var outputWords = this.internalWordBuffer;
      var currentWordIndex = this._headerWordCount; // Start writing after the header.

      // Process samples in pairs to fill 16-bit words.
      for (var sampleCursor = 0, sampleLimit = this.totalSampleCount - 1; sampleCursor < sampleLimit; sampleCursor += 2) {
        var sampleValueA = inputSamples[sampleCursor];
        var sampleValueB = inputSamples[sampleCursor + 1];

        if (shouldClip) {
          sampleValueA = clippingFunc(sampleValueA);
          sampleValueB = clippingFunc(sampleValueB);
        }

        // 8-bit samples are unsigned, scaled from [-1, 1] to [0, 255].
        var byteSampleOne = integerTruncate(128 * (sampleValueA + 1));
        var byteSampleTwo = integerTruncate(128 * (sampleValueB + 1));
        outputWords[currentWordIndex++] = (byteSampleOne << 8) | byteSampleTwo;
      }

      // Handle the last sample if total count is odd.
      if (this.totalSampleCount % 2 !== 0) {
        var finalSample = inputSamples[sampleCursor];
        if (shouldClip) {
            finalSample = clippingFunc(finalSample);
        }
        var finalByteSample = integerTruncate(128 * (finalSample + 1));
        outputWords[currentWordIndex++] = finalByteSample << 8; // Pad with zero for the second byte.
      }

      return this._generateBase64DataURI();
    },

    /**
     * @private
     * @description Processes an array of 16-bit mono samples, converting them into 16-bit words.
     * @param {number[]} inputSamples - Array of floating-point samples (normalized to [-1, 1]).
     * @returns {string} Base64-encoded data URI.
     */
    _processSixteenBitMonoSamples: function (inputSamples) {
      // This method assumes 16-bit, mono audio.

      confirmValueMatch(inputSamples.length, this.totalSampleCount, 'Mismatched sample count for 16-bit processing.');

      var integerTruncate = Math.trunc;
      var shouldClip = this.performClipping;
      var clippingFunc = this._applyClipping;

      var outputWords = this.internalWordBuffer;
      var currentWordIndex = this._headerWordCount; // Start writing after the header.

      for (var sampleCursor = 0, sampleLimit = this.totalSampleCount; sampleCursor < sampleLimit; ++sampleCursor) {
        var sampleValue = inputSamples[sampleCursor];
        if (shouldClip) {
            sampleValue = clippingFunc(sampleValue);
        }
        // 16-bit samples are signed, scaled from [-1, 1] to [-32768, 32767].
        var signedSample = integerTruncate(32768 * sampleValue);
        // Convert to unsigned 16-bit representation (2's complement).
        if (signedSample < 0) {
            signedSample = 0x10000 + signedSample; // Add 65536
        }
        // Store as byte-swapped 16-bit word.
        outputWords[currentWordIndex++] = ((signedSample & 0x00FF) << 8) | ((signedSample & 0xFF00) >> 8);
      }

      return this._generateBase64DataURI();
    },

    /**
     * @private
     * @description Converts the internal buffer of 16-bit words into a Base64-encoded data URI.
     *              Uses a custom 12-bit encoding scheme for efficiency.
     * @returns {string} The complete Base64 data URI.
     */
    _generateBase64DataURI: function () {
      var wordSequence = this.internalWordBuffer;
      var charPairLookup = AudioStreamConverter._base64CharPairMap;

      // Pre-allocate result array for efficiency. Each 3 words (48 bits) become 4 * 2 = 8 chars.
      var resultChunks = new Array(1 + Math.ceil(wordSequence.length * (8/3)));
      var currentChunkIdx = 0;
      resultChunks[currentChunkIdx++] = 'data:audio/wav;base64,';

      // Process words in groups of three.
      for (var wordPos = 0, totalWords = wordSequence.length; wordPos < totalWords;) {
        var wordOne = wordSequence[wordPos++];
        var wordTwo = wordSequence[wordPos++];
        var wordThree = wordSequence[wordPos++];

        // Extract four 12-bit values from the three 16-bit words (48 bits total).
        // This is a custom packing scheme.
        var valA = (wordOne >> 4) & 0xFFF; // Bits 15-4 of wordOne
        var valB = ((wordOne & 0xF) << 8) | ((wordTwo >> 8) & 0xFF); // Bits 3-0 of wordOne, Bits 15-8 of wordTwo
        var valC = ((wordTwo & 0xFF) << 4) | ((wordThree >> 12) & 0xF); // Bits 7-0 of wordTwo, Bits 15-12 of wordThree
        var valD = wordThree & 0xFFF; // Bits 11-0 of wordThree

        // Map each 12-bit value to a 2-character Base64 string using the lookup table.
        resultChunks[currentChunkIdx++] = charPairLookup[valA];
        resultChunks[currentChunkIdx++] = charPairLookup[valB];
        resultChunks[currentChunkIdx++] = charPairLookup[valC];
        resultChunks[currentChunkIdx++] = charPairLookup[valD];
      }
      return resultChunks.join('');
    }
  };

  /**
   * Default configuration settings for AudioStreamConverter instances.
   */
  AudioStreamConverter.defaultConfiguration = {
    channelCount: 1,      // Mono audio
    sampleRate: 22050, // 22.05 kHz
    bitDepth: 16,   // 16-bit samples
    applyClipping: true
  };

  // IIFE to pre-calculate the Base64 character pair lookup table.
  (function(){
    var base64AlphabetChars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    var base64CharPairMap = [];
    // The map stores 2-character strings for each 12-bit value (0-4095).
    // Each 12-bit value is broken into two 6-bit values for lookup.
    for (var combinedValue = 0, maxCombinedValue = 64 * 64; combinedValue < maxCombinedValue; ++combinedValue) {
      var char1Index = combinedValue >> 6; // Upper 6 bits
      var char2Index = combinedValue & 63; // Lower 6 bits
      base64CharPairMap[combinedValue] = base64AlphabetChars[char1Index] + base64AlphabetChars[char2Index];
    }

    AudioStreamConverter._base64CharPairMap = base64CharPairMap;
  })();

  // Expose the custom error type for external use.
  AudioStreamConverter.ProcessingError = AudioDataProcessorError;

  /**
   * @static
   * @description A convenience function for one-off audio data URI generation.
   *              It creates an instance of AudioStreamConverter and processes the data immediately.
   * @param {number[]} audioSampleData - Array of floating-point audio samples.
   * @param {object?} processingOptions - Optional configuration for the converter.
   * @returns {string} The Base64-encoded WAV data URI.
   */
  AudioStreamConverter.createDataURI = function (audioSampleData, processingOptions) {
    verifyCondition(Array.isArray(audioSampleData) && audioSampleData.length > 0,
        "Input 'audioSampleData' must be a non-empty array of numbers.");

    var converterInstance = new AudioStreamConverter(audioSampleData.length, processingOptions);
    return converterInstance.processSamples(audioSampleData);
  };

  return AudioStreamConverter;

}());