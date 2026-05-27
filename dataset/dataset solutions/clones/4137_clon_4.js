function Main(input) {
    const inputLines = input.split("\n");
    const [initialValueString, limitValueString] = inputLines[0].split(" ");

    let finalCount = 0;

    // The original code uses 14 digits as a threshold for standard Number type.
    // We will replicate this threshold.
    if (initialValueString.length <= 14 && limitValueString.length <= 14) {
        let currentNumeric = Number(initialValueString);
        const limitNumeric = Number(limitValueString);

        // Replicate the original's infinite loop behavior if currentNumeric is 0 and limitNumeric >= 0.
        // In such a scenario, currentNumeric * 2 remains 0, and the loop condition (0 <= limitNumeric)
        // would always be true, leading to an infinite loop.
        if (currentNumeric === 0 && limitNumeric >= 0) {
            while (true) { /* This replicates the original's infinite loop behavior */ }
        }

        // Use a for-loop with an explicit break, which is a different control flow structure
        // compared to the original's while loop.
        for (;;) {
            if (currentNumeric > limitNumeric) {
                break;
            }
            currentNumeric *= 2;
            finalCount++;
        }
    } else {
        // For large numbers, implement custom arbitrary-precision arithmetic using an array of chunks.
        // We'll use a base of 10^9 (1 billion) for each chunk, which is different from the original's
        // implicit base of 10^10 (split into top and last 10 digits).
        const CHUNK_BASE = 1_000_000_000; // 10^9
        const CHUNK_DIGIT_COUNT = 9;

        // Converts a large number string into an array of numeric chunks (base 10^9).
        // Example: "1234567890123456789" -> [1, 234567890, 123456789]
        const parseToChunks = (numStr) => {
            const parts = [];
            // Pad the string to ensure its length is a multiple of CHUNK_DIGIT_COUNT
            const totalPaddedLength = Math.ceil(numStr.length / CHUNK_DIGIT_COUNT) * CHUNK_DIGIT_COUNT;
            const paddedNumStr = numStr.padStart(totalPaddedLength, '0');

            for (let i = 0; i < totalPaddedLength; i += CHUNK_DIGIT_COUNT) {
                parts.push(Number(paddedNumStr.substring(i, i + CHUNK_DIGIT_COUNT)));
            }
            return parts;
        };

        // Normalizes a chunk array by removing leading zero chunks, unless it's just [0].
        const normalizeChunks = (chunkArray) => {
            let firstNonZero = 0;
            while (firstNonZero < chunkArray.length - 1 && chunkArray[firstNonZero] === 0) {
                firstNonZero++;
            }
            return chunkArray.slice(firstNonZero);
        };

        // Compares two large numbers represented as chunk arrays.
        // Returns -1 if arrA < arrB, 0 if arrA == arrB, 1 if arrA > arrB.
        const compareChunkArrays = (arrA, arrB) => {
            const normalizedA = normalizeChunks(arrA);
            const normalizedB = normalizeChunks(arrB);

            if (normalizedA.length < normalizedB.length) return -1;
            if (normalizedA.length > normalizedB.length) return 1;

            for (let i = 0; i < normalizedA.length; i++) {
                if (normalizedA[i] < normalizedB[i]) return -1;
                if (normalizedA[i] > normalizedB[i]) return 1;
            }
            return 0; // Equal
        };

        // Doubles a large number represented as a chunk array.
        const doubleChunkArray = (arr) => {
            let carryOver = 0;
            const newChunkValues = new Array(arr.length);

            // Iterate from the least significant chunk to the most significant
            for (let i = arr.length - 1; i >= 0; i--) {
                const currentChunkValue = arr[i];
                const doubledValue = currentChunkValue * 2 + carryOver;
                newChunkValues[i] = doubledValue % CHUNK_BASE;
                carryOver = Math.floor(doubledValue / CHUNK_BASE);
            }

            if (carryOver > 0) {
                newChunkValues.unshift(carryOver); // Add any remaining carry to the front
            }
            return newChunkValues;
        };

        let currentLargeNumber = parseToChunks(initialValueString);
        const limitLargeNumber = parseToChunks(limitValueString);

        // Replicate the original's infinite loop behavior for large numbers if currentLargeNumber is 0 and limitLargeNumber >= 0.
        // A number represented as [0] (after normalization) means 0.
        if (compareChunkArrays(currentLargeNumber, [0]) === 0 && compareChunkArrays(limitLargeNumber, [0]) >= 0) {
            while (true) { /* This replicates the original's infinite loop behavior */ }
        }

        // Use a do...while loop, which is a different control flow structure
        // compared to the original's while loop.
        // The condition `compareChunkArrays(currentLargeNumber, limitLargeNumber) <= 0`
        // is equivalent to `currentLargeNumber <= limitLargeNumber`.
        if (compareChunkArrays(currentLargeNumber, limitLargeNumber) <= 0) {
            do {
                currentLargeNumber = doubleChunkArray(currentLargeNumber);
                finalCount++;
            } while (compareChunkArrays(currentLargeNumber, limitLargeNumber) <= 0);
        }
    }

    console.log(finalCount);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
