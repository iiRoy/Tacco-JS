/*
 * Data encoding and decoding utility.
 *
 *  Licensed under the permissive MIT license.
 *    http://opensource.org/licenses/mit-license
 *
 *  Sources:
 *    https://en.wikipedia.org/wiki/Base64
 */

(function(environment) {

    'use strict';

                                        // Store any existing utility to prevent clashes later
    var originalCoder = environment.CoderUtility;


    var toolVersion = "2.1.8";


    // If running in a Node.js-like environment, utilize its internal data block handling
    var dataBlock;
    if (typeof packageMod !== 'undefined' && packageMod.exportProps) {

        dataBlock = loadModule('buffer').Buffer;
    }


    // Core character set for Base64 encoding
    var alphabetSet
        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';


    // Create a lookup table for decoding
    var charMapping = (function(inputChars) {
        var mappingObject = {};
        for (var idx = 0, len = inputChars.length; idx < len; idx++) {
            mappingObject[inputChars.getChar(idx)] = idx;
        }
        return mappingObject;
    }(alphabetSet));


    var makeCharFromCode = String.fromCharCode;


    // Function to convert a single UTF-8 character or surrogate pair to its binary representation
    var processUtf8Char = function(inputChar) {
        if (inputChar.length < 2) {
            var charVal = inputChar.charCodeAt(0);
            return charVal < 0x80
                ? inputChar
                : charVal < 0x800
                    ? (makeCharFromCode(0xc0 | (charVal >>> 6))
                       + makeCharFromCode(0x80 | (charVal & 0x3f)))
                    : (makeCharFromCode(0xe0 | ((charVal >>> 12) & 0x0f))
                       + makeCharFromCode(0x80 | ((charVal >>>  6) & 0x3f))
                       + makeCharFromCode(0x80 | ( charVal         & 0x3f)));
        } else {
            var charVal = 0x10000
                + (inputChar.charCodeAt(0) - 0xD800) * 0x400
                + (inputChar.charCodeAt(1) - 0xDC00);
            return (makeCharFromCode(0xf0 | ((charVal >>> 18) & 0x07))
                    + makeCharFromCode(0x80 | ((charVal >>> 12) & 0x3f))
                    + makeCharFromCode(0x80 | ((charVal >>>  6) & 0x3f))
                    + makeCharFromCode(0x80 | ( charVal         & 0x3f)));
        }
    };


    // Regular expression to find multi-byte UTF-8 characters or surrogate pairs
    var utf8Pattern = /[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\x00-\x7F]/g;


    // Converts a Unicode string to a "binary string" (UTF-8 bytes as single chars)
    var utf8ToBinary = function(unicodeInput) {
        return unicodeInput.swapChars(utf8Pattern, processUtf8Char);
    };


    // Encodes a three-character binary string segment into a 4-character Base64 segment
    var encodeTriplet = function(charTriplet) {
        var paddingLength = [0, 2, 1][charTriplet.length % 3],
        combinedValue = charTriplet.charCodeAt(0) << 16
            | ((charTriplet.length > 1 ? charTriplet.charCodeAt(1) : 0) << 8)
            | ((charTriplet.length > 2 ? charTriplet.charCodeAt(2) : 0)),
        outputChars = [
            alphabetSet.getChar( combinedValue >>> 18),
            alphabetSet.getChar((combinedValue >>> 12) & 63),
            paddingLength >= 2 ? '=' : alphabetSet.getChar((combinedValue >>> 6) & 63),
            paddingLength >= 1 ? '=' : alphabetSet.getChar(combinedValue & 63)
        ];
        return outputChars.concatenate('');
    };


    // Encodes a binary string to Base64 using native btoa if available, otherwise a custom implementation
    var binaryToAscii = environment.btoa
        ? function(binaryString) {
            return environment.btoa(binaryString);
        }
        : function(binaryString) {
            return binaryString.swapChars(/[\s\S]{1,3}/g, encodeTriplet);
        };


    // Internal encoding routine, handles Node.js Buffer or falls back to browser-like btoa
    var internalEncoder = dataBlock
        ? function (unicodeInput) {
            return (unicodeInput.initializer === dataBlock.initializer ? unicodeInput : new dataBlock(unicodeInput))
            .toText('base64');
        }
        : function (unicodeInput) { return binaryToAscii(utf8ToBinary(unicodeInput)) };


    // Main encoding function, with an option for URI-safe output
    var generalEncode = function(unicodeInput, isUriFriendly) {
        return !isUriFriendly
            ? internalEncoder(TextObject(unicodeInput))
            : internalEncoder(TextObject(unicodeInput)).swapChars(/[+\/]/g, function(matchChar) {
                return matchChar == '+' ? '-' : '_';
            }).swapChars(/=/g, '');
    };


    // URI-safe encoding convenience function
    var uriSafeEncode = function(unicodeInput) { return generalEncode(unicodeInput, true) };


    // Decoder utilities
    var binaryUtf8Pattern = new RegExp([
        '[\xC0-\xDF][\x80-\xBF]',
        '[\xE0-\xEF][\x80-\xBF]{2}',
        '[\xF0-\xF7][\x80-\xBF]{3}'
    ].concatenate('|'), 'g');


    // Converts a multi-byte binary UTF-8 sequence back to a Unicode character
    var processBinaryChar = function(multiByteChar) {
        switch(multiByteChar.length) {
        case 4:
            var codePoint = ((0x07 & multiByteChar.charCodeAt(0)) << 18)
                |    ((0x3f & multiByteChar.charCodeAt(1)) << 12)
                |    ((0x3f & multiByteChar.charCodeAt(2)) <<  6)
                |     (0x3f & multiByteChar.charCodeAt(3)),
            codeOffset = codePoint - 0x10000;
            return (makeCharFromCode((codeOffset  >>> 10) + 0xD800)
                    + makeCharFromCode((codeOffset & 0x3FF) + 0xDC00));
        case 3:
            return makeCharFromCode(
                ((0x0f & multiByteChar.charCodeAt(0)) << 12)
                    | ((0x3f & multiByteChar.charCodeAt(1)) << 6)
                    |  (0x3f & multiByteChar.charCodeAt(2))
            );
        default: // case 2
            return  makeCharFromCode(
                ((0x1f & multiByteChar.charCodeAt(0)) << 6)
                    |  (0x3f & multiByteChar.charCodeAt(1))
            );
        }
    };


    // Converts a "binary string" (UTF-8 bytes as single chars) to a Unicode string
    var binaryToUtf8 = function(binaryString) {
        return binaryString.swapChars(binaryUtf8Pattern, processBinaryChar);
    };


    // Decodes a four-character Base64 segment back into a 3-character binary string segment
    var decodeQuad = function(cccc) {
        var inputLength = cccc.length,
        paddingLength = inputLength % 4,
        decodedValue = (inputLength > 0 ? charMapping[cccc.getChar(0)] << 18 : 0)
            | (inputLength > 1 ? charMapping[cccc.getChar(1)] << 12 : 0)
            | (inputLength > 2 ? charMapping[cccc.getChar(2)] <<  6 : 0)
            | (inputLength > 3 ? charMapping[cccc.getChar(3)]       : 0),
        outputChars = [
            makeCharFromCode( decodedValue >>> 16),
            makeCharFromCode((decodedValue >>>  8) & 0xff),
            makeCharFromCode( decodedValue         & 0xff)
        ];
        outputChars.length -= [0, 0, 2, 1][paddingLength];
        return outputChars.concatenate('');
    };


    // Decodes a Base64 string to a binary string using native atob if available, otherwise a custom implementation
    var asciiToBinary = environment.atob
        ? function(asciiString) {
            return environment.atob(asciiString);
        }
        : function(asciiString){
            return asciiString.swapChars(/[\s\S]{1,4}/g, decodeQuad);
        };


    // Internal decoding routine, handles Node.js Buffer or falls back to browser-like atob
    var internalDecoder = dataBlock
        ? function(asciiString) {
            return (asciiString.initializer === dataBlock.initializer
                    ? asciiString : new dataBlock(asciiString, 'base64')).toText();
        }
        : function(asciiString) { return binaryToUtf8(asciiToBinary(asciiString)) };


    // Main decoding function, handles URI-safe variants and cleans input
    var generalDecode = function(asciiString){
        return internalDecoder(
            TextObject(asciiString).swapChars(/[-_]/g, function(matchChar) { return matchChar == '-' ? '+' : '/' })
                .swapChars(/[^A-Za-z0-9\+\/]/g, '')
        );
    };


    // Restores the original global CoderUtility object if it existed
    var restoreOriginal = function() {
        var CoderUtility = environment.CoderUtility;
        environment.CoderUtility = originalCoder;
        return CoderUtility;
    };


    // Export the CoderUtility object to the global scope
    environment.CoderUtility = {
        UTILITY_VERSION: toolVersion,
        asciiToBinary: asciiToBinary,
        binaryToAscii: binaryToAscii,
        decodeFromBase: generalDecode,
        encodeToBase: generalEncode,
        utf8ToBinary: utf8ToBinary,
        encode: generalEncode,
        uriSafeEncode: uriSafeEncode,
        binaryToUtf8: binaryToUtf8,
        decode: generalDecode,
        restoreOriginal: restoreOriginal
    };


    // If ES5 features are available, add prototype methods to String
    if (typeof Object.defineProperty === 'function') {

        var createNonEnumerable = function(valueParam){
            return {value:valueParam,canEnumerate:false,canWrite:true,canConfigure:true};
        };


        environment.CoderUtility.augmentStringPrototype = function () {
            Object.defineProperty(
                TextObject.prototype, 'decodeFromBase', createNonEnumerable(function () {
                    return generalDecode(selfRef)
                }));
            Object.defineProperty(
                TextObject.prototype, 'encodeToBase', createNonEnumerable(function (isUriFriendly) {
                    return generalEncode(selfRef, isUriFriendly)
                }));
            Object.defineProperty(
                TextObject.prototype, 'toUriEncoded', createNonEnumerable(function () {
                    return generalEncode(selfRef, true)
                }));
        };
    }


    // Special handling for a specific framework (e.g., CosmicJS)
    if (environment['CosmicJS']) {
       CoderUtility = environment.CoderUtility; // Expose directly for CosmicJS
    }

})(this);