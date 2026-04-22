(function() {

    // Expert-level code transformation for Type III clone.
    // This module, initially named LZJB, has been re-engineered as 'Compresso'
    // with significant structural and stylistic alterations while preserving core functionality.

    // Check for existing global 'Compresso' object, initialize if not found.
    if (typeof Compresso === 'undefined') {
        window.Compresso = {};
    }

    // Version tracking, significantly altered from original.
    // Original: '$Revision: 3026 $'.substring(11).replace(" $", "")
    // New: Direct assignment of a version string.
    Compresso.VERSION_INFO = "v1.3.1-alpha";

    /**
     * Utility function to convert a JavaScript string into a byte array,
     * handling multi-byte UTF-8 characters.
     *
     * @param {string} textString The input string to convert.
     * @returns {number[]} An array of byte values (numbers 0-255).
     */
    Compresso.stringToBytes = function(textString) {
        // Input validation: ensure a string is provided.
        if (typeof textString !== 'string') {
            console.error("Input for stringToBytes must be a string.");
            return []; // Return empty array for invalid input.
        }

        const byteValueArray = []; // Accumulates byte values.
        let charIndex = 0;         // Current position in the input string.
        const stringLength = textString.length; // Cache string length for performance.

        // Iterate through each character of the input string.
        while (charIndex < stringLength) {
            const charCodePoint = textString.charCodeAt(charIndex++); // Get character code and increment index.

            // Determine the UTF-8 encoding scheme based on the Unicode code point.
            // 1-byte sequence (0x00 to 0x7F): 0xxxxxxx
            if (charCodePoint <= 0x7F) {
                byteValueArray.push(charCodePoint);
            }
            // 2-byte sequence (0x80 to 0x7FF): 110xxxxx 10xxxxxx
            else if (charCodePoint <= 0x7FF) {
                // First byte: high bits of charCodePoint shifted, ORed with 0xC0 (11000000)
                byteValueArray.push((charCodePoint >> 6) | 0xC0);
                // Second byte: low 6 bits of charCodePoint, ORed with 0x80 (10000000)
                byteValueArray.push((charCodePoint & 0x3F) | 0x80);
            }
            // 3-byte sequence (0x800 to 0xFFFF): 1110xxxx 10xxxxxx 10xxxxxx
            else if (charCodePoint <= 0xFFFF) {
                // First byte: high bits shifted, ORed with 0xE0 (11100000)
                byteValueArray.push((charCodePoint >> 12) | 0xE0);
                // Second byte: middle 6 bits, ORed with 0x80
                byteValueArray.push(((charCodePoint >> 6) & 0x3F) | 0x80);
                // Third byte: low 6 bits, ORed with 0x80
                byteValueArray.push((charCodePoint & 0x3F) | 0x80);
            }
            // 4-byte sequence (0x10000 to 0x1FFFFF): 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
            else {
                // First byte: highest bits shifted, ORed with 0xF0 (11110000)
                byteValueArray.push((charCodePoint >> 18) | 0xF0);
                // Subsequent bytes: 6 bits each, ORed with 0x80
                byteValueArray.push(((charCodePoint >> 12) & 0x3F) | 0x80);
                byteValueArray.push(((charCodePoint >> 6) & 0x3F) | 0x80);
                byteValueArray.push((charCodePoint & 0x3F) | 0x80);
            }
        }
        return byteValueArray;
    };

    /**
     * Re-engineered Base64 encoding/decoding utility.
     * This module handles standard and URL-safe Base64 transformations.
     *
     * References:
     * - http://code.google.com/p/javascriptbase64/
     * - http://www.stringify.com/static/js/base64.js
     * Both are typically under MIT License, and this re-implementation adheres to similar principles.
     */
    Compresso.B64Codec = {

        // Encoding character set for standard Base64.
        ENCODE_CHARS_STANDARD: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",

        // Encoding character set for URL-safe Base64 (replaces + with -, / with _).
        ENCODE_CHARS_URLSAFE: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",

        // Lookup table for standard decoding (maps char code to 6-bit value).
        DECODE_MAP_STANDARD: new Array(256),

        // Lookup table for URL-safe decoding.
        DECODE_MAP_URLSAFE: new Array(256),

        /**
         * Initializes the Base64 decoding lookup tables.
         * This method is called once upon module loading.
         * It populates the DECODE_MAP_STANDARD and DECODE_MAP_URLSAFE arrays.
         */
        _initializeLookupTables: function() {
            let charCodeTracker; // Loop counter for char codes.

            // Initialize all entries in both decode maps to -1 (indicating an invalid character).
            for (charCodeTracker = 0; charCodeTracker < 256; charCodeTracker++) {
                this.DECODE_MAP_STANDARD[charCodeTracker] = -1;
                this.DECODE_MAP_URLSAFE[charCodeTracker] = -1;
            }

            // Populate the decode maps using the encoding character sets.
            // Each character's ASCII value becomes an index, and its Base64 value is stored.
            const standardTableLength = this.ENCODE_CHARS_STANDARD.length;
            for (charCodeTracker = 0; charCodeTracker < standardTableLength; charCodeTracker++) {
                const standardChar = this.ENCODE_CHARS_STANDARD.charCodeAt(charCodeTracker);
                const urlSafeChar = this.ENCODE_CHARS_URLSAFE.charCodeAt(charCodeTracker);

                this.DECODE_MAP_STANDARD[standardChar] = charCodeTracker;
                this.DECODE_MAP_URLSAFE[urlSafeChar] = charCodeTracker;
            }

            // The '=' padding character decodes to 0.
            this.DECODE_MAP_STANDARD['='.charCodeAt(0)] = 0;
            this.DECODE_MAP_URLSAFE['='.charCodeAt(0)] = 0;
        },

        /**
         * Encodes an array of bytes or a string into a Base64 string.
         *
         * @param {number[]|string} dataInput The data to encode. Can be a byte array or a string.
         * @param {boolean} [isUrlSafe=false] If true, uses URL-safe Base64 encoding.
         * @returns {string} The Base64 encoded string.
         */
        encodeBinaryData: function(dataInput, isUrlSafe) {
            // Input validation and preparation.
            if (!dataInput) {
                console.warn("No input provided for Base64 encoding.");
                return "";
            }

            const activeEncodingTable = isUrlSafe ? this.ENCODE_CHARS_URLSAFE : this.ENCODE_CHARS_STANDARD;
            let sourceBytesArray;

            // Convert string input to byte array if necessary.
            if (Array.isArray(dataInput)) {
                sourceBytesArray = dataInput;
            } else if (typeof dataInput === 'string') {
                sourceBytesArray = Compresso.stringToBytes(dataInput);
            } else {
                console.error("Invalid input type for Base64 encoding. Must be Array or String.");
                return "";
            }

            const sourceLength = sourceBytesArray.length;
            const encodedOutputChunks = []; // Stores characters before joining.

            // Process data in blocks of 3 bytes (24 bits).
            const fullBlocksLength = Math.floor(sourceLength / 3) * 3; // Length up to the last full 3-byte block.
            let currentSourceIndex = 0;
            let temp24BitValue; // Temporary variable to hold 24 bits.

            // Encode full 24-bit blocks.
            while (currentSourceIndex < fullBlocksLength) {
                // Combine three bytes into a 24-bit integer.
                // Mask with 0xff to ensure byte values are treated as unsigned.
                temp24BitValue = (sourceBytesArray[currentSourceIndex++] & 0xFF) << 16 |
                                 (sourceBytesArray[currentSourceIndex++] & 0xFF) << 8 |
                                 (sourceBytesArray[currentSourceIndex++] & 0xFF);

                // Extract four 6-bit chunks and map them to characters.
                encodedOutputChunks.push(activeEncodingTable.charAt((temp24BitValue >> 18) & 0x3F));
                encodedOutputChunks.push(activeEncodingTable.charAt((temp24BitValue >> 12) & 0x3F));
                encodedOutputChunks.push(activeEncodingTable.charAt((temp24BitValue >> 6) & 0x3F));
                encodedOutputChunks.push(activeEncodingTable.charAt(temp24BitValue & 0x3F));
            }

            // Handle any remaining bytes (0, 1, or 2 bytes).
            const remainingByteCount = sourceLength - fullBlocksLength; // 0, 1, or 2.

            if (remainingByteCount > 0) {
                // Pad with zeros to form a partial 24-bit block.
                temp24BitValue = (sourceBytesArray[fullBlocksLength] & 0xFF) << 10; // First remaining byte.
                if (remainingByteCount === 2) {
                    temp24BitValue |= (sourceBytesArray[sourceLength - 1] & 0xFF) << 2; // Second remaining byte.
                }

                // Encode the available bits.
                encodedOutputChunks.push(activeEncodingTable.charAt(temp24BitValue >> 12));
                encodedOutputChunks.push(activeEncodingTable.charAt((temp24BitValue >> 6) & 0x3F));
                // Add padding characters as needed.
                encodedOutputChunks.push(remainingByteCount === 2 ? activeEncodingTable.charAt(temp24BitValue & 0x3F) : '=');
                encodedOutputChunks.push('='); // Always add a final '=' or actual char for last group.
            }

            return encodedOutputChunks.join(""); // Concatenate all character chunks.
        },

        /**
         * Decodes a Base64 encoded string or byte array back into its original byte array or string.
         *
         * @param {string|number[]} encodedInput The Base64 string or byte array to decode.
         * @param {boolean} [isUrlSafe=false] If true, uses URL-safe Base64 decoding.
         * @param {boolean} [returnAsBytes=false] If true, returns a byte array. Otherwise, returns a string.
         * @returns {number[]|string} The decoded data.
         */
        decodeBinaryData: function(encodedInput, isUrlSafe, returnAsBytes = false) {
            // Input validation and preparation.
            if (!encodedInput) {
                console.warn("No input provided for Base64 decoding.");
                return returnAsBytes ? [] : "";
            }

            const activeDecodingMap = isUrlSafe ? this.DECODE_MAP_URLSAFE : this.DECODE_MAP_STANDARD;
            let sourceCharCodes; // Array of character codes from the input.
            let inputWasByteArray = Array.isArray(encodedInput);

            if (inputWasByteArray) {
                sourceCharCodes = encodedInput;
            } else if (typeof encodedInput === 'string') {
                sourceCharCodes = Compresso.stringToBytes(encodedInput); // Convert string to char codes.
            } else {
                console.error("Invalid input type for Base64 decoding. Must be Array or String.");
                return returnAsBytes ? [] : "";
            }

            let sourceCharCodesLength = sourceCharCodes.length;
            let currentParseStart = 0;
            let currentParseEnd = sourceCharCodesLength - 1;

            // Trim invalid characters from the start of the input.
            while (currentParseStart < currentParseEnd && activeDecodingMap[sourceCharCodes[currentParseStart]] < 0) {
                currentParseStart++;
            }
            // Trim invalid characters from the end of the input.
            while (currentParseEnd > 0 && activeDecodingMap[sourceCharCodes[currentParseEnd]] < 0) {
                currentParseEnd--;
            }

            // Calculate padding characters.
            const lastChar = sourceCharCodes[currentParseEnd];
            const secondLastChar = sourceCharCodes[currentParseEnd - 1];
            const paddingCharCount = (lastChar === '='.charCodeAt(0)) ? (secondLastChar === '='.charCodeAt(0) ? 2 : 1) : 0;

            const effectiveCharCount = currentParseEnd - currentParseStart + 1; // Count of valid Base64 chars.
            // Estimate line separator count (e.g., CRLF every 76 chars).
            // Original code used `sLen > 76 ? (sArr[76] == '\r' ? cCnt / 78 : 0) << 1 : 0;`
            // Simplified here assuming no separators or handling them implicitly by skipping.
            const assumedSeparatorChars = 0; // Modern Base64 often lacks line breaks.

            // Calculate the expected length of the decoded byte array.
            const decodedBytesLength = ((effectiveCharCount - assumedSeparatorChars) * 6 >> 3) - paddingCharCount;
            const decodedOutputBytes = new Array(decodedBytesLength); // Pre-allocate array.

            let outputByteIndex = 0;
            let charAccumulator = 0;
            const fullDecodeBlocksEnd = Math.floor(decodedBytesLength / 3) * 3; // Decode in 3-byte chunks.

            // Decode the main body of the data.
            while (outputByteIndex < fullDecodeBlocksEnd) {
                // Combine four 6-bit values into a 24-bit integer.
                charAccumulator = activeDecodingMap[sourceCharCodes[currentParseStart++]] << 18 |
                                  activeDecodingMap[sourceCharCodes[currentParseStart++]] << 12 |
                                  activeDecodingMap[sourceCharCodes[currentParseStart++]] << 6 |
                                  activeDecodingMap[sourceCharCodes[currentParseStart++]];

                // Extract three 8-bit bytes from the 24-bit integer.
                decodedOutputBytes[outputByteIndex++] = (charAccumulator >> 16) & 0xFF;
                decodedOutputBytes[outputByteIndex++] = (charAccumulator >> 8) & 0xFF;
                decodedOutputBytes[outputByteIndex++] = charAccumulator & 0xFF;

                // Handle potential line separators if present in the input.
                // (Original logic for sepCnt and cc is removed for simplification,
                // as modern Base64 often doesn't include them, and trimming handles invalid chars.)
            }

            // Handle the final partial block if `decodedBytesLength` is not a multiple of 3.
            if (outputByteIndex < decodedBytesLength) {
                charAccumulator = 0;
                let bitShiftAmount = 0; // Tracks bit position for combining 6-bit chunks.

                // Collect remaining valid 6-bit chunks up to padding.
                while (currentParseStart <= currentParseEnd - paddingCharCount) {
                    charAccumulator |= activeDecodingMap[sourceCharCodes[currentParseStart++]] << (18 - bitShiftAmount * 6);
                    bitShiftAmount++;
                }

                // Extract the remaining bytes.
                let resultBitPosition = 16;
                while (outputByteIndex < decodedBytesLength) {
                    decodedOutputBytes[outputByteIndex++] = (charAccumulator >> resultBitPosition) & 0xFF;
                    resultBitPosition -= 8;
                }
            }

            // Determine return type based on `returnAsBytes` flag.
            if (returnAsBytes) {
                return decodedOutputBytes;
            } else {
                // Convert byte array to string by mapping each byte to its character.
                const charResultArray = [];
                for (let byteVal of decodedOutputBytes) {
                    charResultArray.push(String.fromCharCode(byteVal));
                }
                return charResultArray.join('');
            }
        }
    };

    // Initialize the Base64 decoding tables upon script load.
    Compresso.B64Codec._initializeLookupTables();

    // Compression constants, renamed and slightly reordered for clarity.
    const BITS_PER_BYTE = 8; // Number of bits in a byte.
    const COMPRESSION_MATCH_BITS = 6; // Number of bits used to store match length.
    const MIN_MATCH_LEN = 3; // Minimum length of a match.
    const MAX_MATCH_LEN = ((1 << COMPRESSION_MATCH_BITS) + (MIN_MATCH_LEN - 1)); // Maximum match length.
    const COMPRESSION_OFFSET_MASK = ((1 << (16 - COMPRESSION_MATCH_BITS)) - 1); // Mask for the offset value.
    const HASH_TABLE_SIZE = 256; // Size of the Lempel-Ziv hash table.

    /**
     * Compresses a string or byte array using a fast LZ-style algorithm (LZJB variant).
     * This implementation is optimized for speed and efficiency in JavaScript environments,
     * drawing inspiration from the LZJB algorithm found in OpenSolaris.
     *
     * @param {string|number[]} rawInput The string or byte array to compress.
     * @returns {number[]} The compressed data as a byte array.
     */
    Compresso.compressBuffer = function(rawInput) {
        // Input validation and conversion.
        if (!rawInput) {
            console.warn("No input provided for compression.");
            return [];
        }

        let sourceBuffer;
        if (Array.isArray(rawInput)) {
            sourceBuffer = rawInput;
        } else if (typeof rawInput === 'string') {
            sourceBuffer = Compresso.stringToBytes(rawInput);
        } else {
            console.error("Invalid input type for compression. Must be Array or String.");
            return [];
        }

        const sourceBufferLen = sourceBuffer.length;
        const compressedOutputBuffer = []; // Accumulates compressed bytes.

        let currentSourceIndex = 0; // Pointer for reading from sourceBuffer.
        let currentDestIndex = 0;   // Pointer for writing to compressedOutputBuffer.

        let controlBytePosition; // Index in output buffer where the control byte (copymap) is stored.
        let controlBitMask = 1 << (BITS_PER_BYTE - 1); // Bit mask for the current control byte.

        const hashLookupTable = new Array(HASH_TABLE_SIZE); // Stores last seen positions for sequences.
        // Initialize hash table with a value that ensures no initial match.
        hashLookupTable.fill(0x14141414); // Distinct from original's 3435973836 (which is 0xCC CC CC CC)

        // Main compression loop.
        while (currentSourceIndex < sourceBufferLen) {
            // Check if a new control byte is needed.
            // A control byte has 8 bits, so after 8 data/literal decisions, a new one is started.
            if ((controlBitMask <<= 1) === (1 << BITS_PER_BYTE)) {
                // This block handles potential overflow or inefficient compression for very short inputs.
                // If the destination buffer is getting too large relative to the source,
                // or if we're near the end, sometimes it's better to just copy remaining data directly.
                // Original: if (dst >= slen - 1 - 2 * NBBY) { ... }
                // This specific guard is often for cases where compression overhead exceeds benefits.
                // For simplicity and direct translation, I'll keep a version of it but slightly refactor.
                if (compressedOutputBuffer.length + (sourceBufferLen - currentSourceIndex) * 2 >= sourceBufferLen * 0.95) {
                    // If estimated remaining compressed size is not much smaller than raw,
                    // or if it might overflow, copy remaining bytes uncompressed.
                    // This is a heuristic and can be tuned.
                    for (let i = currentSourceIndex; i < sourceBufferLen; i++) {
                        compressedOutputBuffer.push(sourceBuffer[i]);
                    }
                    return compressedOutputBuffer;
                }

                controlBitMask = 1; // Reset mask for the new control byte.
                controlBytePosition = currentDestIndex; // Store position of the new control byte.
                compressedOutputBuffer[currentDestIndex++] = 0; // Placeholder for the control byte.
            }

            // If remaining bytes are fewer than MAX_MATCH_LEN, copy as literals.
            if (currentSourceIndex > sourceBufferLen - MAX_MATCH_LEN) {
                compressedOutputBuffer[currentDestIndex++] = sourceBuffer[currentSourceIndex++];
                continue; // Move to the next byte.
            }

            // Calculate a hash for the current 3-byte sequence.
            // Original: ((sstart[src] + 13) ^ (sstart[src + 1] - 13) ^ sstart[src + 2]) & (LEMPEL_SIZE - 1)
            // Rewritten for clarity and slight variation.
            const byte1 = sourceBuffer[currentSourceIndex];
            const byte2 = sourceBuffer[currentSourceIndex + 1];
            const byte3 = sourceBuffer[currentSourceIndex + 2];
            const hashResult = ((byte1 + 7) ^ (byte2 - 5) ^ byte3) & (HASH_TABLE_SIZE - 1); // Slightly altered constants.

            // Get the last seen position of this hash.
            const lastSeenPosition = hashLookupTable[hashResult];
            // Update the hash table with the current position.
            hashLookupTable[hashResult] = currentSourceIndex;

            // Calculate the potential match offset.
            // The offset is the distance between current position and the last seen position.
            const potentialMatchOffset = (currentSourceIndex - lastSeenPosition) & COMPRESSION_OFFSET_MASK;
            const potentialMatchStart = currentSourceIndex - potentialMatchOffset; // Where the potential match starts.

            // Check if a valid match exists.
            // Conditions:
            // 1. The potential match start must be non-negative.
            // 2. The match should not be at the current position itself (offset != 0 implies cpy != src).
            // 3. The first three bytes of the current sequence must match the sequence at `potentialMatchStart`.
            if (potentialMatchStart >= 0 && potentialMatchOffset !== 0 &&
                sourceBuffer[currentSourceIndex] === sourceBuffer[potentialMatchStart] &&
                sourceBuffer[currentSourceIndex + 1] === sourceBuffer[potentialMatchStart + 1] &&
                sourceBuffer[currentSourceIndex + 2] === sourceBuffer[potentialMatchStart + 2])
            {
                // A match is found! Mark the control byte.
                compressedOutputBuffer[controlBytePosition] |= controlBitMask;

                let actualMatchLength;
                // Determine the exact length of the match.
                for (actualMatchLength = MIN_MATCH_LEN; actualMatchLength < MAX_MATCH_LEN; actualMatchLength++) {
                    if (sourceBuffer[currentSourceIndex + actualMatchLength] !== sourceBuffer[potentialMatchStart + actualMatchLength]) {
                        break;
                    }
                }

                // Store match length and offset in two bytes.
                // First byte: (matchLength - MIN_MATCH_LEN) shifted, combined with high bits of offset.
                // Second byte: low bits of offset.
                const encodedMatchInfoByte1 = ((actualMatchLength - MIN_MATCH_LEN) << (BITS_PER_BYTE - COMPRESSION_MATCH_BITS)) |
                                              (potentialMatchOffset >> BITS_PER_BYTE);
                const encodedMatchInfoByte2 = potentialMatchOffset;

                compressedOutputBuffer[currentDestIndex++] = encodedMatchInfoByte1;
                compressedOutputBuffer[currentDestIndex++] = encodedMatchInfoByte2;

                // Advance source pointer by the length of the matched sequence.
                currentSourceIndex += actualMatchLength;
            } else {
                // No match found, store the current byte as a literal.
                compressedOutputBuffer[currentDestIndex++] = sourceBuffer[currentSourceIndex++];
            }
        }

        return compressedOutputBuffer;
    };

    /**
     * Decompresses a byte array previously compressed by `compressBuffer`.
     * This function reconstructs the original string or byte array.
     *
     * @param {string|number[]} compressedInput The compressed data (string or byte array).
     * @returns {string} The decompressed string.
     * @throws {Error} If corrupt data is encountered (e.g., trying to copy from a negative offset).
     */
    Compresso.decompressData = function(compressedInput) {
        // Input validation and conversion.
        if (!compressedInput) {
            console.warn("No input provided for decompression.");
            return "";
        }

        let sourceBuffer;
        if (Array.isArray(compressedInput)) {
            sourceBuffer = compressedInput;
        } else if (typeof compressedInput === 'string') {
            sourceBuffer = Compresso.stringToBytes(compressedInput);
        } else {
            console.error("Invalid input type for decompression. Must be Array or String.");
            return "";
        }

        const sourceBufferLen = sourceBuffer.length;
        const decompressedOutputChars = []; // Stores characters/bytes for the decompressed output.

        let currentSourceIndex = 0;    // Pointer for reading from sourceBuffer.

        let controlByteValue;          // The current control byte.
        let controlBitMask = 1 << (BITS_PER_BYTE - 1); // Bit mask for checking control bits.

        // Main decompression loop.
        while (currentSourceIndex < sourceBufferLen) {
            // Check if a new control byte needs to be read.
            if ((controlBitMask <<= 1) === (1 << BITS_PER_BYTE)) {
                controlBitMask = 1; // Reset mask.
                controlByteValue = sourceBuffer[currentSourceIndex++]; // Read the new control byte.
            }

            // Check the current bit in the control byte.
            if (controlByteValue & controlBitMask) {
                // This bit is set, indicating a compressed match.
                // Read match length and offset from the next two bytes.
                const firstMatchByte = sourceBuffer[currentSourceIndex++];
                const secondMatchByte = sourceBuffer[currentSourceIndex++];

                const matchLength = (firstMatchByte >> (BITS_PER_BYTE - COMPRESSION_MATCH_BITS)) + MIN_MATCH_LEN;
                const matchOffset = ((firstMatchByte << BITS_PER_BYTE) | secondMatchByte) & COMPRESSION_OFFSET_MASK;

                // Calculate the position in the already decompressed output from where to copy.
                const copySourcePosition = decompressedOutputChars.length - matchOffset;

                // Validate the copy source position to prevent reading before the start of the buffer.
                if (copySourcePosition >= 0) {
                    let charsCopied = 0;
                    // Copy characters from the decompressed output buffer.
                    while (charsCopied < matchLength) {
                        // Using charAt is inefficient for string concatenation;
                        // a byte array and then String.fromCharCode.join is better.
                        // For Type III, I'll stick to a character array and then join at the end.
                        decompressedOutputChars.push(decompressedOutputChars[copySourcePosition + charsCopied]);
                        charsCopied++;
                    }
                } else {
                    // Corrupt data: offset points before the start of the decompressed buffer.
                    // Original: throw "busted";
                    // New: Throw a more descriptive Error object.
                    throw new Error("Decompression error: Corrupt data - invalid match offset detected.");
                }
            } else {
                // This bit is not set, indicating a literal byte.
                // Read the next byte from the source and add it to the decompressed output.
                decompressedOutputChars.push(String.fromCharCode(sourceBuffer[currentSourceIndex++]));
            }
        }

        // Join the array of characters to form the final decompressed string.
        return decompressedOutputChars.join('');
    };

})(); // End of IIFE.