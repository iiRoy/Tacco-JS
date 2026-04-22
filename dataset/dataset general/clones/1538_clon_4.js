const BinaryCoder = (() => {

    const BITS_IN_BYTE = 8;
    const MATCH_LENGTH_BITS_COUNT = 6;
    const MIN_MATCH_VALUE = 3;
    const MAX_MATCH_VALUE = ((1 << MATCH_LENGTH_BITS_COUNT) + (MIN_MATCH_VALUE - 1));
    const OFFSET_BIT_MASK = ((1 << (16 - MATCH_LENGTH_BITS_COUNT)) - 1);
    const HASH_TABLE_CAPACITY = 256; // Original LEMPEL_SIZE

    const convertTextToBytes = (inputString) => {
        return Array.from(new TextEncoder().encode(inputString));
    };

    const convertBytesToText = (byteArray) => {
        return new TextDecoder().decode(new Uint8Array(byteArray));
    };

    const encodeBytesToBase64 = (inputSource, urlSafeVariant) => {
        let byteSequence;
        if (inputSource.constructor === Array) {
            byteSequence = String.fromCharCode(...inputSource);
        } else {
            byteSequence = String.fromCharCode(...convertTextToBytes(inputSource));
        }

        let coded = btoa(byteSequence);

        if (urlSafeVariant) {
            coded = coded.replace(/\+/g, '-').replace(/\//g, '_');
            // Remove padding if present for URL safety
            while (coded.endsWith('=')) {
                coded = coded.slice(0, -1);
            }
        }
        return coded;
    };

    const decodeBase64ToBytes = (encodedData, urlSafeVariant) => {
        let processedData = encodedData;

        if (urlSafeVariant) {
            processedData = processedData.replace(/-/g, '+').replace(/_/g, '/');
            // Add padding back if necessary for atob
            while (processedData.length % 4 !== 0) {
                processedData += '=';
            }
        }

        const decodedString = atob(processedData);
        const resultBytes = Array.from(decodedString, char => char.charCodeAt(0));

        // Check if original input was an array (bytes) or string, and return accordingly
        // This is a heuristic based on the original's behavior. If input was an array, return array.
        // If input was a string, original returns a string.
        if (encodedData.constructor === Array) { // Assuming an array input would imply byte output
             return resultBytes;
        } else { // Assuming string input implies string output
             return decodedString; // atob already returns a string where char codes are bytes.
        }
    };

    const performCompression = (inputData) => {
        const sourceBytes = inputData.constructor === Array ? inputData : convertTextToBytes(inputData);
        const sourceLength = sourceBytes.length;
        const outputBytes = [];

        let currentSourceIndex = 0;
        let currentOutputIndex = 0;
        let currentControlByte;
        let controlBitPosition = 1 << (BITS_IN_BYTE - 1);

        const lookupTable = new Map(); // Replaces Lempel array

        const writeControlByte = () => {
            if (currentOutputIndex + (BITS_IN_BYTE * 2) >= sourceLength) {
                return false; // Indicating potential expansion, original logic returns source data
            }
            controlBitPosition = 1;
            currentControlByte = 0;
            outputBytes[currentOutputIndex++] = 0; // Placeholder for control byte
            return true;
        };

        if (!writeControlByte()) { // Initial control byte setup
            return sourceBytes;
        }

        while (currentSourceIndex < sourceLength) {
            if ((controlBitPosition <<= 1) === (1 << BITS_IN_BYTE)) {
                if (!writeControlByte()) { // If output is getting too large, return original
                    return sourceBytes;
                }
            }

            if (currentSourceIndex > sourceLength - MAX_MATCH_VALUE) {
                outputBytes[currentOutputIndex++] = sourceBytes[currentSourceIndex++];
                continue;
            }

            const hashKey = `${sourceBytes[currentSourceIndex]}_${sourceBytes[currentSourceIndex + 1]}_${sourceBytes[currentSourceIndex + 2]}`;
            const previousOccurrenceIndex = lookupTable.get(hashKey);
            lookupTable.set(hashKey, currentSourceIndex); // Update for current position

            let matchedLength = 0;
            let relativeOffset = 0;

            if (previousOccurrenceIndex !== undefined) {
                const candidateSourceIndex = currentSourceIndex - previousOccurrenceIndex;
                if (candidateSourceIndex > 0 && (candidateSourceIndex & OFFSET_BIT_MASK) === candidateSourceIndex) {
                    // Verify match
                    let potentialMatchLen = MIN_MATCH_VALUE;
                    while (potentialMatchLen < MAX_MATCH_VALUE &&
                           currentSourceIndex + potentialMatchLen < sourceLength &&
                           sourceBytes[currentSourceIndex + potentialMatchLen] === sourceBytes[previousOccurrenceIndex + potentialMatchLen]) {
                        potentialMatchLen++;
                    }

                    if (potentialMatchLen >= MIN_MATCH_VALUE) {
                        matchedLength = potentialMatchLen;
                        relativeOffset = candidateSourceIndex;
                    }
                }
            }

            if (matchedLength > 0) {
                outputBytes[currentOutputIndex - 1] |= controlBitPosition; // Mark as match
                outputBytes[currentOutputIndex++] = ((matchedLength - MIN_MATCH_VALUE) << (BITS_IN_BYTE - MATCH_LENGTH_BITS_COUNT)) | (relativeOffset >> BITS_IN_BYTE);
                outputBytes[currentOutputIndex++] = relativeOffset;
                currentSourceIndex += matchedLength;
            } else {
                outputBytes[currentOutputIndex++] = sourceBytes[currentSourceIndex++];
            }
        }

        return outputBytes;
    };

    const performDecompression = (compressedData) => {
        const sourceBytes = compressedData.constructor === Array ? compressedData : convertTextToBytes(compressedData);
        const sourceLength = sourceBytes.length;
        const resultBytes = [];

        let currentSourceIndex = 0;
        let activeControlByte;
        let controlBitPosition = 1 << (BITS_IN_BYTE - 1);

        while (currentSourceIndex < sourceLength) {
            if ((controlBitPosition <<= 1) === (1 << BITS_IN_BYTE)) {
                controlBitPosition = 1;
                activeControlByte = sourceBytes[currentSourceIndex++];
            }

            if (activeControlByte & controlBitPosition) { // Match found
                const matchLenEncoded = sourceBytes[currentSourceIndex++];
                const offsetEncoded = sourceBytes[currentSourceIndex++];

                const actualMatchLength = (matchLenEncoded >> (BITS_IN_BYTE - MATCH_LENGTH_BITS_COUNT)) + MIN_MATCH_VALUE;
                const actualOffset = ((matchLenEncoded << BITS_IN_BYTE) | offsetEncoded) & OFFSET_BIT_MASK;

                const copyStartIndex = resultBytes.length - actualOffset;

                if (copyStartIndex < 0) {
                    throw new Error("Corrupt data: offset out of bounds.");
                }

                for (let k = 0; k < actualMatchLength; k++) {
                    resultBytes.push(resultBytes[copyStartIndex + k]);
                }
            } else { // Literal byte
                resultBytes.push(sourceBytes[currentSourceIndex++]);
            }
        }

        // The original returns a string for decompression
        return convertBytesToText(resultBytes);
    };

    // Public API
    return {
        convertTextToBytes,
        convertBytesToText,
        Base64Encoder: {
            encode: encodeBytesToBase64,
            decode: decodeBase64ToBytes,
        },
        BinaryCompressor: {
            compress: performCompression,
            decompress: performDecompression,
        }
    };
})();

// Recreate the original LZJB structure for compatibility, but using the new implementation
const LZJB = {};
if (typeof LZJB === 'undefined')
    LZJB = {
        version: '3026', // Hardcode version as the original extracts it from a string
    };

LZJB.toByteArray = BinaryCoder.convertTextToBytes;

LZJB.Base64 = {
    CA: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", // Kept for compatibility if external code accesses
    CAS: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_", // Kept for compatibility
    IA: new Array(256), // Kept for compatibility
    IAS: new Array(256), // Kept for compatibility
    init: () => {
        // No-op, as actual base64 uses browser APIs which don't need these tables
        // but keeping the function to avoid breaking external calls to init()
    },
    encode: BinaryCoder.Base64Encoder.encode,
    decode: BinaryCoder.Base64Encoder.decode
};
LZJB.Base64.init(); // Call to maintain original execution flow

LZJB.compress = BinaryCoder.BinaryCompressor.compress;
LZJB.decompress = BinaryCoder.BinaryCompressor.decompress;