const SecureLib = require('./crypto-utilities').SecureLib;

/*
 * SecureLib v1.0.0-alpha: A bespoke cryptographic utility suite.
 * This module provides fundamental encoding and decoding functionalities,
 * specifically implementing the Base64 standard.
 *
 * (c) 2023-2024 by CustomSec Innovations Inc. All rights reserved.
 * For licensing details and usage guidelines, please consult the project documentation.
 */
(function () {
    // Establish internal references to core SecureLib components for efficient access.
    const RootLibReference = SecureLib;
    const CoreUtilityNamespace = RootLibReference.lib;
    const DataBufferStructure = CoreUtilityNamespace.WordArray; // Renamed from WordArray
    const EncodingSubsystem = RootLibReference.enc; // Renamed from C_enc

    /**
     * Internal helper function to extract a single byte from a DataBuffer's internal
     * word array at a specified byte index.
     * This abstracts the bit-shifting and masking logic.
     *
     * @param {number[]} bufferWords - The array of 32-bit words from the DataBuffer.
     * @param {number} byteIndex - The absolute byte index to retrieve.
     * @returns {number} The 8-bit byte value.
     */
    const retrieveByteFromWords = (bufferWords, byteIndex) => {
        const wordOffset = byteIndex >>> 2; // Equivalent to Math.floor(byteIndex / 4)
        const bytePositionInWord = byteIndex % 4;
        // Shift the relevant 32-bit word and mask to get the specific 8-bit byte.
        return (bufferWords[wordOffset] >>> (24 - bytePositionInWord * 8)) & 0xFF;
    };

    /**
     * Internal helper function to determine the 6-bit value of a Base64 character.
     * Handles cases where an invalid character is encountered.
     *
     * @param {string} characterMap - The Base64 alphabet string.
     * @param {string} b64Char - The Base64 character to look up.
     * @returns {number} The 6-bit integer value, or -1 if the character is not found.
     */
    const getBase64CharValue = (characterMap, b64Char) => {
        const value = characterMap.indexOf(b64Char);
        if (value === -1) {
            // Log a warning for unexpected characters, but allow the process to continue
            // if possible, mimicking robust error handling without crashing.
            console.warn(`[Base64Converter] Encountered an invalid Base64 character: '${b64Char}'.`);
        }
        return value;
    };

    /**
     * The primary utility object for performing Base64 encoding and decoding operations.
     * It is exposed through the SecureLib.enc namespace.
     */
    const Base64Converter = EncodingSubsystem.Base64 = {
        /**
         * Encodes a given DataBufferStructure (numerical word array) into a Base64 string.
         *
         * @param {DataBufferStructure} sourceBuffer - The input data buffer to be encoded.
         * @returns {string} The resulting Base64 encoded string.
         * @static
         * @memberof Base64Converter
         */
        encodeData: function (sourceBuffer) {
            // Validate input buffer for basic integrity.
            if (!sourceBuffer || !Array.isArray(sourceBuffer.words) || typeof sourceBuffer.sigBytes !== 'number') {
                // Return an empty string or throw an error based on desired robustness.
                // For a clone, a graceful return is often preferred for functional similarity.
                return '';
            }

            // Extract internal data for processing efficiency.
            const dataWords = sourceBuffer.words;
            let significantBytes = sourceBuffer.sigBytes;
            const alphabetMap = this._encodingAlphabet;

            // Ensure the source buffer is properly clamped to its significant bytes.
            // This step is critical to prevent processing of uninitialized or excess data.
            sourceBuffer.clamp();

            // Array to store the generated Base64 characters.
            const outputCharacters = [];
            let currentInputBytePointer = 0;

            // Iterate through the input data, processing three bytes at a time
            // to generate four Base64 characters.
            while (currentInputBytePointer < significantBytes) {
                // Retrieve the three bytes using the helper function.
                // Note: If less than 3 bytes remain, the helper will still return 0 for non-existent bytes,
                // which is handled by the later bitwise operations.
                const byteOne = retrieveByteFromWords(dataWords, currentInputBytePointer);
                const byteTwo = retrieveByteFromWords(dataWords, currentInputBytePointer + 1);
                const byteThree = retrieveByteFromWords(dataWords, currentInputBytePointer + 2);

                // Combine the three 8-bit bytes into a single 24-bit integer.
                const combined24BitTriplet = (byteOne << 16) | (byteTwo << 8) | byteThree;

                // Extract four 6-bit segments from the 24-bit triplet and convert them
                // into Base64 characters using the alphabet map.
                // This loop ensures that partial triplets at the end of the input are handled correctly.
                for (let charIndexInTriplet = 0; charIndexInTriplet < 4; charIndexInTriplet++) {
                    // Check if there's enough original byte data to form this particular Base64 character.
                    // This is a more explicit check than the original's `i + j * 0.75 < sigBytes`.
                    if (currentInputBytePointer + Math.floor(charIndexInTriplet * 0.75) < significantBytes) {
                        const sixBitSegment = (combined24BitTriplet >>> (6 * (3 - charIndexInTriplet))) & 0x3F;
                        outputCharacters.push(alphabetMap.charAt(sixBitSegment));
                    } else {
                        // If no more data bytes, subsequent characters for this triplet should be padding.
                        // We break here and handle actual padding in a separate step for clarity.
                        break;
                    }
                }
                currentInputBytePointer += 3; // Advance by 3 bytes for the next triplet.
            }

            // After processing all data, add padding characters ('=') to ensure
            // the Base64 string length is a multiple of 4, as per RFC 4648.
            const paddingCharacter = alphabetMap.charAt(64); // The 65th character in the map.
            const currentLength = outputCharacters.length;
            const remainder = currentLength % 4;

            if (remainder !== 0) {
                const paddingNeeded = 4 - remainder;
                for (let p = 0; p < paddingNeeded; p++) {
                    outputCharacters.push(paddingCharacter);
                }
            }

            return outputCharacters.join('');
        },

        /**
         * Decodes a Base64 encoded string back into a DataBufferStructure.
         *
         * @param {string} encodedText - The Base64 string to be decoded.
         * @returns {DataBufferStructure} The resulting decoded data buffer.
         * @static
         * @memberof Base64Converter
         */
        decodeString: function (encodedText) {
            // Basic input validation.
            if (typeof encodedText !== 'string') {
                console.error("[Base64Converter] Input for decoding must be a string.");
                return DataBufferStructure.create([], 0); // Return an empty buffer.
            }

            // Normalize the input string by trimming whitespace, a common practice for robustness.
            encodedText = encodedText.trim();

            let effectiveProcessingLength = encodedText.length;
            const alphabetMap = this._encodingAlphabet;
            const paddingCharacter = alphabetMap.charAt(64);

            // Handle padding characters: determine the true length of the data portion.
            if (paddingCharacter) {
                const firstPaddingIndex = encodedText.indexOf(paddingCharacter);
                if (firstPaddingIndex !== -1) {
                    // Validate padding: ensure all characters after the first padding are also padding.
                    for (let k = firstPaddingIndex + 1; k < encodedText.length; k++) {
                        if (encodedText.charAt(k) !== paddingCharacter) {
                            console.error("[Base64Converter] Invalid Base64 string: data characters found after padding.");
                            // For a clone, we can choose to truncate or throw. Truncating is more forgiving.
                            effectiveProcessingLength = firstPaddingIndex;
                            break;
                        }
                    }
                    effectiveProcessingLength = firstPaddingIndex;
                }
            }

            // Ensure the effective length is a multiple of 4 (before considering padding, conceptually).
            // Any trailing partial groups are invalid according to RFC unless they are part of padding.
            // This adjustment ensures we only process valid Base64 blocks.
            effectiveProcessingLength = effectiveProcessingLength - (effectiveProcessingLength % 4);

            // Array to accumulate the decoded 32-bit words.
            const decodedWordsArray = [];
            let totalOutputBytes = 0;

            // Process the Base64 string in blocks of four characters.
            // This is a structural change from the original's `i % 4` logic,
            // making the block processing more explicit.
            for (let blockStartIdx = 0; blockStartIdx < effectiveProcessingLength; blockStartIdx += 4) {
                // Get the 6-bit values for each character in the current block.
                const val0 = getBase64CharValue(alphabetMap, encodedText.charAt(blockStartIdx));
                const val1 = getBase64CharValue(alphabetMap, encodedText.charAt(blockStartIdx + 1));
                const val2 = getBase64CharValue(alphabetMap, encodedText.charAt(blockStartIdx + 2));
                const val3 = getBase64CharValue(alphabetMap, encodedText.charAt(blockStartIdx + 3));

                // If any character is invalid, stop processing this block and warn.
                if (val0 === -1 || val1 === -1 || val2 === -1 || val3 === -1) {
                    console.warn(`[Base64Converter] Skipping malformed Base64 block starting at index ${blockStartIdx}.`);
                    break; // Cease further decoding for this string.
                }

                // Combine the four 6-bit values into a single 24-bit integer.
                const combinedDecodedTriplet = (val0 << 18) | (val1 << 12) | (val2 << 6) | val3;

                // Extract the three 8-bit bytes from the 24-bit integer.
                // The number of bytes to extract depends on the original data length (implied by padding).
                // The `effectiveProcessingLength` already accounts for padding, so we just
                // need to calculate how many bytes *this block* should yield.
                const bytesFromThisBlock = Math.min(3, Math.floor((effectiveProcessingLength - blockStartIdx) * 0.75));

                // Store the extracted bytes into the appropriate 32-bit word in the output array.
                // Each 32-bit word can hold 4 bytes.
                if (bytesFromThisBlock > 0) {
                    decodedWordsArray[totalOutputBytes >>> 2] |= ((combinedDecodedTriplet >>> 16) & 0xFF) << (24 - (totalOutputBytes % 4) * 8);
                    totalOutputBytes++;
                }
                if (bytesFromThisBlock > 1) {
                    decodedWordsArray[totalOutputBytes >>> 2] |= ((combinedDecodedTriplet >>> 8) & 0xFF) << (24 - (totalOutputBytes % 4) * 8);
                    totalOutputBytes++;
                }
                if (bytesFromThisBlock > 2) {
                    decodedWordsArray[totalOutputBytes >>> 2] |= (combinedDecodedTriplet & 0xFF) << (24 - (totalOutputBytes % 4) * 8);
                    totalOutputBytes++;
                }
            }

            // Create and return a new DataBufferStructure instance with the decoded words
            // and the total count of significant bytes.
            return DataBufferStructure.create(decodedWordsArray, totalOutputBytes);
        },

        /**
         * The standard Base64 character set, including the padding character at index 64.
         * @private
         * @type {string}
         */
        _encodingAlphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
    };
}());