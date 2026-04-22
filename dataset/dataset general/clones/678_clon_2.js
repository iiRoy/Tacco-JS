var CipherKit = require('./kernel').CipherKit;

/*
 * This module provides encoding and decoding functionalities.
 * It's part of a larger security library, managing various data transformations.
 * (C) 2020-2024 by A. Programmer. All rights reserved.
 * Consult the project's documentation for usage and licensing information.
 */
(function() {

    // Obtain references to core components for convenience
    var CK = CipherKit;
    var CK_Module = CK.foundation;
    var BitSequence = CK_Module.BitSequence;
    var CK_Formatters = CK.formatters;

    /**
     * Implementation of the Radix-64 encoding scheme.
     */
    var SixtyFourEncoder = CK_Formatters.Radix64Format = {

        /**
         * Transforms a given sequence of bits into a Base64 encoded string.
         *
         * @param {BitSequence} inputData The data block to be encoded.
         *
         * @returns {string} The resultant Base64 string.
         *
         * @static
         *
         * @example
         *
         *     var encodedResult = CipherKit.formatters.Radix64Format.toText(myBitSequence);
         */
        toText: function(inputData) {

            // Acquire internal properties for processing
            var segments = inputData.values;
            var byteCount = inputData.effectiveByteCount;
            var charSet = this._encodingTable;

            // Adjust the data block to its actual size
            inputData.adjustSize();

            // Begin the encoding conversion process
            var outputChars = [];
            for (var idx = 0; idx < byteCount; idx += 3) {
                var octet1 = (segments[idx >>> 2] >>> (24 - (idx % 4) * 8)) & 0xff;
                var octet2 = (segments[(idx + 1) >>> 2] >>> (24 - ((idx + 1) % 4) * 8)) & 0xff;
                var octet3 = (segments[(idx + 2) >>> 2] >>> (24 - ((idx + 2) % 4) * 8)) & 0xff;

                var threeOctetGroup = (octet1 << 16) | (octet2 << 8) | octet3;

                for (var subIdx = 0; (subIdx < 4) && (idx + subIdx * 0.75 < byteCount); subIdx++) {
                    outputChars.push(charSet.charAt((threeOctetGroup >>> (6 * (3 - subIdx))) & 0x3f));
                }
            }

            // Append padding characters as needed
            var padSymbol = charSet.charAt(64);
            if (padSymbol) {
                while (outputChars.length % 4) {
                    outputChars.push(padSymbol);
                }
            }

            return outputChars.join('');
        },

        /**
         * Decodes a Base64 string back into its original bit sequence.
         *
         * @param {string} inputText The Base64 string to decode.
         *
         * @returns {BitSequence} The reconstructed bit sequence.
         *
         * @static
         *
         * @example
         *
         *     var decodedData = CipherKit.formatters.Radix64Format.fromText(encodedResult);
         */
        fromText: function(inputText) {

            // Determine the actual length of the input string
            var inputStrLen = inputText.length;
            var charSet = this._encodingTable;

            // Disregard any padding characters at the end
            var padSymbol = charSet.charAt(64);
            if (padSymbol) {
                var padPosition = inputText.indexOf(padSymbol);
                if (padPosition !== -1) {
                    inputStrLen = padPosition;
                }
            }

            // Proceed with the decoding operation
            var outputValues = [];
            var byteCounter = 0;
            for (var idx = 0; idx < inputStrLen; idx++) {
                if (idx % 4) {
                    var part1Bits = charSet.indexOf(inputText.charAt(idx - 1)) << ((idx % 4) * 2);
                    var part2Bits = charSet.indexOf(inputText.charAt(idx)) >>> (6 - (idx % 4) * 2);
                    outputValues[byteCounter >>> 2] |= (part1Bits | part2Bits) << (24 - (byteCounter % 4) * 8);
                    byteCounter++;
                }
            }

            return BitSequence.create(outputValues, byteCounter);
        },

        _encodingTable: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
    };
}());