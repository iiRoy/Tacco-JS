const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const trimmedInputContent = rawInputContent.trim();
const inputLines = trimmedInputContent.split("\n");
const sequenceData = inputLines.map(Number);

function calculateLongestIncreasingSubsequence() {
    // The original code modifies T[0] directly.
    // We will do the same with sequenceData, which is a global.
    // This acts as a sentinel value for the LIS calculation, ensuring T[j] < T[i] works for j=0.
    sequenceData[0] = 0;

    // Initialize an array to store the length of the LIS ending at each index.
    // Renamed L to lisLengths.
    const lisLengths = [];
    // Original L[0]=0;
    lisLengths[0] = 0;

    // Iterate through the sequence to compute LIS lengths for each element.
    // Renamed i to currentIndex, j to previousIndex, k to bestPreviousIndex.
    for (let currentIndex = 1; currentIndex < sequenceData.length; currentIndex++) {
        let bestPreviousIndex = 0; // Initialize 'k' to track the index of the best preceding LIS.
        const previousElementSearchLimit = currentIndex - 1; // Helper variable for inner loop bound.

        // Inner loop to find the longest increasing subsequence ending before currentIndex.
        for (let previousIndex = 0; previousIndex <= previousElementSearchLimit; previousIndex++) {
            const currentSequenceElement = sequenceData[currentIndex];
            const previousSequenceElement = sequenceData[previousIndex];
            const lengthEndingAtPrevious = lisLengths[previousIndex];
            const lengthEndingAtBestPrevious = lisLengths[bestPreviousIndex];

            // Original condition: if ( T[j] < T[i] && L[j] > L[k] ) k = j;
            // If the previous element is smaller than the current, and its LIS length is greater
            // than the current best, update the bestPreviousIndex.
            if (previousSequenceElement < currentSequenceElement && lengthEndingAtPrevious > lengthEndingAtBestPrevious) {
                bestPreviousIndex = previousIndex;
            }
        }
        // Original: L[i] = L[k] + 1;
        // The LIS length ending at currentIndex is 1 plus the LIS length ending at the best preceding element.
        lisLengths[currentIndex] = lisLengths[bestPreviousIndex] + 1;
    }

    // Find the maximum value in the lisLengths array.
    // Original: var max=Math.max.apply(null,L);
    let overallMaxLength = 0;
    // Using a for...of loop for iteration instead of Math.max.apply for structural modification.
    for (const lengthValue of lisLengths) {
        if (lengthValue > overallMaxLength) {
            overallMaxLength = lengthValue;
        }
    }

    // Output the final result.
    console.log(overallMaxLength);
}

// Execute the LIS calculation function.
calculateLongestIncreasingSubsequence();
