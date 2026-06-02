"use strict";
function ProcessInput(rawData) {
    let dataParser = new DataStreamReader(rawData);
    let arraySize = dataParser.readInt(), inputArray = dataParser.readIntArray(arraySize);

    const BIT_COUNT = 20;
    let bitPrefixSums = Array.from({ length: arraySize + 1 }, () => new Array(BIT_COUNT).fill(0));

    for (let currentIdx = 1; currentIdx <= arraySize; currentIdx++) {
        const previousRowPrefixes = bitPrefixSums[currentIdx - 1];
        const currentArrayElement = inputArray[currentIdx - 1];

        for (let bitPosition = 0; bitPosition < BIT_COUNT; bitPosition++) {
            // Calculate the bit mask for the current bit position (from MSB to LSB)
            const currentBitMask = 1 << (BIT_COUNT - 1 - bitPosition);
            // Determine if the bit is set in the current array element
            const bitIsSet = (currentArrayElement & currentBitMask) ? 1 : 0;
            // Accumulate prefix sum for this bit position
            bitPrefixSums[currentIdx][bitPosition] = previousRowPrefixes[bitPosition] + bitIsSet;
        }
    }

    let validSubarrayCount = 0;

    // Helper function to determine if a subarray (defined by start and end indices)
    // has at most one '1' for each bit position.
    const checkSubarrayBitCounts = (startIdx, endIdx, prefixSumsMatrix, totalBits) => {
        const startPrefixes = prefixSumsMatrix[startIdx - 1];
        const endPrefixes = prefixSumsMatrix[endIdx];

        for (let b = 0; b < totalBits; b++) {
            // Calculate the number of '1's for the current bit within the subarray range
            const onesInSubarray = endPrefixes[b] - startPrefixes[b];
            if (onesInSubarray > 1) {
                return false; // Condition violated: more than one '1' for this bit
            }
        }
        return true; // All bit positions satisfy the condition
    };

    for (let startSubarrayIdx = 1; startSubarrayIdx <= arraySize; startSubarrayIdx++) {
        let isCurrentSubarrayValid = true;
        for (let endSubarrayIdx = startSubarrayIdx; endSubarrayIdx <= arraySize && isCurrentSubarrayValid; endSubarrayIdx++) {
            // Use the helper function to check the validity of the current subarray
            isCurrentSubarrayValid = checkSubarrayBitCounts(startSubarrayIdx, endSubarrayIdx, bitPrefixSums, BIT_COUNT);

            if (isCurrentSubarrayValid) {
                validSubarrayCount++;
            } else {
                // If the subarray from startSubarrayIdx to endSubarrayIdx is invalid,
                // any longer subarray starting at startSubarrayIdx will also be invalid.
                // So, we can stop extending this subarray.
                break;
            }
        }
    }
    console.log(validSubarrayCount);
}

class DataStreamReader {
    constructor(sourceText) {
        if (typeof sourceText === 'undefined') {
            throw new Error('Input source text cannot be omitted!');
        }
        this.readIndex = 0;
        // Preserve original split behavior: `split(/\n|\s/)` can produce empty strings
        // if multiple delimiters are adjacent (e.g., "1  2" or "1\n\n2").
        // These empty strings are then converted to 0 by `+""`.
        this.tokenList = sourceText.split(/\n|\s/);
    }

    readInt() {
        // Unary plus operator `+` converts string to number. `+""` results in 0.
        return +this.tokenList[this.readIndex++];
    }

    readIntArray(count) {
        if (typeof count === 'undefined' || count < 1) {
            throw new Error('Array count (must be 1 or more) cannot be omitted!');
        }
        let resultArr = new Array(count);
        for (let loopCounter = 0; loopCounter < count; loopCounter++) {
            resultArr[loopCounter] = this.readInt();
        }
        return resultArr;
    }

    readString() {
        return this.tokenList[this.readIndex++];
    }

    readStringArray(count) {
        if (typeof count === 'undefined' || count < 1) {
            throw new Error('Array count (must be 1 or more) cannot be omitted!');
        }
        let resultArr = new Array(count);
        for (let loopCounter = 0; loopCounter < count; loopCounter++) {
            resultArr[loopCounter] = this.readString();
        }
        return resultArr;
    }
}

if (typeof window === "undefined") {
    ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}
