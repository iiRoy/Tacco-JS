(function(globalScope) {
    'use strict';

    // --- Core Data Structures & Constants ---

    // A list of the 64 characters used in standard Base64 encoding.
    var base64Alphabet = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
        'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
        'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '/'
    ];

    // A mapping from Base64 character to its 6-bit integer value.
    var characterToValue = new Map();
    for (var charIndex = 0; charIndex < base64Alphabet.length; charIndex++) {
        characterToValue.set(base64Alphabet[charIndex], charIndex);
    }
    // The padding character '=' also maps to 0 for decoding purposes.
    characterToValue.set('=', 0);

    // Reassigning String.fromCharCode for brevity and to avoid original identifier.
    var createCharFromCode = String.fromCharCode;

    // --- Byte String Conversion Utilities (UTF-16 <-> UTF-8) ---

    /**
     * Converts a standard JavaScript string (UTF-16) into a "byte string".
     * A "byte string" is a JavaScript string where each character's charCodeAt(0)
     * represents a single byte of the UTF-8 encoded version of the original string.
     * This is crucial for `btoa`/`atob` compatibility.
     * @param {string} jsInputString - The input JavaScript string (UTF-16).
     * @returns {string} The "byte string" representation (UTF-8 bytes as single-char JS string).
     */
    var convertJsStringToByteString = function(jsInputString) {
        var byteCharacterArray = [];
        for (var charPos = 0; charPos < jsInputString.length; charPos++) {
            var codeUnit = jsInputString.charCodeAt(charPos);

            if (codeUnit < 0x80) { // 1-byte UTF-8 sequence (ASCII)
                byteCharacterArray.push(createCharFromCode(codeUnit));
            } else if (codeUnit < 0x800) { // 2-byte UTF-8 sequence
                byteCharacterArray.push(createCharFromCode(0xC0 | (codeUnit >> 6)));
                byteCharacterArray.push(createCharFromCode(0x80 | (codeUnit & 0x3F)));
            } else if (codeUnit < 0xD800 || codeUnit > 0xDFFF) { // 3-byte UTF-8 sequence (excluding surrogates)
                byteCharacterArray.push(createCharFromCode(0xE0 | (codeUnit >> 12)));
                byteCharacterArray.push(createCharFromCode(0x80 | ((codeUnit >> 6) & 0x3F)));
                byteCharacterArray.push(createCharFromCode(0x80 | (codeUnit & 0x3F)));
            } else { // Surrogate pair: 4-byte UTF-8 sequence
                // Consume the next code unit (low surrogate)
                charPos++;
                var lowSurrogate = jsInputString.charCodeAt(charPos);
                var fullCodePoint = 0x10000 + ((codeUnit - 0xD800) << 10) + (lowSurrogate - 0xDC00);
                byteCharacterArray.push(createCharFromCode(0xF0 | (fullCodePoint >> 18)));
                byteCharacterArray.push(createCharFromCode(0x80 | ((fullCodePoint >> 12) & 0x3F)));
                byteCharacterArray.push(createCharFromCode(0x80 | ((fullCodePoint >> 6) & 0x3F)));
                byteCharacterArray.push(createCharFromCode(0x80 | (fullCodePoint & 0x3F)));
            }
        }
        return byteCharacterArray.join('');
    };

    /**
     * Converts a "byte string" back to a standard JavaScript string (UTF-16).
     * It parses UTF-8 byte sequences represented as single characters.
     * @param {string} byteSequence - The "byte string" to convert.
     * @returns {string} The decoded JavaScript string (UTF-16).
     */
    var convertByteStringToJsString = function(byteSequence) {
        var decodedCodeUnits = [];
        var readIndex = 0;

        while (readIndex < byteSequence.length) {
            var byteA = byteSequence.charCodeAt(readIndex);

            if (byteA < 0x80) { // Single-byte ASCII or malformed (treated as single byte)
                decodedCodeUnits.push(createCharFromCode(byteA));
                readIndex++;
            } else if ((byteA & 0xE0) === 0xC0) { // Start of a 2-byte sequence
                var byteB = byteSequence.charCodeAt(readIndex + 1);
                if ((byteB & 0xC0) === 0x80) { // Valid continuation byte
                    var charCode = ((byteA & 0x1F) << 6) | (byteB & 0x3F);
                    decodedCodeUnits.push(createCharFromCode(charCode));
                    readIndex += 2;
                } else { // Malformed, treat byteA as single byte
                    decodedCodeUnits.push(createCharFromCode(byteA));
                    readIndex++;
                }
            } else if ((byteA & 0xF0) === 0xE0) { // Start of a 3-byte sequence
                var byteB = byteSequence.charCodeAt(readIndex + 1);
                var byteC = byteSequence.charCodeAt(readIndex + 2);
                if ((byteB & 0xC0) === 0x80 && (byteC & 0xC0) === 0x80) { // Valid continuation bytes
                    var charCode = ((byteA & 0x0F) << 12) | ((byteB & 0x3F) << 6) | (byteC & 0x3F);
                    decodedCodeUnits.push(createCharFromCode(charCode));
                    readIndex += 3;
                } else { // Malformed
                    decodedCodeUnits.push(createCharFromCode(byteA));
                    readIndex++;
                }
            } else if ((byteA & 0xF8) === 0xF0) { // Start of a 4-byte sequence
                var byteB = byteSequence.charCodeAt(readIndex + 1);
                var byteC = byteSequence.charCodeAt(readIndex + 2);
                var byteD = byteSequence.charCodeAt(readIndex + 3);
                if ((byteB & 0xC0) === 0x80 && (byteC & 0xC0) === 0x80 && (byteD & 0xC0) === 0x80) { // Valid continuation bytes
                    var codePoint = ((byteA & 0x07) << 18) | ((byteB & 0x3F) << 12) | ((byteC & 0x3F) << 6) | (byteD & 0x3F);
                    if (codePoint >= 0x10000 && codePoint <= 0x10FFFF) { // Valid Unicode Supplementary Plane character
                        codePoint -= 0x10000;
                        decodedCodeUnits.push(createCharFromCode(0xD800 + (codePoint >> 10))); // High surrogate
                        decodedCodeUnits.push(createCharFromCode(0xDC00 + (codePoint & 0x3FF))); // Low surrogate
                        readIndex += 4;
                    } else { // Malformed code point, treat byteA as single byte
                        decodedCodeUnits.push(createCharFromCode(byteA));
                        readIndex++;
                    }
                } else { // Malformed
                    decodedCodeUnits.push(createCharFromCode(byteA));
                    readIndex++;
                }
            } else { // Invalid UTF-8 start byte, treat as single byte
                decodedCodeUnits.push(createCharFromCode(byteA));
                readIndex++;
            }
        }
        return decodedCodeUnits.join('');
    };

    // --- Base64 Core Encoding/Decoding ---

    /**
     * Encodes a "byte string" into a Base64 string.
     * @param {string} byteInput - The "byte string" to encode.
     * @returns {string} The Base64 encoded string.
     */
    var encodeBytesToBase64 = function(byteInput) {
        var encodedCharacters = [];
        var byteLen = byteInput.length;
        var remainingBytes;

        for (var i = 0; i < byteLen; i += 3) {
            var b1 = byteInput.charCodeAt(i);
            var b2 = (i + 1 < byteLen) ? byteInput.charCodeAt(i + 1) : 0;
            var b3 = (i + 2 < byteLen) ? byteInput.charCodeAt(i + 2) : 0;

            // Combine 3 bytes (24 bits)
            var combinedValue = (b1 << 16) | (b2 << 8) | b3;

            // Split into 4 6-bit chunks and map to Base64 characters
            encodedCharacters.push(base64Alphabet[combinedValue >> 18]);
            encodedCharacters.push(base64Alphabet[(combinedValue >> 12) & 0x3F]);
            encodedCharacters.push(base64Alphabet[(combinedValue >> 6) & 0x3F]);
            encodedCharacters.push(base64Alphabet[combinedValue & 0x3F]);
        }

        // Apply padding if necessary
        remainingBytes = byteLen % 3;
        if (remainingBytes === 1) {
            encodedCharacters[encodedCharacters.length - 1] = '=';
            encodedCharacters[encodedCharacters.length - 2] = '=';
        } else if (remainingBytes === 2) {
            encodedCharacters[encodedCharacters.length - 1] = '=';
        }

        return encodedCharacters.join('');
    };

    /**
     * Decodes a Base64 string into a "byte string".
     * @param {string} base64Input - The Base64 string to decode.
     * @returns {string} The decoded "byte string".
     */
    var decodeBase64ToBytes = function(base64Input) {
        var decodedByteCharacters = [];
        // Remove any characters that are not part of the Base64 alphabet or padding.
        var cleanedInput = base64Input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

        // Add padding if missing, as Base64 strings must have length divisible by 4.
        while (cleanedInput.length % 4 !== 0) {
            cleanedInput += '=';
        }

        for (var i = 0; i < cleanedInput.length; i += 4) {
            // Get 6-bit values for each Base64 character
            var val1 = characterToValue.get(cleanedInput.charAt(i));
            var val2 = characterToValue.get(cleanedInput.charAt(i + 1));
            var val3 = characterToValue.get(cleanedInput.charAt(i + 2));
            var val4 = characterToValue.get(cleanedInput.charAt(i + 3));

            // Combine 4 6-bit values into a 24-bit integer
            var combinedBits = (val1 << 18) | (val2 << 12) | (val3 << 6) | val4;

            // Extract 3 8-bit bytes
            decodedByteCharacters.push(createCharFromCode((combinedBits >> 16) & 0xFF));
            // Only add second byte if not padded
            if (cleanedInput.charAt(i + 2) !== '=') {
                decodedByteCharacters.push(createCharFromCode((combinedBits >> 8) & 0xFF));
            }
            // Only add third byte if not padded
            if (cleanedInput.charAt(i + 3) !== '=') {
                decodedByteCharacters.push(createCharFromCode(combinedBits & 0xFF));
            }
        }
        return decodedByteCharacters.join('');
    };

    // --- Public API Functions (Wrappers) ---

    // Store reference to any existing global 'CloneBase64' to support noConflict
    var priorGlobalReference = globalScope.CloneBase64;
    var currentLibVersion = "1.0.0";

    /**
     * Encodes a standard JavaScript string to Base64.
     * @param {string} inputData - The string to encode.
     * @param {boolean} [isUrlSafe=false] - If true, generates URL-safe Base64.
     * @returns {string} The Base64 encoded string.
     */
    var performEncoding = function(inputData, isUrlSafe) {
        var byteRepresentation = convertJsStringToByteString(String(inputData));
        var base64Output = encodeBytesToBase64(byteRepresentation);

        if (isUrlSafe) {
            return base64Output.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        }
        return base64Output;
    };

    /**
     * Decodes a Base64 string back to a standard JavaScript string.
     * Handles both standard and URL-safe Base64 inputs.
     * @param {string} encodedData - The Base64 string to decode.
     * @returns {string} The decoded JavaScript string.
     */
    var performDecoding = function(encodedData) {
        // Convert URL-safe characters back to standard Base64 characters
        var processedInput = String(encodedData).replace(/-/g, '+').replace(/_/g, '/');
        var byteRepresentation = decodeBase64ToBytes(processedInput);
        return convertByteStringToJsString(byteRepresentation);
    };

    /**
     * Encodes a standard JavaScript string to URL-safe Base64.
     * @param {string} inputData - The string to encode.
     * @returns {string} The URL-safe Base64 encoded string.
     */
    var performUrlSafeEncoding = function(inputData) {
        return performEncoding(inputData, true);
    };

    /**
     * Direct Base64 encoding of a "byte string" (equivalent to `btoa`).
     * @param {string} byteString - The "byte string" to encode.
     * @returns {string} The Base64 encoded string.
     */
    var directByteStringEncoder = function(byteString) {
        return encodeBytesToBase64(byteString);
    };

    /**
     * Direct Base64 decoding to a "byte string" (equivalent to `atob`).
     * @param {string} base64String - The Base64 string to decode.
     * @returns {string} The decoded "byte string".
     */
    var directByteStringDecoder = function(base64String) {
        return decodeBase64ToBytes(base64String);
    };

    /**
     * Restores the previous value of `globalScope.CloneBase64` and returns this library's reference.
     * @returns {object} The current `CloneBase64` object.
     */
    var revertGlobalReference = function() {
        var currentLib = globalScope.CloneBase64;
        globalScope.CloneBase64 = priorGlobalReference;
        return currentLib;
    };

    // --- Export the new Base64 library ---
    globalScope.CloneBase64 = {
        LIB_VERSION: currentLibVersion,
        // Public API for full string encoding/decoding
        encodeText: performEncoding,
        decodeText: performDecoding,
        encodeTextUrlSafe: performUrlSafeEncoding,

        // Low-level byte string conversions (for advanced use, or if input is already a byte string)
        toByteString: convertJsStringToByteString,
        fromByteString: convertByteStringToJsString,
        encodeByteString: directByteStringEncoder,
        decodeByteString: directByteStringDecoder,

        // Utility for managing global namespace
        noConflict: revertGlobalReference
    };

})(this);