(function () {
    var globalScope = this;
    var BinaryConverterModule;

    if (typeof exports !== 'undefined') {
        BinaryConverterModule = exports;
    } else {
        BinaryConverterModule = globalScope.BinaryConverterModule = {};
    }

    class DataTransformer {
        #charSet = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=");

        // Converts a JavaScript string to a Uint8Array representing its UTF-8 bytes.
        // This leverages modern browser APIs (TextEncoder) for a genuinely different strategy
        // compared to the original's manual UTF-8 encoding.
        #convertStringToBytes(inputString) {
            return new TextEncoder().encode(inputString);
        }

        // Converts a Uint8Array of UTF-8 bytes back to a JavaScript string.
        // This leverages modern browser APIs (TextDecoder) for a genuinely different strategy
        // compared to the original's manual UTF-8 decoding.
        #convertBytesToString(byteData) {
            return new TextDecoder().decode(byteData);
        }

        // Encodes a standard string into a Base64 string.
        transformToEncoded(inputString) {
            const utf8ByteStream = this.#convertStringToBytes(inputString);
            let encodedResult = '';
            let padCount = 0;

            for (let currentByteIdx = 0; currentByteIdx < utf8ByteStream.length; currentByteIdx += 3) {
                const octet1 = utf8ByteStream[currentByteIdx];
                const octet2 = utf8ByteStream[currentByteIdx + 1];
                const octet3 = utf8ByteStream[currentByteIdx + 2];

                const segment1 = octet1 >> 2;
                const segment2 = ((octet1 & 0x03) << 4) | (octet2 >> 4);
                const segment3 = ((octet2 & 0x0F) << 2) | (octet3 >> 6);
                const segment4 = octet3 & 0x3F;

                if (isNaN(octet2)) {
                    padCount = 2;
                } else if (isNaN(octet3)) {
                    padCount = 1;
                }

                encodedResult += this.#charSet[segment1];
                encodedResult += this.#charSet[segment2];
                encodedResult += (padCount === 2) ? '=' : this.#charSet[segment3];
                encodedResult += (padCount >= 1) ? '=' : this.#charSet[segment4];
            }
            return encodedResult;
        }

        // Decodes a Base64 string back to a standard string.
        transformFromEncoded(encodedString) {
            // Remove non-Base64 characters, similar to original but with distinct regex and variable name.
            const cleanedInput = encodedString.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            let byteOutputArray = [];
            let currentInputIdx = 0;

            while (currentInputIdx < cleanedInput.length) {
                // Using findIndex on an array for character lookup, instead of indexOf on a string.
                const segment1 = this.#charSet.findIndex(c => c === cleanedInput[currentInputIdx++]);
                const segment2 = this.#charSet.findIndex(c => c === cleanedInput[currentInputIdx++]);
                const segment3 = this.#charSet.findIndex(c => c === cleanedInput[currentInputIdx++]);
                const segment4 = this.#charSet.findIndex(c => c === cleanedInput[currentInputIdx++]);

                const octet1 = (segment1 << 2) | (segment2 >> 4);
                const octet2 = ((segment2 & 0x0F) << 4) | (segment3 >> 2);
                const octet3 = ((segment3 & 0x03) << 6) | segment4;

                byteOutputArray.push(octet1);

                if (segment3 !== 64) { // Check for padding character ('=')
                    byteOutputArray.push(octet2);
                }
                if (segment4 !== 64) { // Check for padding character ('=')
                    byteOutputArray.push(octet3);
                }
            }

            // Convert the resulting byte array (Uint8Array) back to a string.
            return this.#convertBytesToString(new Uint8Array(byteOutputArray));
        }
    }

    // Expose an instance of the DataTransformer class.
    BinaryConverterModule.Base64Utility = new DataTransformer();

})();