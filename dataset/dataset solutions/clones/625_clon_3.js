const fileSystemModule = require('fs');

// Read raw input content from standard input, ensuring UTF-8 encoding.
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Split the input content into individual lines.
const inputDataLines = rawInputContent.split('\n');

// --- Input Validation and Setup ---

// Ensure there's at least one line for the element count.
if (inputDataLines.length < 1) {
    process.stderr.write("Error: No input lines provided. Exiting.\n");
    process.exit(1);
}

// Parse the first line as the count of original elements.
const elementCount = Number(inputDataLines[0]);

// Validate the element count.
if (isNaN(elementCount) || elementCount <= 0) {
    process.stderr.write("Error: Invalid or non-positive element count detected. Exiting.\n");
    process.exit(1);
}

// Ensure enough data lines exist for the specified element count.
if (inputDataLines.length < elementCount + 1) {
    process.stderr.write(`Error: Not enough data lines provided for ${elementCount} elements. Exiting.\n`);
    process.exit(1);
}

// Initialize an array to store numbers, tripled in size for circular processing.
// The original code implicitly creates an array of size 3*n by assigning indices.
let extendedNumbers = new Array(elementCount * 3);

// Populate the extendedNumbers array by replicating the original 'n' elements three times.
for (let baseNumberIndex = 0; baseNumberIndex < elementCount; baseNumberIndex++) {
    const numericValue = Number(inputDataLines[baseNumberIndex + 1]);

    // Optional: Add a warning or error for non-numeric values if stricter validation is needed.
    if (isNaN(numericValue)) {
        process.stderr.write(`Warning: Non-numeric value found at input line ${baseNumberIndex + 2}. Treating as 0.\n`);
        extendedNumbers[baseNumberIndex] = 0;
    } else {
        extendedNumbers[baseNumberIndex] = numericValue;
    }

    // Replicate the value to create the circular effect.
    extendedNumbers[baseNumberIndex + elementCount] = extendedNumbers[baseNumberIndex];
    extendedNumbers[baseNumberIndex + (2 * elementCount)] = extendedNumbers[baseNumberIndex];
}

/**
 * Calculates the sum of elements within a specified range of an array.
 * @param {number[]} sourceArray The array from which to sum elements.
 * @param {number} startPosition The inclusive starting index of the segment.
 * @param {number} endPosition The exclusive ending index of the segment.
 * @returns {number} The total sum of elements in the specified segment. Returns 0 for invalid ranges.
 */
const calculateSegmentSum = (sourceArray, startPosition, endPosition) => {
    let segmentTotal = 0;
    // Guard clause for invalid or empty ranges.
    if (startPosition < 0 || endPosition > sourceArray.length || startPosition >= endPosition) {
        return 0; // An empty or invalid segment sums to zero.
    }
    for (let currentIdx = startPosition; currentIdx < endPosition; currentIdx++) {
        segmentTotal += sourceArray[currentIdx];
    }
    return segmentTotal;
};

// --- Main Processing Logic ---

let overallMaximumValue = 0; // Stores the highest 'firstSegmentSum' that meets the condition.

// The outer loop controls the length of the first segment.
// It corresponds to `i` in the original code, ranging from 1 to n-3.
const maxOuterLoopLimit = elementCount - 2;
for (let firstSegmentLength = 1; firstSegmentLength < maxOuterLoopLimit; firstSegmentLength++) {

    // The middle loop controls the starting point of the first segment within the 'original' n elements.
    // It corresponds to `j` in the original code, ranging from 0 to n-1.
    for (let segmentWindowStart = 0; segmentWindowStart < elementCount; segmentWindowStart++) {

        // Calculate the sum of the first segment.
        const currentFirstSegmentSum = calculateSegmentSum(
            extendedNumbers,
            segmentWindowStart,
            segmentWindowStart + firstSegmentLength
        );

        // Determine the conceptual 'remaining' segment that needs to be split into two.
        // This segment starts immediately after the first segment and extends for 'elementCount - firstSegmentLength' elements.
        const remainingSegmentStartAbsIdx = segmentWindowStart + firstSegmentLength;
        const remainingSegmentEndAbsIdx = segmentWindowStart + elementCount; // End of the 'n' elements window.

        const lengthOfRemainingSegment = elementCount - firstSegmentLength;

        // If the remaining segment cannot be split into two non-empty parts, skip this iteration.
        if (lengthOfRemainingSegment <= 1) {
            continue;
        }

        // The inner loop iterates through possible split points for the 'remaining' segment.
        // It corresponds to `k` in the original code, ranging from 1 to `arr.length - 1`.
        // `arr.length` was `n - i`, so `k` goes from `1` to `(n - i) - 1`.
        for (let splitPointRelativeOffset = 1; splitPointRelativeOffset < lengthOfRemainingSegment; splitPointRelativeOffset++) {

            // Calculate absolute indices for the two sub-segments.
            const firstSubSegmentAbsStart = remainingSegmentStartAbsIdx;
            const firstSubSegmentAbsEnd = remainingSegmentStartAbsIdx + splitPointRelativeOffset;
            const secondSubSegmentAbsStart = remainingSegmentStartAbsIdx + splitPointRelativeOffset;
            const secondSubSegmentAbsEnd = remainingSegmentEndAbsIdx;

            // Calculate sums of the two sub-segments.
            const sumOfFirstSubSegment = calculateSegmentSum(extendedNumbers, firstSubSegmentAbsStart, firstSubSegmentAbsEnd);
            const sumOfSecondSubSegment = calculateSegmentSum(extendedNumbers, secondSubSegmentAbsStart, secondSubSegmentAbsEnd);

            // Find the minimum sum between the two sub-segments.
            const minimumSplitSum = Math.min(sumOfFirstSubSegment, sumOfSecondSubSegment);

            // Conditional update for the overall maximum value.
            // Original code had `if(arr <= min)`, which was a bug (array vs number comparison).
            // This has been updated to compare the `currentFirstSegmentSum` with `minimumSplitSum`,
            // which is a more logical interpretation of the problem.
            if (currentFirstSegmentSum <= minimumSplitSum) {
                overallMaximumValue = Math.max(overallMaximumValue, currentFirstSegmentSum);
            }
        }
    }
}

// Output the final calculated maximum value.
process.stdout.write(`Computed maximum value: ${overallMaximumValue}\n`);