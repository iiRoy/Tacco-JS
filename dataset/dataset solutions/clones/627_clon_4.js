const sourceMaterial = require('fs');
const rawContent = sourceMaterial.readFileSync(0, 'utf8');
const numericalStrings = rawContent.trim().split(/\s+/);

const itemCount = parseInt(numericalStrings[0], 10);
const initialCollection = [];
for (let idx = 1; idx <= itemCount; ++idx) {
    initialCollection.push(parseInt(numericalStrings[idx], 10));
}

// The original problem's outer loop for 'i' (first segment length) runs from 1 to n-3.
// If n is less than 4, this loop does not execute, and the result is 0.
if (itemCount < 4) {
    console.log(0);
    process.exit(0);
}

// Create an expanded collection by concatenating the initial collection with itself.
// This handles circular array access for segments spanning the array boundary.
const expandedCollection = initialCollection.concat(initialCollection);

// Generate cumulative sums (prefix sums) for efficient segment sum calculation.
// cumulativeSums[k] stores the sum of the first k elements of expandedCollection.
const cumulativeSums = [0];
expandedCollection.forEach(val => {
    cumulativeSums.push(cumulativeSums[cumulativeSums.length - 1] + val);
});

// Helper function to get the sum of a segment using cumulative sums.
// The segment includes 'begin' index and excludes 'finish' index.
const segmentAggregator = (begin, finish) => cumulativeSums[finish] - cumulativeSums[begin];

let grandMaximum = 0;

// Outer iteration: Determines the starting point of the N-length window within the expanded collection.
// This corresponds to the 'j' loop in the original code.
Array.from({ length: itemCount }).forEach((_, windowStartOffset) => {

    // Second iteration: Determines the length of the first partition (Partition A).
    // This corresponds to the 'i' loop in the original code, which runs from 1 to n-3.
    // So, `partitionALength` will go from 1 to `itemCount - 3`.
    Array.from({ length: itemCount - 3 }).forEach((_, lenAIndex) => {
        const partitionALength = lenAIndex + 1; // partitionALength ranges from 1 to itemCount - 3

        const partitionAStart = windowStartOffset;
        const partitionAEnd = windowStartOffset + partitionALength;
        const valueOfPartitionA = segmentAggregator(partitionAStart, partitionAEnd);

        // Calculate the remaining length for partitions B and C.
        const remainingSegmentLength = itemCount - partitionALength;

        // Third iteration: Determines the length of the second partition (Partition B).
        // This corresponds to the 'k' loop in the original code, which runs from 1 to n - i - 1.
        // So, `partitionBLength` will go from 1 to `remainingSegmentLength - 1`.
        Array.from({ length: remainingSegmentLength - 1 }).forEach((_, lenBIndex) => {
            const partitionBLength = lenBIndex + 1; // partitionBLength ranges from 1 to remainingSegmentLength - 1

            const partitionBStart = partitionAEnd;
            const partitionBEnd = partitionAEnd + partitionBLength;
            const valueOfPartitionB = segmentAggregator(partitionBStart, partitionBEnd);

            // The length of the third partition (Partition C) is determined by the remaining length.
            const partitionCLength = remainingSegmentLength - partitionBLength;
            const partitionCStart = partitionBEnd;
            const partitionCEnd = partitionBEnd + partitionCLength;
            const valueOfPartitionC = segmentAggregator(partitionCStart, partitionCEnd);

            const minimumOfOtherPartitions = Math.min(valueOfPartitionB, valueOfPartitionC);

            // Check the condition and update the grand maximum.
            if (valueOfPartitionA <= minimumOfOtherPartitions) {
                grandMaximum = Math.max(grandMaximum, valueOfPartitionA);
            }
        });
    });
});

console.log(grandMaximum);