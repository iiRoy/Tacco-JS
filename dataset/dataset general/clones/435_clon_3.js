/*
 * This module provides functionalities for converting binary data (represented as UTF-8 bytes)
 * into a Base64-encoded string. It is designed to handle standard string inputs and
 * produce a compliant Base64 output.
 *
 * This code is licensed under the Apache License, Version 2.0.
 * You may obtain a copy of the License at:
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var BinaryTextCodec = {
    // Defines the set of 64 characters used in Base64 encoding, plus the padding character.
    base64CharSet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

    /**
     * Transforms a plain text string into its Base64 encoded representation.
     * The process involves converting the input string to UTF-8 byte sequence
     * and then encoding these bytes into Base64 characters.
     *
     * @param {string} sourceText - The input string to be encoded.
     * @returns {string} The resulting Base64 string. Returns an empty string if input is null/empty.
     */
    toBase64: function (sourceText) {
        // --- Type III: Added guard clause for robust input handling ---
        if (!sourceText) {
            return '';
        }

        // First, convert the textual input into a sequence of UTF-8 encoded bytes.
        const utf8OctetArray = BinaryTextCodec.stringToUtf8Bytes(sourceText);
        const octetCount = utf8OctetArray.length;
        
        let encodedCharacterResult = []; // Stores the Base64 characters before final concatenation.
        
        // --- Type III: Introduced a constant for the padding character index for clarity ---
        const PADDING_CHAR_INDEX = 64; // Corresponds to '=' in base64CharSet.

        let currentOctet1, currentOctet2, currentOctet3; // Three octets (bytes) processed per block.
        let outputIndexA, outputIndexB, outputIndexC, outputIndexD; // Four indices into base64CharSet.

        // --- Type III: Changed original 'while' loop to a 'for' loop with explicit increment by 3 ---
        for (let octetCursor = 0; octetCursor < octetCount; octetCursor += 3) {
            currentOctet1 = utf8OctetArray[octetCursor];
            currentOctet2 = utf8OctetArray[octetCursor + 1]; // Might be undefined if not enough bytes.
            currentOctet3 = utf8OctetArray[octetCursor + 2]; // Might be undefined if not enough bytes.

            // Calculate the first two 6-bit chunks for Base64.
            outputIndexA = currentOctet1 >> 2;
            outputIndexB = ((currentOctet1 & 0x03) << 4) | (currentOctet2 >> 4);

            // Handle padding scenarios for the third and fourth 6-bit chunks.
            // --- Type III: Replaced isNaN() with explicit undefined check for clarity ---
            if (typeof currentOctet2 === 'undefined') {
                // Only one byte available (currentOctet1), so two padding characters needed.
                outputIndexC = PADDING_CHAR_INDEX;
                outputIndexD = PADDING_CHAR_INDEX;
            } else {
                outputIndexC = ((currentOctet2 & 0x0F) << 2) | (currentOctet3 >> 6);
                if (typeof currentOctet3 === 'undefined') {
                    // Two bytes available (currentOctet1, currentOctet2), so one padding character needed.
                    outputIndexD = PADDING_CHAR_INDEX;
                } else {
                    // Three bytes available, no padding needed for this block.
                    outputIndexD = currentOctet3 & 0x3F;
                }
            }
            
            // Append the four calculated Base64 characters to the result buffer.
            // --- Type III: Unified string building to always use array push, removing original IE branch difference ---
            encodedCharacterResult.push(
                BinaryTextCodec.base64CharSet[outputIndexA],
                BinaryTextCodec.base64CharSet[outputIndexB],
                BinaryTextCodec.base64CharSet[outputIndexC],
                BinaryTextCodec.base64CharSet[outputIndexD]
            );
        }
        // Join all collected characters to form the final Base64 string.
        return encodedCharacterResult.join('');
    },

    /**
     * Converts a JavaScript string (which is UTF-16 internally) into an array of UTF-8 byte values.
     * This handles ASCII characters directly and converts multi-byte Unicode characters to their
     * corresponding UTF-8 byte sequences.
     *
     * @param {string} inputData - The string to be converted to UTF-8 bytes.
     * @returns {number[]} An array of numerical byte values. Returns an empty array if input is null/empty.
     */
    stringToUtf8Bytes: function (inputData) {
        // --- Type III: Added guard clause for robust input handling ---
        if (!inputData) {
            return [];
        }

        const dataLength = inputData.length;
        const byteOutputBuffer = []; // Accumulates the UTF-8 byte sequence.

        // --- Type III: Introduced constants for common bitmasks and prefixes in UTF-8 encoding ---
        const SIX_BIT_MASK = 0x3F;       // 0011 1111 (for last 6 bits)
        const ASCII_MAX_CODE = 0x7F;     // 0111 1111 (max for 1-byte UTF-8)
        const TWO_BYTE_MAX_CODE = 0x7FF; // 0111 1111 1111 (max for 2-byte UTF-8)

        const UTF8_2BYTE_PREFIX = 0xC0;  // 1100 0000 (start of 2-byte sequence)
        const UTF8_3BYTE_PREFIX = 0xE0;  // 1110 0000 (start of 3-byte sequence)
        const UTF8_CONTINUATION_PREFIX = 0x80; // 1000 0000 (start of continuation byte)

        // --- Type III: Changed initial ASCII regex check to a unified loop with conditional logic ---
        for (let charPointer = 0; charPointer < dataLength; ++charPointer) {
            const unicodeCodePoint = inputData.charCodeAt(charPointer);

            if (unicodeCodePoint < ASCII_MAX_CODE + 1) { // 0-127 (1-byte ASCII / UTF-8)
                byteOutputBuffer.push(unicodeCodePoint);
            } else if (unicodeCodePoint < TWO_BYTE_MAX_CODE + 1) { // 128-2047 (2-byte UTF-8)
                // --- Type III: Used intermediate variables for individual byte calculation ---
                const firstByte = (unicodeCodePoint >> 6) | UTF8_2BYTE_PREFIX;
                const secondByte = (unicodeCodePoint & SIX_BIT_MASK) | UTF8_CONTINUATION_PREFIX;
                byteOutputBuffer.push(firstByte, secondByte);
            } else { // 2048 and above (3-byte UTF-8 for Basic Multilingual Plane)
                // --- Type III: Used intermediate variables for individual byte calculation ---
                const firstByte = (unicodeCodePoint >> 12) | UTF8_3BYTE_PREFIX;
                const secondByte = ((unicodeCodePoint >> 6) & SIX_BIT_MASK) | UTF8_CONTINUATION_PREFIX;
                const thirdByte = (unicodeCodePoint & SIX_BIT_MASK) | UTF8_CONTINUATION_PREFIX;
                byteOutputBuffer.push(firstByte, secondByte, thirdByte);
            }
        }
        return byteOutputBuffer;
    }
};