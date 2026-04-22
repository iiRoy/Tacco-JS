'use strict';

// This auxiliary routine verifies if all numerical entries within a given array are at the zero level.
// It serves as a crucial termination condition for our primary processing algorithm.
function areAllElementsZero(levelSeries) {
    // Defensive check: An empty or non-array input is considered to have all elements at zero
    // (or vacuously true, as there are no non-zero elements).
    if (!Array.isArray(levelSeries) || levelSeries.length === 0) {
        return true;
    }

    // Iterate through each individual elevation value in the series.
    for (let currentLevelValue of levelSeries) {
        // If any element is found to possess a non-zero value, the condition is not met.
        // We assume non-negative integer inputs as per problem context.
        if (currentLevelValue > 0) {
            return false; // Early exit: a positive value indicates non-zero state.
        }
    }
    // If the entire iteration completes without finding any positive values,
    // it implies all elements are indeed zero.
    return true;
}

// The central function orchestrating the processing of elevation data to determine
// the minimum number of 'cutting' operations required.
function computeMinimumOperations(rawDataString) {
    // Pre-process the raw input: trim whitespace and split into distinct lines.
    const parsedInputLines = rawDataString.trim().split('\n');

    // The first line typically contains a count (e.g., N), but for this specific problem's logic,
    // it is not directly utilized in the core height reduction process.
    // Therefore, we skip parsing it, effectively "deleting" its processing from the original.
    // const totalDataPoints = parseInt(parsedInputLines[0], 10); // Original code parsed this, but it's unused.

    // The second line contains the space-separated elevation values.
    // Parse these into an array of integers, applying basic validation.
    const currentElevationProfile = parsedInputLines[1].split(' ').map(levelStr => {
        const numericalLevel = parseInt(levelStr, 10);
        // Guard clause: If parsing fails or the number is negative (unexpected for heights),
        // we default it to zero to prevent errors and maintain non-negative heights.
        if (isNaN(numericalLevel) || numericalLevel < 0) {
            return 0; // Treat invalid or negative input as zero height.
        }
        return numericalLevel;
    });

    // Initialize a counter to track the total number of operations performed.
    let reductionOperationCount = 0;

    // The main processing loop continues as long as there are any non-zero elevations remaining.
    while (!areAllElementsZero(currentElevationProfile)) {
        // Determine the highest elevation value present in the current profile.
        // Using spread syntax with Math.max for a concise way to find the maximum.
        const peakHeightValue = Math.max(...currentElevationProfile);

        // Defensive check: If the computed peak height is zero or less,
        // it indicates an anomaly (should be caught by areAllElementsZero) or invalid state.
        if (peakHeightValue <= 0) {
            break; // Exit loop to prevent infinite execution.
        }

        // Find the index of the first occurrence of this peak height value.
        // This is a direct replacement for the original `indexOf` call, showing a rewritten logic.
        let contiguousBlockStart = -1;
        for (let i = 0; i < currentElevationProfile.length; i++) {
            if (currentElevationProfile[i] === peakHeightValue) {
                contiguousBlockStart = i;
                break; // Found the initial position of the highest block.
            }
        }

        // Another defensive check: If no peak height block was identified (unexpected if peakHeightValue > 0).
        if (contiguousBlockStart === -1) {
            break;
        }

        // Determine the ending index of this contiguous block of `peakHeightValue`.
        let contiguousBlockEnd = contiguousBlockStart;
        // The condition now explicitly includes a boundary check to prevent out-of-bounds access.
        while (
            contiguousBlockEnd + 1 < currentElevationProfile.length &&
            currentElevationProfile[contiguousBlockEnd + 1] === peakHeightValue
        ) {
            contiguousBlockEnd++; // Extend the block as long as the peak height continues.
        }

        // Decrement all elevation levels within the identified contiguous block by one.
        // The original method of creating an intermediate array (maxValRange) has been deleted;
        // instead, we directly iterate and modify the relevant section of the main array.
        for (let currentIdx = contiguousBlockStart; currentIdx <= contiguousBlockEnd; currentIdx++) {
            currentElevationProfile[currentIdx]--;
        }

        // Increment the total count of operations after each successful reduction step.
        reductionOperationCount++;
    }

    // Output the final tally of operations to the console.
    console.log(reductionOperationCount);
}

// The execution entry point: Reads input from standard input and initiates the processing.
// This I/O mechanism is standard and kept consistent with the original.
const fileInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
computeMinimumOperations(fileInputContent);