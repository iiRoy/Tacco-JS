/*
 * This module offers a comprehensive suite of encoding and decoding utilities,
 * primarily focused on Base64 transformations, with robust support for
 * UTF-8 and UTF-16 character encodings. It is designed to operate consistently
 * across various JavaScript execution environments.
 *
 * This implementation is a derivative work, modified extensively for structural
 * and stylistic variation while preserving core functionality.
 */
(function(runtimeEnvironment) {
    'use strict'; // Enforce strict mode for cleaner, safer code execution.

    // --- Internal Configuration and Lookup Data ---

    // The standardized character set used for Base64 encoding operations.
    const STANDARD_BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    // An array containing the Unicode code points for each character in the
    // `STANDARD_BASE64_ALPHABET`. This is optimized for converting numeric
    // indices back into their corresponding Base64 characters during encoding.
    const BASE64_INDEX_TO_CHAR_CODES = (() => {
        let charCodeCollection = [];
        const UPPER_A_CODE = 'A'.charCodeAt(0);
        const LOWER_A_CODE = 'a'.charCodeAt(0);
        const DIGIT_ZERO_CODE = '0'.charCodeAt(0);

        // Populate with uppercase English letters (A-Z)
        for (let characterIndex = 0; characterIndex < 26; ++characterIndex) {
            charCodeCollection.push(UPPER_A_CODE + characterIndex);
        }
        // Populate with lowercase English letters (a-z)
        for (let characterIndex = 0; characterIndex < 26; ++characterIndex) {
            charCodeCollection.push(LOWER_A_CODE + characterIndex);
        }
        // Populate with decimal digits (0-9)
        for (let characterIndex = 0; characterIndex < 10; ++characterIndex) {
            charCodeCollection.push(DIGIT_ZERO_CODE + characterIndex);
        }

        // Append the special Base64 characters: '+' and '/'
        charCodeCollection.push('+'.charCodeAt(0));
        charCodeCollection.push('/'.charCodeAt(0));

        return charCodeCollection;
    })();

    // A mapping object that provides a fast lookup from a Base64 character
    // to its corresponding numerical value (0-63). This is crucial for decoding.
    const BASE64_CHAR_TO_VALUE_MAP = (() => {
        const characterValueMap = {};
        for (let i = 0; i < STANDARD_BASE64_ALPHABET.length; ++i) {
            characterValueMap[STANDARD_BASE64_ALPHABET.charAt(i)] = i;
        }
        return characterValueMap;
    })();

    // --- Essential Helper Functions ---

    /**
     * Extracts the Unicode code units (UTF-16 code points) from a JavaScript string.
     * This effectively converts a string into an array of numbers, where each number
     * represents a character's internal numerical value.
     * @param {string} sourceString - The input string.
     * @returns {number[]} An array of numerical character codes.
     */
    const getStringCharCodes = (sourceString) => {
        if (typeof sourceString !== 'string') {
            throw new TypeError('Input must be a string for getStringCharCodes.');
        }
        const charCodeArray = [];
        for (let charIdx = 0; charIdx < sourceString.length; ++charIdx) {
            charCodeArray.push(sourceString.charCodeAt(charIdx));
        }
        return charCodeArray;
    };

    /**
     * Reconstructs a full string from an array of Unicode code points.
     * This function intelligently handles arrays of arbitrary size by chunking them
     * to circumvent limitations of `String.fromCharCode.apply` on large inputs.
     * @param {number[]} codePointSequence - An array of character code numbers.
     * @returns {string} The assembled string.
     */
    const buildStringFromCodePointSequence = (codePointSequence) => {
        if (!Array.isArray(codePointSequence) || codePointSequence.some(val => !Number.isInteger(val))) {
            throw new TypeError('Input must be an array of integers for buildStringFromCodePointSequence.');
        }
        if (codePointSequence.length === 0) {
            return '';
        }

        const assembledParts = [];
        const OPTIMAL_CHUNK_SIZE = 32768; // A safe chunk size for String.fromCharCode.apply.
        for (let chunkStart = 0; chunkStart < codePointSequence.length; chunkStart += OPTIMAL_CHUNK_SIZE) {
            const currentChunk = codePointSequence.slice(chunkStart, chunkStart + OPTIMAL_CHUNK_SIZE);
            assembledParts.push(String.fromCharCode(...currentChunk));
        }
        return assembledParts.join('');
    };

    // --- Fundamental Base64 Encoding/Decoding Algorithms ---

    /**
     * Converts an array of 8-bit byte values (typically representing UTF-8 data)
     * into a Base64 encoded string. This process includes standard Base64 padding.
     * @param {number[]} byteDataArray - An array of byte values (0-255).
     * @returns {string} The Base64 representation of the input bytes.
     */
    const convertByteArrayToBase64String = (byteDataArray) => {
        if (!Array.isArray(byteDataArray) || byteDataArray.some(b => !Number.isInteger(b) || b < 0 || b > 255)) {
            throw new TypeError('Input must be an array of 0-255 byte integers for convertByteArrayToBase64String.');
        }

        let mutableBytes = [...byteDataArray]; // Create a working copy to allow padding
        let numPaddingBytes = 0;

        // Ensure the byte array length is a multiple of 3 by adding zero bytes.
        while (mutableBytes.length % 3 !== 0) {
            mutableBytes.push(0);
            numPaddingBytes++;
        }

        const encodedCharCodes = [];
        const BYTES_IN_TRIPLET = 3;

        for (let i = 0; i < mutableBytes.length; i += BYTES_IN_TRIPLET) {
            const firstByte = mutableBytes[i];
            const secondByte = mutableBytes[i + 1];
            const thirdByte = mutableBytes[i + 2];

            // Combine three 8-bit bytes into a single 24-bit integer.
            const twentyFourBitValue = (firstByte << 16) | (secondByte << 8) | thirdByte;

            // Extract four 6-bit segments from the 24-bit value and map them
            // to their corresponding Base64 characters using the pre-computed table.
            encodedCharCodes.push(
                BASE64_INDEX_TO_CHAR_CODES[(twentyFourBitValue >>> 18) & 0x3F], // First 6 bits
                BASE64_INDEX_TO_CHAR_CODES[(twentyFourBitValue >>> 12) & 0x3F], // Second 6 bits
                BASE64_INDEX_TO_CHAR_CODES[(twentyFourBitValue >>> 6) & 0x3F],  // Third 6 bits
                BASE64_INDEX_TO_CHAR_CODES[twentyFourBitValue & 0x3F]           // Fourth 6 bits
            );
        }

        // Apply Base64 padding characters ('=') based on the number of zero bytes added.
        const equalsCharCode = '='.charCodeAt(0);
        for (let j = 0; j < numPaddingBytes; ++j) {
            encodedCharCodes[encodedCharCodes.length - 1 - j] = equalsCharCode;
        }

        return buildStringFromCodePointSequence(encodedCharCodes);
    };

    /**
     * Decodes a Base64 encoded string back into an array of 8-bit byte values.
     * This function automatically handles padding characters and invalid Base64 characters.
     * @param {string} base64InputString - The Base64 string to decode.
     * @returns {number[]} An array of decoded byte values.
     */
    const convertBase64StringToByteArray = (base64InputString) => {
        if (typeof base64InputString !== 'string') {
            throw new TypeError('Input must be a string for convertBase64StringToByteArray.');
        }

        // Remove any characters not part of the standard Base64 alphabet,
        // including whitespace and any non-padding equals signs.
        const sanitizedString = base64InputString.replace(/[^A-Za-z0-9+/=]/g, '');

        // Provide a warning if the sanitized string length is not a multiple of 4,
        // which typically indicates a malformed Base64 string.
        if (sanitizedString.length % 4 !== 0 && sanitizedString.length > 0) {
             console.warn('Base64 string length is not a multiple of 4 after sanitization; potential malformation detected.');
        }

        const decodedByteValues = [];
        const BASE64_CHUNK_SIZE = 4; // Each 4 Base64 chars represent 3 bytes.

        for (let i = 0; i < sanitizedString.length; i += BASE64_CHUNK_SIZE) {
            const charA = sanitizedString.charAt(i);
            const charB = sanitizedString.charAt(i + 1);
            const charC = sanitizedString.charAt(i + 2);
            const charD = sanitizedString.charAt(i + 3);

            // Fetch numerical values for each Base64 character.
            // If a character is '=', its value is treated as 0 for bitwise operations,
            // with padding handled later by length adjustment.
            const valA = BASE64_CHAR_TO_VALUE_MAP[charA] || 0;
            const valB = BASE64_CHAR_TO_VALUE_MAP[charB] || 0;
            const valC = BASE64_CHAR_TO_VALUE_MAP[charC] || 0;
            const valD = BASE64_CHAR_TO_VALUE_MAP[charD] || 0;

            // Combine four 6-bit values into a single 24-bit integer.
            const combinedTwentyFourBits = (valA << 18) | (valB << 12) | (valC << 6) | valD;

            // Extract the three original 8-bit bytes from the 24-bit integer.
            decodedByteValues.push(
                (combinedTwentyFourBits >>> 16) & 0xFF, // First byte
                (combinedTwentyFourBits >>> 8) & 0xFF,  // Second byte
                combinedTwentyFourBits & 0xFF           // Third byte
            );
        }

        // Adjust the length of the decoded byte array based on padding characters.
        // If '==' is present, remove 2 bytes; if '=' is present, remove 1 byte.
        const explicitPaddingCount = (sanitizedString.endsWith('==') ? 2 : sanitizedString.endsWith('=') ? 1 : 0);
        if (explicitPaddingCount > 0) {
            decodedByteValues.length -= explicitPaddingCount;
        }

        return decodedByteValues;
    };

    // --- UTF-8 <-> UTF-16 Code Point Array Conversion ---

    /**
     * Converts an array of UTF-16 code points (as typically found in JavaScript strings)
     * into an array of UTF-8 byte values. This function primarily handles the Basic Multilingual Plane (BMP).
     * @param {number[]} utf16CodePointArray - Array of UTF-16 code points.
     * @returns {number[]} Array of UTF-8 byte values.
     */
    const convertUtf16CodePointsToUtf8Bytes = (utf16CodePointArray) => {
        if (!Array.isArray(utf16CodePointArray) || utf16CodePointArray.some(val => !Number.isInteger(val))) {
            throw new TypeError('Input must be an array of integers for convertUtf16CodePointsToUtf8Bytes.');
        }

        const utf8ByteResult = [];
        for (const currentCodePoint of utf16CodePointArray) {
            if (currentCodePoint < 0x80) { // 1-byte sequence (0-127 ASCII range)
                utf8ByteResult.push(currentCodePoint);
            } else if (currentCodePoint < 0x800) { // 2-byte sequence (128-2047)
                utf8ByteResult.push(
                    0xC0 | (currentCodePoint >> 6),
                    0x80 | (currentCodePoint & 0x3F)
                );
            } else { // 3-byte sequence (2048-65535, BMP characters)
                // Note: This implementation follows the original's behavior of not
                // explicitly handling surrogate pairs or 4-byte UTF-8 sequences.
                // Characters outside the BMP (>= 0x10000) would be incorrectly
                // encoded as 3-byte sequences.
                utf8ByteResult.push(
                    0xE0 | (currentCodePoint >> 12),
                    0x80 | ((currentCodePoint >> 6) & 0x3F),
                    0x80 | (currentCodePoint & 0x3F)
                );
            }
        }
        return utf8ByteResult;
    };

    /**
     * Converts an array of UTF-8 byte values into an array of UTF-16 code points.
     * This function handles 1, 2, and 3-byte UTF-8 sequences, converting them
     * into their corresponding single UTF-16 code points. Malformed sequences
     * or those representing supplementary characters (requiring surrogate pairs)
     * will result in the Unicode Replacement Character (U+FFFD).
     * @param {number[]} utf8ByteSequence - Array of UTF-8 byte values.
     * @returns {number[]} Array of UTF-16 code points.
     */
    const convertUtf8BytesToUtf16CodePoints = (utf8ByteSequence) => {
        if (!Array.isArray(utf8ByteSequence) || utf8ByteSequence.some(b => !Number.isInteger(b) || b < 0 || b > 255)) {
            throw new TypeError('Input must be an array of 0-255 byte integers for convertUtf8BytesToUtf16CodePoints.');
        }

        const utf16CodePointResult = [];
        let byteIndex = 0;
        const sequenceLength = utf8ByteSequence.length;
        const REPLACEMENT_CHAR = 0xFFFD; // Unicode replacement character for errors.

        while (byteIndex < sequenceLength) {
            const byteOne = utf8ByteSequence[byteIndex++];
            let decodedCodePoint;

            if (byteOne < 0x80) { // 1-byte sequence (ASCII)
                decodedCodePoint = byteOne;
            } else if ((byteOne & 0xE0) === 0xC0) { // 2-byte sequence
                const byteTwo = utf8ByteSequence[byteIndex++];
                if ((byteTwo & 0xC0) !== 0x80) { // Malformed continuation byte
                    console.warn('Malformed UTF-8 sequence detected (2-byte, invalid continuation).');
                    decodedCodePoint = REPLACEMENT_CHAR;
                } else {
                    decodedCodePoint = ((byteOne & 0x1F) << 6) | (byteTwo & 0x3F);
                }
            } else if ((byteOne & 0xF0) === 0xE0) { // 3-byte sequence
                const byteTwo = utf8ByteSequence[byteIndex++];
                const byteThree = utf8ByteSequence[byteIndex++];
                if ((byteTwo & 0xC0) !== 0x80 || (byteThree & 0xC0) !== 0x80) { // Malformed continuation bytes
                    console.warn('Malformed UTF-8 sequence detected (3-byte, invalid continuation).');
                    decodedCodePoint = REPLACEMENT_CHAR;
                } else {
                    decodedCodePoint = ((byteOne & 0x0F) << 12) | ((byteTwo & 0x3F) << 6) | (byteThree & 0x3F);
                }
            } else { // Malformed start byte or 4-byte sequence (original does not support 4-byte)
                // For Type III, we mimic original's behavior: 4-byte sequences are treated as errors.
                console.warn('Malformed UTF-8 sequence detected (invalid start byte or unsupported 4-byte sequence).');
                decodedCodePoint = REPLACEMENT_CHAR;
                // Skip additional bytes if this was potentially a 4-byte sequence start,
                // to prevent further malformed errors from subsequent bytes.
                if ((byteOne & 0xF8) === 0xF0) { // Potentially 4-byte start
                    byteIndex += 3; // Consume next 3 bytes
                }
            }
            utf16CodePointResult.push(decodedCodePoint);
        }
        return utf16CodePointResult;
    };

    // --- High-Level Conversion Functions (String <-> Base64 and String <-> String) ---

    /**
     * Encodes a standard JavaScript string (assumed to contain only characters
     * representable as single UTF-8 bytes, e.g., ASCII or Latin-1) into Base64.
     * @param {string} rawString - The input string.
     * @returns {string} The Base64 encoded string.
     */
    const encodeAsciiStringToBase64 = (rawString) => {
        return convertByteArrayToBase64String(getStringCharCodes(rawString));
    };

    /**
     * Decodes a Base64 string into a standard JavaScript string, assuming the
     * decoded bytes represent an ASCII or Latin-1 compatible string.
     * @param {string} encodedBase64Text - The Base64 string.
     * @returns {string} The decoded string.
     */
    const decodeBase64ToAsciiString = (encodedBase64Text) => {
        return buildStringFromCodePointSequence(convertBase64StringToByteArray(encodedBase64Text));
    };

    /**
     * Converts a string (interpreted as UTF-16 code units) to an array of UTF-8 byte values.
     * @param {string} utf16SourceString - The input UTF-16 string.
     * @returns {number[]} Array of UTF-8 byte values.
     */
    const utf16StringToUtf8ByteArray = (utf16SourceString) => {
        return convertUtf16CodePointsToUtf8Bytes(getStringCharCodes(utf16SourceString));
    };

    /**
     * Converts an array of UTF-8 byte values into a string (interpreting bytes
     * as UTF-16 code units).
     * @param {number[]} utf8BytesSource - Array of UTF-8 byte values.
     * @returns {string} The resulting UTF-16 string.
     */
    const utf8ByteArrayToUtf16String = (utf8BytesSource) => {
        return buildStringFromCodePointSequence(convertUtf8BytesToUtf16CodePoints(utf8BytesSource));
    };

    /**
     * Converts a string (UTF-16) to another string (UTF-8 representation).
     * This is a full Unicode-aware conversion for string-to-string.
     * @param {string} utf16InputString - The input string (UTF-16).
     * @returns {string} The output string (UTF-8 equivalent).
     */
    const convertUtf16StringToUtf8String = (utf16InputString) => {
        const utf16CodeUnits = getStringCharCodes(utf16InputString);
        const utf8Bytes = convertUtf16CodePointsToUtf8Bytes(utf16CodeUnits);
        return buildStringFromCodePointSequence(utf8Bytes);
    };

    /**
     * Converts a string (UTF-8 representation) to another string (UTF-16 equivalent).
     * This is a full Unicode-aware conversion for string-to-string.
     * @param {string} utf8InputString - The input string (UTF-8).
     * @returns {string} The output string (UTF-16 equivalent).
     */
    const convertUtf8StringToUtf16String = (utf8InputString) => {
        const utf8CodeUnits = getStringCharCodes(utf8InputString); // Here, char codes are treated as bytes
        const utf16CodePoints = convertUtf8BytesToUtf16CodePoints(utf8CodeUnits);
        return buildStringFromCodePointSequence(utf16CodePoints);
    };

    // --- Browser Native API Integration and Fallbacks ---

    let nativeBase64Encoder = null;
    let nativeBase64Decoder = null;

    let universalEncodeUtf16ToBase64 = null;
    let universalDecodeBase64ToUtf16 = null;

    // Check for the presence of native `btoa` function for Base64 encoding.
    if (typeof runtimeEnvironment.btoa === 'function') {
        nativeBase64Encoder = runtimeEnvironment.btoa;
        // Native btoa expects a "binary string" (where each character's code is a byte value).
        // Therefore, we convert the UTF-16 input string to a UTF-8 "binary string" first.
        universalEncodeUtf16ToBase64 = (inputUnicodeString) => {
            const utf8BinaryString = convertUtf16StringToUtf8String(inputUnicodeString);
            return nativeBase64Encoder(utf8BinaryString);
        };
    } else {
        nativeBase64Encoder = encodeAsciiStringToBase64; // Fallback to our custom ASCII-compatible encoder.
        // If native btoa is not available, we use our custom implementation.
        // This involves converting the UTF-16 input string to UTF-8 bytes, then encoding those bytes.
        universalEncodeUtf16ToBase64 = (inputUnicodeString) => {
            const utf16CodeUnits = getStringCharCodes(inputUnicodeString);
            const utf8Bytes = convertUtf16CodePointsToUtf8Bytes(utf16CodeUnits);
            return convertByteArrayToBase64String(utf8Bytes);
        };
    }

    // Check for the presence of native `atob` function for Base64 decoding.
    if (typeof runtimeEnvironment.atob === 'function') {
        nativeBase64Decoder = runtimeEnvironment.atob;
        // Native atob returns a "binary string" (UTF-8 bytes as characters).
        // We then convert this binary string back to a proper UTF-16 JavaScript string.
        universalDecodeBase64ToUtf16 = (base64Input) => {
            const utf8BinaryString = nativeBase64Decoder(base64Input);
            return convertUtf8StringToUtf16String(utf8BinaryString);
        };
    } else {
        nativeBase64Decoder = decodeBase64ToAsciiString; // Fallback to our custom ASCII-compatible decoder.
        // If native atob is not available, we use our custom implementation.
        // This involves decoding the Base64 string to UTF-8 bytes, then converting those bytes to a UTF-16 string.
        universalDecodeBase64ToUtf16 = (base64Input) => {
            const utf8Bytes = convertBase64StringToByteArray(base64Input);
            return utf8ByteArrayToUtf16String(utf8Bytes);
        };
    }

    // --- Public API Exposure (CodecService) ---

    // The main object exported to the global context, providing all conversion functions.
    runtimeEnvironment.CodecService = {
        // Direct byte array <-> Base64 conversions
        encodeBytesToBase64: convertByteArrayToBase64String,
        decodeBase64ToBytes: convertBase64StringToByteArray,

        // UTF-16 Code Points <-> UTF-8 Byte Array conversions
        convertUtf16CodesToUtf8Bytes: convertUtf16CodePointsToUtf8Bytes,
        convertUtf8BytesToUtf16Codes: convertUtf8BytesToUtf16CodePoints,

        // String <-> Base64 conversions (assuming ASCII/Latin-1 compatible strings)
        encodeAsciiToBase64: encodeAsciiStringToBase64,
        decodeBase64ToAscii: decodeBase64ToAsciiString,

        // String <-> String conversions (Unicode-aware)
        encodeUtf16ToUtf8String: convertUtf16StringToUtf8String,
        decodeUtf8ToUtf16String: convertUtf8StringToUtf16String,

        // String (UTF-16) to UTF-8 Byte Array, and vice-versa
        utf16StringToUtf8ByteArray: utf16StringToUtf8ByteArray,
        utf8ByteArrayToUtf16String: utf8ByteArrayToUtf16String,

        // Universal Base64 <-> UTF-16 String conversions (utilizes native APIs if available)
        universalEncode: universalEncodeUtf16ToBase64,
        universalDecode: universalDecodeBase64ToUtf16,

        // Exposed native/fallback functions for direct access if needed
        getNativeBase64Encoder: nativeBase64Encoder,
        getNativeBase64Decoder: nativeBase64Decoder,

        // Common aliases for convenience
        fromBase64String: decodeBase64ToAsciiString,
        toBase64String: encodeAsciiStringToBase64,
        encodeFullString: universalEncodeUtf16ToBase64, // Alias for universalEncode
        decodeFullString: universalDecodeBase64ToUtf16, // Alias for universalDecode

        // URI-safe Base64 encoding/decoding, suitable for URLs and filenames
        encodeUriComponentSafe: (sourceContent) => {
            if (typeof sourceContent !== 'string') {
                throw new TypeError('Input for encodeUriComponentSafe must be a string.');
            }
            // First, perform standard Base64 encoding using the universal method.
            const standardBase64 = universalEncodeUtf16ToBase64(sourceContent);
            // Replace '+' with '-' and '/' with '_', then remove trailing padding '='.
            return standardBase64.replace(/[+\/]/g, (matchedChar) => {
                return (matchedChar === '+') ? '-' : '_';
            }).replace(/=+$/, ''); // Remove padding characters for URI safety.
        },
        decodeUriComponentSafe: (encodedUriContent) => {
            if (typeof encodedUriContent !== 'string') {
                throw new TypeError('Input for decodeUriComponentSafe must be a string.');
            }
            // Reverse the URI-safe character substitutions.
            let standardBase64 = encodedUriContent.replace(/[-_]/g, (matchedChar) => {
                return (matchedChar === '-') ? '+' : '/';
            });
            // Re-add padding characters if necessary, as Base64 length must be a multiple of 4.
            while (standardBase64.length % 4 !== 0) {
                standardBase64 += '=';
            }
            // Finally, decode the (now standard) Base64 string using the universal method.
            return universalDecodeBase64ToUtf16(standardBase64);
        }
    };

})(this);