const GlobalUtil = {

    DataTransform: {

        // Internal character set for Base64 encoding and decoding operations
        _base64Chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

        // Transforms a plain text string into its Base64 representation.
        encodeToBase64: function (sourceString) {
            let base64OutputParts = []; // Accumulates the Base64 segments
            let charValue1, charValue2, charValue3; // Three 8-bit character values from UTF-8
            let chunk1, chunk2, chunk3, chunk4; // Four 6-bit Base64 index values
            let currentReadPos = 0; // Iterator for the input string

            // Handle empty or invalid input early
            if (sourceString === null || sourceString === undefined || sourceString.length === 0) {
                return "";
            }

            // Convert the input to UTF-8 byte sequence first
            const utf8Buffer = this._stringToUtf8Bytes(sourceString);
            const bufferLength = utf8Buffer.length;

            while (currentReadPos < bufferLength) {
                // Read up to three characters from the UTF-8 buffer
                charValue1 = utf8Buffer.charCodeAt(currentReadPos++);
                charValue2 = (currentReadPos < bufferLength) ? utf8Buffer.charCodeAt(currentReadPos++) : NaN;
                charValue3 = (currentReadPos < bufferLength) ? utf8Buffer.charCodeAt(currentReadPos++) : NaN;

                // Break the three 8-bit values into four 6-bit values
                chunk1 = charValue1 >> 2;
                chunk2 = ((charValue1 & 0x03) << 4) | (charValue2 >> 4);
                chunk3 = ((charValue2 & 0x0F) << 2) | (charValue3 >> 6);
                chunk4 = charValue3 & 0x3F;

                // Apply padding characters if the last group is incomplete
                if (Number.isNaN(charValue2)) {
                    chunk3 = chunk4 = 64; // Two padding characters
                } else if (Number.isNaN(charValue3)) {
                    chunk4 = 64; // One padding character
                }

                // Append the corresponding Base64 characters
                base64OutputParts.push(
                    this._base64Chars.charAt(chunk1),
                    this._base64Chars.charAt(chunk2),
                    this._base64Chars.charAt(chunk3),
                    this._base64Chars.charAt(chunk4)
                );
            }

            // Concatenate all parts to form the final Base64 string
            return base64OutputParts.join('');
        },

        // Converts a Base64 encoded string back to its original plain text form.
        decodeFromBase64: function (base64Input) {
            let decodedUtf8Bytes = []; // Stores the resulting UTF-8 byte characters
            let byteGroup1, byteGroup2, byteGroup3; // Three 8-bit decoded byte values
            let codeVal1, codeVal2, codeVal3, codeVal4; // Four 6-bit Base64 character code points
            let currentScanPos = 0; // Pointer for traversing the Base64 input

            // Clean the input string by removing any non-Base64 characters
            const sanitizedInput = base64Input ? base64Input.replace(/[^A-Za-z0-9\+\/\=]/g, "") : "";

            // Return an empty string if input is empty after sanitization
            if (!sanitizedInput) {
                return "";
            }

            const sanitizedLength = sanitizedInput.length;

            while (currentScanPos < sanitizedLength) {
                // Retrieve the 6-bit index for each of the four Base64 characters
                codeVal1 = this._base64Chars.indexOf(sanitizedInput.charAt(currentScanPos++));
                codeVal2 = this._base64Chars.indexOf(sanitizedInput.charAt(currentScanPos++));
                codeVal3 = this._base64Chars.indexOf(sanitizedInput.charAt(currentScanPos++));
                codeVal4 = this._base64Chars.indexOf(sanitizedInput.charAt(currentScanPos++));

                // Reconstruct the three 8-bit bytes from the four 6-bit values
                byteGroup1 = (codeVal1 << 2) | (codeVal2 >> 4);
                byteGroup2 = ((codeVal2 & 0x0F) << 4) | (codeVal3 >> 2);
                byteGroup3 = ((codeVal3 & 0x03) << 6) | codeVal4;

                // Add the first decoded byte
                decodedUtf8Bytes.push(String.fromCharCode(byteGroup1));

                // Add the second decoded byte, if not a padding character
                if (codeVal3 !== 64) {
                    decodedUtf8Bytes.push(String.fromCharCode(byteGroup2));
                }
                // Add the third decoded byte, if not a padding character
                if (codeVal4 !== 64) {
                    decodedUtf8Bytes.push(String.fromCharCode(byteGroup3));
                }
            }

            // Convert the resulting UTF-8 sequence back to a regular JavaScript string
            return this._utf8BytesToString(decodedUtf8Bytes.join(''));
        },

        // Converts a regular JavaScript string into its UTF-8 byte sequence representation.
        _stringToUtf8Bytes: function (plainText) {
            let utf8Segments = []; // Buffer to build the UTF-8 string
            let characterCode; // The Unicode code point of the current character

            // Standardize line endings: CRLF to LF
            let processedText = plainText.replace(/\r\n/g, "\n");
            const textLength = processedText.length;

            // Short-circuit for empty string
            if (textLength === 0) {
                return "";
            }

            for (let charIterator = 0; charIterator < textLength; charIterator++) {
                characterCode = processedText.charCodeAt(charIterator);

                if (characterCode < 128) { // 1-byte sequence (0xxxxxxx) - ASCII range
                    utf8Segments.push(String.fromCharCode(characterCode));
                } else if (characterCode > 127 && characterCode < 2048) { // 2-byte sequence (110xxxxx 10xxxxxx)
                    utf8Segments.push(String.fromCharCode((characterCode >> 6) | 192));
                    utf8Segments.push(String.fromCharCode((characterCode & 63) | 128));
                } else { // 3-byte sequence (1110xxxx 10xxxxxx 10xxxxxx)
                    utf8Segments.push(String.fromCharCode((characterCode >> 12) | 224));
                    utf8Segments.push(String.fromCharCode(((characterCode >> 6) & 63) | 128));
                    utf8Segments.push(String.fromCharCode((characterCode & 63) | 128));
                }
            }

            return utf8Segments.join('');
        },

        // Decodes a UTF-8 byte sequence string back into a standard JavaScript string.
        _utf8BytesToString: function (utf8EncodedText) {
            let resultCharacterArray = []; // Array to store the decoded characters
            let bytePosition = 0; // Current index in the UTF-8 byte string
            let firstByte, secondByte, thirdByte; // Bytes making up a UTF-8 character

            // Handle empty input
            if (!utf8EncodedText) {
                return "";
            }

            const encodedBufferLength = utf8EncodedText.length;

            while (bytePosition < encodedBufferLength) {
                firstByte = utf8EncodedText.charCodeAt(bytePosition);

                if (firstByte < 128) { // Single-byte character (ASCII)
                    resultCharacterArray.push(String.fromCharCode(firstByte));
                    bytePosition++;
                } else if (firstByte > 191 && firstByte < 224) { // Two-byte character sequence
                    // Check for insufficient bytes for a valid sequence
                    if (bytePosition + 1 >= encodedBufferLength) {
                        resultCharacterArray.push(String.fromCharCode(0xFFFD)); // Unicode Replacement Character
                        bytePosition++;
                        continue;
                    }
                    secondByte = utf8EncodedText.charCodeAt(bytePosition + 1);
                    resultCharacterArray.push(String.fromCharCode(((firstByte & 31) << 6) | (secondByte & 63)));
                    bytePosition += 2;
                } else { // Three-byte character sequence
                    // Check for insufficient bytes for a valid sequence
                    if (bytePosition + 2 >= encodedBufferLength) {
                        resultCharacterArray.push(String.fromCharCode(0xFFFD)); // Unicode Replacement Character
                        bytePosition++; // Advance by at least one to prevent infinite loop
                        continue;
                    }
                    secondByte = utf8EncodedText.charCodeAt(bytePosition + 1);
                    thirdByte = utf8EncodedText.charCodeAt(bytePosition + 2);
                    resultCharacterArray.push(String.fromCharCode(((firstByte & 15) << 12) | ((secondByte & 63) << 6) | (thirdByte & 63)));
                    bytePosition += 3;
                }
            }

            return resultCharacterArray.join('');
        }
    }
};