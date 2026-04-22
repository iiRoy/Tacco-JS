class DataEncoderUtility {
    static #encodingMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    static #convertStringToBytes(sourceInput) {
        let byteCollection = [];
        for (let charIndex = 0; charIndex < sourceInput.length; charIndex++) {
            let currentCode = sourceInput.charCodeAt(charIndex);
            if (currentCode < 0x80) { // Single-byte character (0xxxxxxx)
                byteCollection.push(currentCode);
            } else if (currentCode < 0x800) { // Two-byte character (110xxxxx 10xxxxxx)
                byteCollection.push((currentCode >> 6) | 0xC0);
                byteCollection.push((currentCode & 0x3F) | 0x80);
            } else { // Three-byte character (1110xxxx 10xxxxxx 10xxxxxx)
                byteCollection.push((currentCode >> 12) | 0xE0);
                byteCollection.push(((currentCode >> 6) & 0x3F) | 0x80);
                byteCollection.push((currentCode & 0x3F) | 0x80);
            }
        }
        return byteCollection;
    }

    static transformTextToBase64(originalText) {
        const utf8ByteSequence = DataEncoderUtility.#convertStringToBytes(originalText);
        let outputSegments = [];

        // Recursive function to process byte chunks
        function processNextChunk(position) {
            if (position >= utf8ByteSequence.length) {
                return; // All bytes processed, end recursion
            }

            let byteA = utf8ByteSequence[position];
            let byteB = utf8ByteSequence[position + 1];
            let byteC = utf8ByteSequence[position + 2];

            let index0 = byteA >> 2;
            let index1;
            let index2;
            let index3;

            if (byteB === undefined) { // Only one byte (byteA) remaining
                index1 = (byteA & 0x03) << 4;
                index2 = 64; // Padding
                index3 = 64; // Padding
            } else { // At least two bytes (byteA, byteB) remaining
                index1 = ((byteA & 0x03) << 4) | (byteB >> 4);
                if (byteC === undefined) { // Exactly two bytes (byteA, byteB) remaining
                    index2 = ((byteB & 0x0F) << 2);
                    index3 = 64; // Padding
                } else { // Three bytes (byteA, byteB, byteC) remaining
                    index2 = ((byteB & 0x0F) << 2) | (byteC >> 6);
                    index3 = byteC & 0x3F;
                }
            }

            outputSegments.push(
                DataEncoderUtility.#encodingMap[index0],
                DataEncoderUtility.#encodingMap[index1],
                DataEncoderUtility.#encodingMap[index2],
                DataEncoderUtility.#encodingMap[index3]
            );

            processNextChunk(position + 3); // Recurse for the next 3-byte chunk
        }

        processNextChunk(0); // Start the recursive encoding process
        return outputSegments.join('');
    }
}