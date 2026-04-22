/*
 *  This file is part of a library for encoding/decoding.
 *
 *  Distributed under the MIT license terms.
 *  See: http://opensource.org/licenses/mit-license.php for details.
 *
 *  Further information can be found at:
 *    http://en.wikipedia.org/wiki/Base64_encoding
 */

(function(rootObject) {

// The standard 64 characters used in Base64 encoding.
var encodingAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Pre-calculates an array of character codes for the encoding alphabet.
var charCodeArray = (function() {
    var tempArray = [];
    var charACode = 'A'.charCodeAt(0);
    var charaCode = 'a'.charCodeAt(0);
    var char0Code = '0'.charCodeAt(0);
    for (var idx = 0; idx < 26; idx++) tempArray.push(charACode + idx);
    for (var idx = 0; idx < 26; idx++) tempArray.push(charaCode + idx);
    for (var idx = 0; idx < 10; idx++) tempArray.push(char0Code + idx);
    tempArray.push('+'.charCodeAt(0));
    tempArray.push('/'.charCodeAt(0));
    return tempArray;
})();

// Creates a lookup table to quickly find the index of a Base64 character.
var reverseLookupMap = (function(alphabetString) {
    var mappingObject = {};
    for (var idx = 0, len = alphabetString.length; idx < len; idx++) {
        mappingObject[alphabetString.charAt(idx)] = idx;
    }
    return mappingObject;
})(encodingAlphabet);

// Converts an input string into an array of its character codes (UTF-8).
var textToCodePoints = function(inputString) {
    var codePoints = [];
    for (var idx = 0, len = inputString.length; idx < len; idx++) {
        codePoints[idx] = inputString.charCodeAt(idx);
    }
    return codePoints;
};

// Encodes a byte array (UTF-8) into a Base64 string.
var encodeBytesToBase64 = function(byteSequence) {
    var paddingCount = 0;
    // Add padding bytes if the length is not a multiple of 3.
    while (byteSequence.length % 3) {
        byteSequence.push(0);
        paddingCount++;
    };
    var encodedChars = [];
    // Process bytes in chunks of 3.
    for (var idx = 0, len = byteSequence.length; idx < len; idx += 3) {
        var byteA = byteSequence[idx],
            byteB = byteSequence[idx + 1],
            byteC = byteSequence[idx + 2];
        // Ensure byte values are within expected range.
        if (byteA >= 256 || byteB >= 256 || byteC >= 256) {
            throw 'Encountered an invalid character value.';
        }
        // Combine three 8-bit bytes into a 24-bit integer.
        var combinedValue = (byteA << 16) | (byteB << 8) | byteC;
        // Split the 24-bit integer into four 6-bit parts and map to Base64 characters.
        encodedChars.push(
            charCodeArray[combinedValue >>> 18],
            charCodeArray[(combinedValue >>> 12) & 63],
            charCodeArray[(combinedValue >>> 6) & 63],
            charCodeArray[combinedValue & 63]
        );
    }
    // Apply '=' padding characters.
    while (paddingCount--) {
        encodedChars[encodedChars.length - paddingCount - 1] = '='.charCodeAt(0);
    }
    return assembleStringFromChunks(encodedChars);
};

// Decodes a Base64 string back into a byte array (UTF-8).
var decodeBase64ToBytes = function(base64Input) {
    // Remove any non-Base64 characters.
    base64Input = base64Input.replace(/[^A-Za-z0-9+\/]+/g, '');
    var decodedBytes = [];
    var remainderLength = base64Input.length % 4; // Determine padding length.
    // Process Base64 characters in chunks of 4.
    for (var idx = 0, len = base64Input.length; idx < len; idx += 4) {
        // Look up the index for each Base64 character.
        var intermediateNum = (
            (reverseLookupMap[base64Input.charAt(idx)] || 0) << 18
        ) | (
            (reverseLookupMap[base64Input.charAt(idx + 1)] || 0) << 12
        ) | (
            (reverseLookupMap[base64Input.charAt(idx + 2)] || 0) << 6
        ) | (
            (reverseLookupMap[base64Input.charAt(idx + 3)] || 0)
        );
        // Split the 24-bit integer back into three 8-bit bytes.
        decodedBytes.push(
            (intermediateNum >> 16),
            ((intermediateNum >> 8) & 0xff),
            (intermediateNum & 0xff)
        );
    }
    // Adjust length based on padding.
    decodedBytes.length -= [0, 0, 2, 1][remainderLength];
    return decodedBytes;
};

// Converts an array of UTF-16 character codes to a UTF-8 byte array.
var convertWideToNarrowBytes = function(unicodeArray) {
    var narrowBytes = [];
    for (var idx = 0, len = unicodeArray.length; idx < len; idx++) {
        var charValue = unicodeArray[idx];
        if (charValue < 0x80) { // Single-byte character
            narrowBytes.push(charValue);
        } else if (charValue < 0x800) { // Two-byte character
            narrowBytes.push(
                0xc0 | (charValue >>> 6),
                0x80 | (charValue & 0x3f)
            );
        } else { // Three-byte character
            narrowBytes.push(
                0xe0 | ((charValue >>> 12) & 0x0f),
                0x80 | ((charValue >>> 6) & 0x3f),
                0x80 | (charValue & 0x3f)
            );
        }
    }
    return narrowBytes;
};

// Converts a UTF-8 byte array to an array of UTF-16 character codes.
var convertNarrowToWideBytes = function(byteArr) {
    var wideCharBytes = [];
    for (var idx = 0, len = byteArr.length; idx < len; idx++) {
        var currentByte = byteArr[idx];
        if (currentByte < 0x80) { // Single-byte sequence
            wideCharBytes.push(currentByte);
        } else {
            var nextByte = byteArr[++idx]; // Get next byte
            if (currentByte < 0xe0) { // Two-byte sequence
                wideCharBytes.push(
                    ((currentByte & 0x1f) << 6) | (nextByte & 0x3f)
                );
            } else {
                var thirdByte = byteArr[++idx]; // Get third byte
                wideCharBytes.push(
                    ((currentByte & 0x0f) << 12) | ((nextByte & 0x3f) << 6) | (thirdByte & 0x3f)
                );
            }
        }
    }
    return wideCharBytes;
};

// Converts a UTF-8 string directly to a Base64 string.
var encodeTextToBase64 = function(inputString) {
    return encodeBytesToBase64(textToCodePoints(inputString));
};

// Converts a Base64 string directly to a UTF-8 string.
var decodeBase64ToText = function(base64Input) {
    return assembleStringFromChunks(decodeBase64ToBytes(base64Input));
};

// Converts a UTF-8 string to an array of UTF-16 character codes.
var convertTextToWideBytes = function(inputString) {
    return convertNarrowToWideBytes(textToCodePoints(inputString));
};

// Converts a UTF-8 byte array to a UTF-16 string.
var convertNarrowBytesToWideText = function(byteArr) {
    return assembleStringFromChunks(convertNarrowToWideBytes(byteArr));
};

// Converts a UTF-8 string to a UTF-16 string.
var convertTextToWideText = function(inputString) {
    return assembleStringFromChunks(
        convertNarrowToWideBytes(textToCodePoints(inputString))
    );
};

// Converts a UTF-16 string to a UTF-8 byte array.
var convertWideTextToNarrowBytes = function(wideTextInput) {
    return convertWideToNarrowBytes(textToCodePoints(wideTextInput));
};

// Converts a UTF-16 byte array to a UTF-8 string.
var convertWideBytesToNarrowText = function(unicodeArray) {
    return assembleStringFromChunks(convertWideToNarrowBytes(unicodeArray));
};

// Converts a UTF-16 string to a UTF-8 string.
var convertWideTextToNarrowText = function(wideTextInput) {
    return assembleStringFromChunks(
        convertWideToNarrowBytes(textToCodePoints(wideTextInput))
    );
};

/*
 *  String.fromCharCode.apply has limitations; it cannot handle arrays
 *  exceeding a certain size (typically 65536 elements) without truncating
 *  the result silently. This utility breaks large arrays into smaller chunks
 *  to avoid this issue.
 */
var assembleStringFromChunks = function(charArray) {
    var stringParts = [],
        idx;
    for (idx = 0; idx < charArray.length; idx += 65536) {
        stringParts.push(String.fromCharCode.apply(String, charArray.slice(idx, idx + 65536)));
    }
    return stringParts.join('');
};

// Check for native btoa support.
if (rootObject.btoa) {
    var binaryToBase64Encoder = rootObject.btoa;
    // Wrapper for UTF-16 string to Base64 using native btoa.
    var convertWideTextToBase64 = function(wideTextInput) {
        return binaryToBase64Encoder(convertWideTextToNarrowText(wideTextInput));
    };
} else {
    // Fallback implementation for btoa.
    var binaryToBase64Encoder = encodeTextToBase64;
    // Wrapper for UTF-16 string to Base64 using custom implementation.
    var convertWideTextToBase64 = function(wideTextInput) {
        return encodeBytesToBase64(convertWideToNarrowBytes(textToCodePoints(wideTextInput)));
    };
}

// Check for native atob support.
if (rootObject.atob) {
    var base64ToBinaryDecoder = rootObject.atob;
    // Wrapper for Base64 to UTF-16 string using native atob.
    var convertBase64ToWideText = function(base64Input) {
        return convertTextToWideText(base64ToBinaryDecoder(base64Input));
    };
} else {
    // Fallback implementation for atob.
    var base64ToBinaryDecoder = decodeBase64ToText;
    // Wrapper for Base64 to UTF-16 string using custom implementation.
    var convertBase64ToWideText = function(base64Input) {
        return convertNarrowBytesToWideText(decodeBase64ToBytes(base64Input));
    };
}

// Expose the codec utility functions globally.
rootObject.CodecUtility = {
    // Core conversion functions
    encodeBytesToBase64: encodeBytesToBase64,
    convertByteArrayToBase64: encodeBytesToBase64, // Alias
    decodeBase64ToBytes: decodeBase64ToBytes,
    convertBase64ToByteArray: decodeBase64ToBytes, // Alias
    convertWideToNarrowBytes: convertWideToNarrowBytes,
    convertUTF16ArrayToByteArray: convertWideToNarrowBytes, // Alias
    convertNarrowToWideBytes: convertNarrowToWideBytes,
    convertByteArrayToUTF16Array: convertNarrowToWideBytes, // Alias

    // String conversion functions
    encodeTextToBase64: encodeTextToBase64,
    decodeBase64ToText: decodeBase64ToText,
    convertTextToWideBytes: convertTextToWideBytes,
    convertNarrowBytesToWideText: convertNarrowBytesToWideText,
    convertByteArrayToUTF16String: convertNarrowBytesToWideText, // Alias
    convertTextToWideText: convertTextToWideText,
    convertWideTextToNarrowBytes: convertWideTextToNarrowBytes,
    convertUTF16StringToByteArray: convertWideTextToNarrowBytes, // Alias
    convertWideBytesToNarrowText: convertWideBytesToNarrowText,
    convertWideTextToNarrowText: convertWideTextToNarrowText,

    // High-level string conversions
    convertWideTextToBase64: convertWideTextToBase64,
    convertBase64ToWideText: convertBase64ToWideText,

    // Shorthand aliases for common operations
    fromBase64String: decodeBase64ToText,
    toBase64String: encodeTextToBase64,
    decoderFunction: base64ToBinaryDecoder, // Direct reference to atob/polyfill
    encoderFunction: binaryToBase64Encoder, // Direct reference to btoa/polyfill

    // UTF-8 / UTF-16 string conversions
    utf16ToUtf8: convertWideTextToNarrowText,
    utf8ToUtf16: convertTextToWideText,

    // Base64 encoding/decoding for UTF-16 strings
    encodeString: convertWideTextToBase64,
    // URL-safe Base64 encoding for UTF-16 strings
    encodeURI: function(inputVal) {
        return convertWideTextToBase64(inputVal).replace(/[+\/]/g, function(matchChar) {
            return matchChar == '+' ? '-' : '_'; // Replace '+' with '-' and '/' with '_'
        }).replace(/=+$/, ''); // Remove padding '=' characters
    },
    // Base64 decoding for UTF-16 strings
    decodeString: function(base64Input) {
        return convertBase64ToWideText(base64Input.replace(/[-_]/g, function(matchChar) {
            return matchChar == '-' ? '+' : '/'; // Replace '-' with '+' and '_' with '/'
        }));
    }
};

})(this);