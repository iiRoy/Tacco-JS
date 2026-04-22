function processSequentialData(rawContent) {
    const contentBlocks = rawContent.split('\n').filter(line => line.trim().length > 0);
    const numericElements = contentBlocks[1].split(' ').map(Number);
    
    const maxBitPosition = 30; // Assuming numbers fit within a 31-bit signed integer (up to 2^30)
    // This array tracks the most recent index where each bit was found to be '1'.
    // Initialized to -1, indicating no bit has been set in any element yet.
    const bitPositionLastSeen = new Array(maxBitPosition + 1).fill(-1);

    let currentWindowStart = 0; // Represents the leftmost valid index for the current right endpoint
    let cumulativeValidSubarrayCount = 0;

    // Iterate through the array, using 'windowEnd' as the rightmost element of potential subarrays.
    for (let windowEnd = 0; windowEnd < numericElements.length; windowEnd++) {
        const currentNumericalValue = numericElements[windowEnd];

        // Examine each bit of the 'currentNumericalValue'.
        // If a bit is set, check its last observed position.
        for (let bitIndex = 0; bitIndex <= maxBitPosition; bitIndex++) {
            // Check if the current bit is active in 'currentNumericalValue'
            if ((currentNumericalValue >> bitIndex) & 1) {
                // If this bit was previously seen at an index that is within
                // or to the right of 'currentWindowStart', it creates a conflict.
                // To resolve the conflict, 'currentWindowStart' must shift
                // beyond the last position where this bit was observed.
                currentWindowStart = Math.max(currentWindowStart, bitPositionLastSeen[bitIndex] + 1);
            }
        }

        // After determining the 'currentWindowStart' for the 'windowEnd',
        // all subarrays starting from 'currentWindowStart' up to 'windowEnd'
        // are valid (pairwise bit-disjoint).
        // The number of such valid subarrays is (windowEnd - currentWindowStart + 1).
        cumulativeValidSubarrayCount += (windowEnd - currentWindowStart + 1);

        // Update the 'bitPositionLastSeen' for all active bits in 'currentNumericalValue'
        // to reflect its current 'windowEnd' position.
        for (let bitIndex = 0; bitIndex <= maxBitPosition; bitIndex++) {
            if ((currentNumericalValue >> bitIndex) & 1) {
                bitPositionLastSeen[bitIndex] = windowEnd;
            }
        }
    }

    console.log(cumulativeValidSubarrayCount);
}

processSequentialData(require("fs").readFileSync("/dev/stdin", "utf8"));