var DataEncodingUtility = {
 
    // This private string holds the character set used for Base64 encoding.
    // It maps 6-bit values to their corresponding ASCII characters.
    _charMappingTable: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
 
    /**
     * Converts a raw input string into its Base64 representation.
     * This method processes the input in blocks of three 8-bit bytes,
     * converting them into four 6-bit Base64 characters.
     *
     * @param {string} sourcePayload - The original string data to be encoded.
     * @returns {string} The Base64 encoded string.
     */
    processToB64: function (sourcePayload) {
        // Ensure the input is a valid string before proceeding.
        if (typeof sourcePayload !== 'string') {
            console.error("Input for encoding must be a string.");
            return ""; // Return an empty string or throw an error based on desired behavior.
        }
 
        let encodedOutputSegments = []; // Using an array for potentially better performance with many concatenations
        let currentPosition = 0;
        const totalLength = sourcePayload.length;
 
        let byteGroupA, byteGroupB, byteGroupC; // Represents three 8-bit bytes from input
        let blockIndex1, blockIndex2, blockIndex3, blockIndex4; // Represents four 6-bit Base64 indices
 
        // Loop through the input string, processing three characters at a time.
        while (currentPosition < totalLength) {
            byteGroupA = sourcePayload.charCodeAt(currentPosition++);
            byteGroupB = sourcePayload.charCodeAt(currentPosition++);
            byteGroupC = sourcePayload.charCodeAt(currentPosition++);
 
            // Calculate the first 6-bit block index.
            blockIndex1 = byteGroupA >>> 2;
 
            // Calculate the second 6-bit block index.
            // Combines the remaining bits of byteGroupA with the first 4 bits of byteGroupB.
            blockIndex2 = ((byteGroupA & 0x03) << 4) | (byteGroupB >>> 4);
 
            // Calculate the third 6-bit block index.
            // Combines the remaining bits of byteGroupB with the first 2 bits of byteGroupC.
            blockIndex3 = ((byteGroupB & 0x0F) << 2) | (byteGroupC >>> 6);
 
            // Calculate the fourth 6-bit block index (remaining bits of byteGroupC).
            blockIndex4 = byteGroupC & 0x3F;
 
            // Handle padding characters if the last block is incomplete.
            // If byteGroupB was not a valid character (end of string), pad with '='.
            if (currentPosition > totalLength + 1 || isNaN(byteGroupB)) { // Check if byteGroupB is beyond actual length or NaN
                blockIndex3 = blockIndex4 = 64; // Assign index for '=' character
            }
            // If byteGroupC was not a valid character (end of string), pad with '='.
            else if (currentPosition > totalLength || isNaN(byteGroupC)) { // Check if byteGroupC is beyond actual length or NaN
                blockIndex4 = 64; // Assign index for '=' character
            }
 
            // Append the four Base64 characters to the result.
            encodedOutputSegments.push(
                this._charMappingTable.charAt(blockIndex1),
                this._charMappingTable.charAt(blockIndex2),
                this._charMappingTable.charAt(blockIndex3),
                this._charMappingTable.charAt(blockIndex4)
            );
        }
 
        return encodedOutputSegments.join('');
    },
 
    /**
     * Decodes a Base64 encoded string back into its original raw string format.
     * This method reverses the encoding process, converting four 6-bit Base64 characters
     * back into three 8-bit bytes.
     *
     * @param {string} encodedText - The Base64 encoded string to be decoded.
     * @returns {string} The original decoded string data.
     */
    processFromB64: function (encodedText) {
        // Initial input validation: ensure it's a string.
        if (typeof encodedText !== 'string') {
            console.error("Input for decoding must be a string.");
            return "";
        }
 
        let currentCursor = 0;
        let reconstructedCharCodes = [];
 
        // Sanitize the input string: remove any characters that are not part of the Base64 alphabet.
        // This ensures robustness against malformed inputs.
        const cleanedEncodedInput = encodedText.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        const inputLength = cleanedEncodedInput.length;
 
        // Base64 encoded strings must have a length that is a multiple of 4.
        // If not, it's malformed, and we might want to handle it (e.g., truncate or throw).
        // For this implementation, we'll just process what's available.
        if (inputLength % 4 !== 0) {
            console.warn("Base64 input length is not a multiple of 4. This may indicate a truncated or malformed string.");
            // Optionally, one could throw an error here: throw new Error("Invalid Base64 string length.");
        }
 
        let value1, value2, value3, value4; // Indices from the _charMappingTable for four Base64 characters
        let actualByte1, actualByte2, actualByte3; // The three reconstructed 8-bit bytes
 
        // Iterate through the cleaned input string, taking four Base64 characters at a time.
        while (currentCursor < inputLength) {
            // Retrieve the 6-bit values (indices) from the character mapping table.
            value1 = this._charMappingTable.indexOf(cleanedEncodedInput.charAt(currentCursor++));
            value2 = this._charMappingTable.indexOf(cleanedEncodedInput.charAt(currentCursor++));
            value3 = this._charMappingTable.indexOf(cleanedEncodedInput.charAt(currentCursor++));
            value4 = this._charMappingTable.indexOf(cleanedEncodedInput.charAt(currentCursor++));
 
            // Reconstruct the first 8-bit byte.
            actualByte1 = (value1 << 2) | (value2 >>> 4);
 
            // Reconstruct the second 8-bit byte.
            // Combines remaining bits of value2 with first 4 bits of value3.
            actualByte2 = ((value2 & 0x0F) << 4) | (value3 >>> 2);
 
            // Reconstruct the third 8-bit byte.
            // Combines remaining bits of value3 with value4.
            actualByte3 = ((value3 & 0x03) << 6) | value4;
 
            // Append the first reconstructed byte's character representation.
            reconstructedCharCodes.push(String.fromCharCode(actualByte1));
 
            // Check for padding. If value3 is not 64 (which represents '='),
            // then the second byte is valid and should be appended.
            if (value3 !== 64) {
                reconstructedCharCodes.push(String.fromCharCode(actualByte2));
            }
 
            // Check for padding. If value4 is not 64,
            // then the third byte is valid and should be appended.
            if (value4 !== 64) {
                reconstructedCharCodes.push(String.fromCharCode(actualByte3));
            }
        }
 
        return reconstructedCharCodes.join('');
    }
};