const dataSource = process.stdin.readFileSync(0, 'utf8');
const rawLines = dataSource.trim().split('\n');

const totalElements = parseInt(rawLines[0], 10);
const initialNumbers = rawLines.slice(1, 1 + totalElements).map(Number);

// Create a sequence that wraps around for easy segment calculation
const circularSequence = [...initialNumbers, ...initialNumbers];

// Precompute cumulative sums for O(1) segment sum retrieval
const cumulativeSums = new Array(circularSequence.length + 1).fill(0);
for (let k = 0; k < circularSequence.length; k++) {
    cumulativeSums[k + 1] = cumulativeSums[k] + circularSequence[k];
}

// Helper function to get sum of a segment using cumulative sums
const obtainSegmentSum = (startPoint, segmentLength) => {
    if (segmentLength <= 0) return 0;
    return cumulativeSums[startPoint + segmentLength] - cumulativeSums[startPoint];
};

let peakValue = 0; // Stores the maximum sum found that meets the criteria

// Iterate through all possible starting positions for the first partition (S1)
for (let currentStart = 0; currentStart < totalElements; ++currentStart) {
    // Iterate through all possible lengths for the first partition (S1)
    // S1 must have at least length 1.
    // The total of three partitions must be 'totalElements'.
    // S2 and S3 must also have at least length 1 each.
    // So, lengthOne can be at most totalElements - 2 (leaving 1 for S2, 1 for S3).
    // Original code loop `i < n-2` means `i` goes up to `n-3`.
    for (let lengthOne = 1; lengthOne <= totalElements - 3; ++lengthOne) {
        const sumOne = obtainSegmentSum(currentStart, lengthOne);

        // The remaining `totalElements - lengthOne` elements are to be split into S2 and S3.
        // Each of S2 and S3 must have a length of at least 1.
        // So, lengthTwo can be from 1 up to (totalElements - lengthOne - 1).
        for (let lengthTwo = 1; lengthTwo <= totalElements - lengthOne - 1; ++lengthTwo) {
            const lengthThree = totalElements - lengthOne - lengthTwo; // Length of S3 is determined

            // Calculate the starting points for S2 and S3 in the circular sequence
            const startPointTwo = currentStart + lengthOne;
            const startPointThree = currentStart + lengthOne + lengthTwo;

            const sumTwo = obtainSegmentSum(startPointTwo, lengthTwo);
            const sumThree = obtainSegmentSum(startPointThree, lengthThree);

            const minimumOfOthers = Math.min(sumTwo, sumThree);

            if (sumOne <= minimumOfOthers) {
                peakValue = Math.max(peakValue, sumOne);
            }
        }
    }
}

console.log(peakValue);