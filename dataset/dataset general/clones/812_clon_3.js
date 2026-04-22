/*
 * File: base64_utility_kit.js - An advanced Base64 encoding/decoding module.
 *
 * This utility provides robust Base64 operations, including UTF-8 support
 * and URI-safe variants, while ensuring backward compatibility.
 *
 * Original project license: MIT License (http://opensource.org/licenses/mit-license)
 *
 * Key References:
 *   - Base64 encoding standard: https://en.wikipedia.org/wiki/Base64
 *   - UTF-8 encoding: https://en.wikipedia.org/wiki/UTF-8
 */

(function(executionScope) {
    'use strict';

    // Store a reference to any pre-existing Base64 implementation
    // to facilitate a no-conflict mode.
    const previousB64Instance = executionScope.Base64;

    // Current version identifier for this module.
    const currentRevision = "3.0.1"; // Updated version for the clone

    // Determine if Node.js Buffer API is available.
    let envBuffer = null;
    if (typeof module !== 'undefined' && module.exports) {
        // In a Node.js environment, load the Buffer class.
        try {
            envBuffer = require('node:buffer').Buffer;
        } catch (error) {
            // Fallback if 'node:buffer' is not directly available,
            // though 'buffer' is usually globally accessible in Node.js contexts.
            envBuffer = require('buffer').Buffer;
        }
    }

    // The standard Base64 character set.
    const encodingCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    // Pre-computed lookup table for efficient decoding.
    // Maps each Base64 character to its corresponding 6-bit integer value.
    const decodingLookup = (() => {
        const charMap = {};
        for (let idx = 0; idx < encodingCharacters.length; idx++) {
            charMap[encodingCharacters.charAt(idx)] = idx;
        }
        return charMap;
    })();

    // Alias for String.fromCharCode for brevity and potential performance.
    const getCharFromCode = String.fromCharCode;

    // --- Encoding Utilities ---

    // Converts a UTF-16 character (or surrogate pair) into its UTF-8 byte sequence string.
    const convertUtf16CharToUtf8Bytes = (inputChar) => {
        // Validate input: should be a single character or a surrogate pair.
        if (typeof inputChar !== 'string' || inputChar.length === 0) {
            return ''; // Or throw an error for invalid input.
        }

        const firstCodePoint = inputChar.codePointAt(0);

        // Handle basic multilingual plane characters (BMP: U+0000 to U+FFFF)
        if (firstCodePoint < 0x80) { // 1-byte sequence (ASCII)
            return inputChar;
        } else if (firstCodePoint < 0x800) { // 2-byte sequence
            return (
                getCharFromCode(0xC0 | (firstCodePoint >>> 6)) +
                getCharFromCode(0x80 | (firstCodePoint & 0x3F))
            );
        } else if (firstCodePoint < 0x10000) { // 3-byte sequence (BMP, excluding surrogates)
            return (
                getCharFromCode(0xE0 | ((firstCodePoint >>> 12) & 0x0F)) +
                getCharFromCode(0x80 | ((firstCodePoint >>> 6) & 0x3F)) +
                getCharFromCode(0x80 | (firstCodePoint & 0x3F))
            );
        } else { // 4-byte sequence (supplementary planes, handled by surrogate pairs in JS strings)
            // The original code calculates the actual code point from a surrogate pair.
            // We can directly use codePointAt(0) for this in modern JS.
            // If the input was a single char from a surrogate pair, it would be incorrect.
            // Assuming inputChar is a full surrogate pair string.
            const actualCodePoint = 0x10000 + (inputChar.charCodeAt(0) - 0xD800) * 0x400 + (inputChar.charCodeAt(1) - 0xDC00);
            return (
                getCharFromCode(0xF0 | ((actualCodePoint >>> 18) & 0x07)) +
                getCharFromCode(0x80 | ((actualCodePoint >>> 12) & 0x3F)) +
                getCharFromCode(0x80 | ((actualCodePoint >>> 6) & 0x3F)) +
                getCharFromCode(0x80 | (actualCodePoint & 0x3F))
            );
        }
    };

    // Regular expression to match non-ASCII characters or UTF-16 surrogate pairs.
    const nonAsciiOrSurrogateRegex = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;

    // Converts a UTF-16 string to a UTF-8 byte string.
    const convertUtf16ToUtf8Bytes = (utf16String) => {
        return utf16String.replace(nonAsciiOrSurrogateRegex, convertUtf16CharToUtf8Bytes);
    };

    // Encodes a chunk of 1-3 bytes into 4 Base64 characters.
    const encodeByteChunkToBase64 = (byteChunk) => {
        const chunkLength = byteChunk.length;
        const paddingRequired = [0, 2, 1][chunkLength % 3];

        // Combine up to 3 bytes into a single 24-bit integer.
        // If a byte is missing (e.g., chunkLength is 1 or 2), it defaults to 0.
        const combinedBits =
            (byteChunk.charCodeAt(0) << 16) |
            ((chunkLength > 1 ? byteChunk.charCodeAt(1) : 0) << 8) |
            ((chunkLength > 2 ? byteChunk.charCodeAt(2) : 0));

        // Extract 6-bit segments and map them to Base64 characters.
        const char1 = encodingCharacters.charAt(combinedBits >>> 18);
        const char2 = encodingCharacters.charAt((combinedBits >>> 12) & 0x3F); // 63
        const char3 = paddingRequired >= 2 ? '=' : encodingCharacters.charAt((combinedBits >>> 6) & 0x3F);
        const char4 = paddingRequired >= 1 ? '=' : encodingCharacters.charAt(combinedBits & 0x3F);

        // Concatenate the four characters.
        return char1 + char2 + char3 + char4;
    };

    // Provides `btoa` functionality (binary-to-ASCII).
    // Uses native `btoa` if available, otherwise a custom implementation.
    const base64EncodeBinaryString = executionScope.btoa ? (inputBinary) => {
        return executionScope.btoa(inputBinary);
    } : (inputBinary) => {
        // Process the binary string in chunks of 1 to 3 characters.
        return inputBinary.replace(/.{1,3}/g, encodeByteChunkToBase64);
    };

    // Internal encoding function that handles Node.js Buffer or falls back to string processing.
    const internalEncodeOperation = envBuffer ? (dataToProcess) => {
        // If it's already a Buffer, use it directly; otherwise, create a new Buffer.
        const targetBuffer = (dataToProcess.constructor === envBuffer.constructor)
            ? dataToProcess
            : envBuffer.from(dataToProcess, 'utf8'); // Assume UTF-8 if not already a Buffer.

        return targetBuffer.toString('base64');
    }
    : (dataToProcess) => {
        // For browsers or non-Node environments, convert to UTF-8 bytes string, then Base64 encode.
        return base64EncodeBinaryString(convertUtf16ToUtf8Bytes(dataToProcess));
    };

    // Main encoding function.
    const encodeData = (sourceData, isUriFriendly = false) => {
        // Ensure input is a string.
        const stringifiedData = String(sourceData);
        if (stringifiedData.length === 0) {
            return ''; // Return empty string for empty input.
        }

        let encodedResult = internalEncodeOperation(stringifiedData);

        // Apply URI-safe modifications if requested.
        if (isUriFriendly) {
            // Replace '+' with '-' and '/' with '_', then remove padding '='.
            encodedResult = encodedResult.replace(/[+\/]/g, (match) => {
                return match === '+' ? '-' : '_';
            }).replace(/=/g, '');
        }
        return encodedResult;
    };

    // Convenience function for URI-safe encoding.
    const encodeDataUriSafe = (sourceData) => encodeData(sourceData, true);

    // --- Decoding Utilities ---

    // Regular expression to match multi-byte UTF-8 sequences.
    const multiByteUtf8Regex = new RegExp([
        '[\xC0-\xDF][\x80-\xBF]',          // 2-byte sequence
        '[\xE0-\xEF][\x80-\xBF]{2}',       // 3-byte sequence
        '[\xF0-\xF7][\x80-\xBF]{3}'        // 4-byte sequence
    ].join('|'), 'g');

    // Converts a UTF-8 byte sequence string to a UTF-16 character (or surrogate pair).
    const convertUtf8BytesToUtf16Char = (utf8ByteSequence) => {
        const sequenceLength = utf8ByteSequence.length;
        const firstByteCode = utf8ByteSequence.charCodeAt(0);

        if (sequenceLength === 4) { // 4-byte sequence (U+10000 to U+10FFFF)
            const codePoint = (
                ((firstByteCode & 0x07) << 18) |
                ((utf8ByteSequence.charCodeAt(1) & 0x3F) << 12) |
                ((utf8ByteSequence.charCodeAt(2) & 0x3F) << 6) |
                (utf8ByteSequence.charCodeAt(3) & 0x3F)
            );
            const offsetFromBMP = codePoint - 0x10000;
            return (
                getCharFromCode((offsetFromBMP >>> 10) + 0xD800) +
                getCharFromCode((offsetFromBMP & 0x3FF) + 0xDC00)
            );
        } else if (sequenceLength === 3) { // 3-byte sequence (U+0800 to U+FFFF, excluding surrogates)
            return getCharFromCode(
                ((firstByteCode & 0x0F) << 12) |
                ((utf8ByteSequence.charCodeAt(1) & 0x3F) << 6) |
                (utf8ByteSequence.charCodeAt(2) & 0x3F)
            );
        } else if (sequenceLength === 2) { // 2-byte sequence (U+0080 to U+07FF)
            return getCharFromCode(
                ((firstByteCode & 0x1F) << 6) |
                (utf8ByteSequence.charCodeAt(1) & 0x3F)
            );
        }
        // Fallback for unexpected lengths, though regex should prevent this.
        return utf8ByteSequence;
    };

    // Converts a UTF-8 byte string back to a UTF-16 string.
    const convertUtf8BytesToUtf16 = (utf8ByteString) => {
        return utf8ByteString.replace(multiByteUtf8Regex, convertUtf8BytesToUtf16Char);
    };

    // Decodes a 4-character Base64 block into a 1-3 byte string.
    const decodeBase64CharBlock = (base64CharBlock) => {
        const blockLen = base64CharBlock.length;
        const actualPadding = blockLen % 4; // Should be 0, but good for robust checks.

        // Retrieve 6-bit values for each character using the lookup table.
        // Pad characters are effectively 0 for the bitwise operations.
        const val1 = decodingLookup[base64CharBlock.charAt(0)] || 0;
        const val2 = decodingLookup[base64CharBlock.charAt(1)] || 0;
        const val3 = decodingLookup[base64CharBlock.charAt(2)] || 0;
        const val4 = decodingLookup[base64CharBlock.charAt(3)] || 0;

        // Combine the 6-bit values into a 24-bit integer.
        const decodedValue = (val1 << 18) | (val2 << 12) | (val3 << 6) | val4;

        // Extract the original bytes.
        const resultBytes = [
            getCharFromCode(decodedValue >>> 16),
            getCharFromCode((decodedValue >>> 8) & 0xFF), // 255
            getCharFromCode(decodedValue & 0xFF)
        ];

        // Adjust length based on padding.
        if (base64CharBlock.endsWith('==')) {
            resultBytes.pop(); // Remove the last byte
            resultBytes.pop(); // Remove the second to last byte
        } else if (base64CharBlock.endsWith('=')) {
            resultBytes.pop(); // Remove the last byte
        }

        return resultBytes.join('');
    };

    // Provides `atob` functionality (ASCII-to-binary).
    // Uses native `atob` if available, otherwise a custom implementation.
    const base64DecodeBinaryString = executionScope.atob ? (inputEncoded) => {
        return executionScope.atob(inputEncoded);
    } : (inputEncoded) => {
        // Process the Base64 string in chunks of 1 to 4 characters.
        // Note: `.{1,4}` is functionally equivalent to `[\s\S]{1,4}` for this purpose.
        return inputEncoded.replace(/.{1,4}/g, decodeBase64CharBlock);
    };

    // Internal decoding function that handles Node.js Buffer or falls back to string processing.
    const internalDecodeOperation = envBuffer ? (inputEncoded) => {
        // If it's already a Buffer, use it directly; otherwise, create a new Buffer from Base64 string.
        const targetBuffer = (inputEncoded.constructor === envBuffer.constructor)
            ? inputEncoded
            : envBuffer.from(inputEncoded, 'base64');

        return targetBuffer.toString('utf8'); // Convert Buffer content to UTF-8 string.
    }
    : (inputEncoded) => {
        // For browsers or non-Node environments, Base64 decode to a byte string, then convert to UTF-16.
        return convertUtf8BytesToUtf16(base64DecodeBinaryString(inputEncoded));
    };

    // Main decoding function.
    const decodeData = (encodedString) => {
        const inputStr = String(encodedString);
        if (inputStr.length === 0) {
            return ''; // Handle empty input.
        }

        // Normalize URI-safe characters back to standard Base64 characters.
        // Then, remove any non-Base64 characters.
        const cleanedInput = inputStr
            .replace(/[-_]/g, (match) => (match === '-' ? '+' : '/'))
            .replace(/[^A-Za-z0-9+/=]/g, ''); // Ensure only valid Base64 characters remain.

        // Pad the string if necessary for correct decoding.
        let paddedInput = cleanedInput;
        const remainder = cleanedInput.length % 4;
        if (remainder !== 0) {
            paddedInput += '==='.slice(remainder - 1);
        }

        return internalDecodeOperation(paddedInput);
    };

    // --- Module Export and Utilities ---

    // Restores the original `Base64` object to the global scope and returns this module's `Base64`.
    const restoreOriginalBase64 = () => {
        const currentModuleRef = executionScope.Base64;
        executionScope.Base64 = previousB64Instance; // Restore previous global object.
        return currentModuleRef; // Return our module's Base64 object.
    };

    // The main Base64 API object.
    const Base64Utility = {
        VERSION: currentRevision,
        atob: base64DecodeBinaryString,
        btoa: base64EncodeBinaryString,
        fromBase64: decodeData,      // Alias for decoding.
        toBase64: encodeData,        // Alias for encoding.
        utob: convertUtf16ToUtf8Bytes, // UTF-16 string to UTF-8 byte string.
        encode: encodeData,          // Primary encoding method.
        encodeURI: encodeDataUriSafe, // URI-safe encoding.
        btou: convertUtf8BytesToUtf16, // UTF-8 byte string to UTF-16 string.
        decode: decodeData,          // Primary decoding method.
        noConflict: restoreOriginalBase64
    };

    // Assign the utility to the global scope.
    executionScope.Base64 = Base64Utility;

    // Enhance String.prototype with Base64 methods if Object.defineProperty is available.
    if (typeof Object.defineProperty === 'function') {
        // Helper to create non-enumerable property descriptors.
        const createNonEnumerablePropertyDescriptor = (valueFunction) => {
            return {
                value: valueFunction,
                enumerable: false, // Prevents iteration over these new methods.
                writable: true,    // Allows reassignment.
                configurable: true // Allows deletion or redefinition.
            };
        };

        // Add a method to extend String.prototype.
        Base64Utility.extendString = () => {
            // Guard against extending if String.prototype is somehow unavailable.
            if (!String.prototype) {
                console.warn("String.prototype not found, cannot extend.");
                return;
            }

            Object.defineProperty(
                String.prototype,
                'fromBase64',
                createNonEnumerablePropertyDescriptor(function () {
                    return decodeData(this.toString()); // Ensure `this` is treated as a string.
                })
            );
            Object.defineProperty(
                String.prototype,
                'toBase64',
                createNonEnumerablePropertyDescriptor(function (isUriSafeOption) {
                    return encodeData(this.toString(), isUriSafeOption);
                })
            );
            Object.defineProperty(
                String.prototype,
                'toBase64URI',
                createNonEnumerablePropertyDescriptor(function () {
                    return encodeDataUriSafe(this.toString());
                })
            );
        };
    }

    // Special handling for Meteor.js environment, if detected.
    if (executionScope['Meteor']) {
       // In Meteor, ensure the global Base64 variable is explicitly set,
       // as Meteor's module system might handle globals differently.
       executionScope.Base64 = Base64Utility;
    }

    // Module initialization complete.
})(this);