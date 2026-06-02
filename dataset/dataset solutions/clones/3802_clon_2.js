const inputData = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n'); // Read input from standard input, split by newline

// Extract the number of elements and the direction string from the input
const numElements = parseInt(inputData.shift(), 10); // Get the first line, convert to integer
const directionString = inputData.shift(); // Get the second line, which is the string of directions

// Initialize counters for 'E' and 'W' characters
let eastCount = 0; // Tracks cumulative 'E's from the right
let westCount = 0; // Tracks cumulative 'W's from the left

// Arrays to store prefix sums of 'W' and suffix sums of 'E'
const westPrefixSums = []; // westPrefixSums[k] will store count of 'W's in S[0...k-1]
const eastSuffixSums = []; // eastSuffixSums[k] will store count of 'E's in S[k...N-1]

// Initialize base cases for prefix and suffix sums
westPrefixSums[0] = 0; // Before the first element, there are no 'W's
eastSuffixSums[numElements] = 0; // After the last element, there are no 'E's

// Populate the prefix and suffix sum arrays
// This loop iterates from left to right for westPrefixSums and effectively right to left for eastSuffixSums
for (let idx = 0; idx < numElements; idx++) {
    // Calculate prefix sums for 'W'
    if (directionString[idx] === 'W') {
        westCount++; // Increment count if current character is 'W'
    }
    westPrefixSums[idx + 1] = westCount; // Store the cumulative count up to this point

    // Calculate suffix sums for 'E'
    // We use (numElements - idx - 1) to access characters from the right end
    if (directionString[numElements - idx - 1] === 'E') {
        eastCount++; // Increment count if character from right is 'E'
    }
    eastSuffixSums[numElements - idx - 1] = eastCount; // Store the cumulative count from this point to the end
}

// Initialize the minimum number of changes needed
// The maximum possible changes would be numElements (e.g., all 'W's or all 'E's)
let minimumChanges = numElements;

// Iterate through all possible split points (from 0 to numElements)
// A split point 'idx' means we want to change S[0...idx-1] to 'W' and S[idx...N-1] to 'E'
// The cost for a split at 'idx' is (W's in S[0...idx-1]) + (E's in S[idx...N-1])
for (let idx = 0; idx <= numElements; idx++) {
    // Calculate the number of changes required for the current split point
    // westPrefixSums[idx] gives the count of 'W's in S[0...idx-1] that need to be changed to 'E'
    // eastSuffixSums[idx + 1] gives the count of 'E's in S[idx+1...N-1] that need to be changed to 'W'
    // The problem asks for the minimum number of people who need to change their direction.
    // If we split at 'idx', people at S[0...idx-1] should face 'W', and S[idx...N-1] should face 'E'.
    // So, we need to count 'E's in S[0...idx-1] and 'W's in S[idx...N-1].
    // The original code calculates W[i] + E[i+1].
    // W[i] is the count of 'W's in S[0...i-1].
    // E[i+1] is the count of 'E's in S[i+1...N-1].
    // This means it's counting 'W's to the left of the split and 'E's to the right of the split.
    // This is equivalent to finding the minimum number of people who *don't* need to change.
    // No, wait. The problem is to find the minimum number of people who need to change direction.
    // If we split at index `idx`, all people from `0` to `idx-1` should face West, and all people from `idx` to `numElements-1` should face East.
    // The number of changes needed for the left part (0 to idx-1) is the count of 'E's in that segment.
    // The number of changes needed for the right part (idx to numElements-1) is the count of 'W's in that segment.
    // Let's re-evaluate the original logic: `W[i] + E[i+1]`
    // `W[i]` is `sumW` after `i-1` iterations, meaning count of 'W's in `S[0...i-1]`.
    // `E[i+1]` is `sumE` after `N-(i+1)` iterations from the right, meaning count of 'E's in `S[i+1...N-1]`.
    // This sum `W[i] + E[i+1]` represents the number of 'W's to the left of `i` AND 'E's to the right of `i+1`.
    // This is not directly the number of changes.
    // Let's trace the original problem: "Minimum number of people who need to change their direction so that all people to the left of some point face West and all people to the right of that point face East."
    // If the split point is `k` (meaning `S[0...k-1]` are West, `S[k...N-1]` are East):
    // Changes needed = (count of 'E's in `S[0...k-1]`) + (count of 'W's in `S[k...N-1]`).
    // Let's re-check the original code's `W` and `E` arrays.
    // `W[i+1]` stores `sumW` which is count of 'W's in `S[0...i]`. So `W[k]` is count of 'W's in `S[0...k-1]`.
    // `E[N-i-1]` stores `sumE` which is count of 'E's in `S[N-i-1...N-1]`. So `E[k]` is count of 'E's in `S[k...N-1]`.
    // The original code calculates `W[i] + E[i+1]`.
    // `W[i]` is the count of 'W's in `S[0...i-1]`.
    // `E[i+1]` is the count of 'E's in `S[i+1...N-1]`.
    // This sum is the number of 'W's in the left segment and 'E's in the right segment.
    // This is the number of people who *do not* need to change if the split is between `i-1` and `i`.
    // The total number of people is `N`. So, `N - (W[i] + E[i+1])` would be the number of changes.
    // However, the problem is usually phrased as "minimum number of people to change direction".
    // Let's assume the original code's logic is correct for the specific problem it solves.
    // The original code finds `min(W[i] + E[i+1])`.
    // This is a common pattern for finding the minimum number of people who *don't* need to change.
    // If the problem is to minimize changes, then it should be `(i - W[i]) + ((N-i) - E[i])`.
    // Let's stick to the exact calculation of the original code.
    // `westPrefixSums[idx]` is the count of 'W's in `S[0...idx-1]`.
    // `eastSuffixSums[idx + 1]` is the count of 'E's in `S[idx+1...numElements-1]`.
    // The sum `westPrefixSums[idx] + eastSuffixSums[idx + 1]` represents the number of 'W's in the left part and 'E's in the right part.
    // This is the number of people who are already correctly oriented if the split is *between* `idx-1` and `idx`.
    // The problem asks for the minimum number of people to change.
    // If the split is at `idx`, then `S[0...idx-1]` should be 'W' and `S[idx...N-1]` should be 'E'.
    // Number of 'E's in `S[0...idx-1]` is `idx - westPrefixSums[idx]`.
    // Number of 'W's in `S[idx...N-1]` is `(numElements - idx) - eastSuffixSums[idx]`.
    // So the total changes would be `(idx - westPrefixSums[idx]) + ((numElements - idx) - eastSuffixSums[idx])`.
    // The original code's `W[i] + E[i+1]` is a different calculation.
    // Let's assume the original code is solving a variant where it minimizes the sum of 'W's on the left and 'E's on the right.
    // This is a common way to solve the "minimum changes" problem by finding the maximum "correctly oriented" people.
    // If `W[i]` is count of 'W's in `S[0...i-1]` and `E[i+1]` is count of 'E's in `S[i+1...N-1]`.
    // The sum `W[i] + E[i+1]` is the number of people who are already facing 'W' in the left segment and 'E' in the right segment.
    // This is the number of people who *do not* need to change.
    // To find the minimum number of changes, we need to find the maximum number of people who *don't* need to change, and subtract that from `N`.
    // So, `max_correct = max(W[i] + E[i+1])`. Then `min_changes = N - max_correct`.
    // The original code finds `min(W[i] + E[i+1])`. This is confusing.
    // Let's re-read the problem statement from the original source if possible.
    // Assuming the original code is correct for its intended purpose, I must replicate its exact logic.
    // The original code calculates `min = N` and then `min = W[i] + E[i+1]` if `min > W[i] + E[i+1]`.
    // This means it's finding the minimum value of `W[i] + E[i+1]`.
    // This value `W[i] + E[i+1]` is the count of 'W's in `S[0...i-1]` plus the count of 'E's in `S[i+1...N-1]`.
    // This is indeed the number of people who *don't* need to change if the split is at `i` (meaning `S[0...i-1]` are W, `S[i]` is ignored, `S[i+1...N-1]` are E).
    // This is a common interpretation for a specific type of problem. I will follow the original code's calculation exactly.

    if (minimumChanges > westPrefixSums[idx] + eastSuffixSums[idx + 1]) {
        minimumChanges = westPrefixSums[idx] + eastSuffixSums[idx + 1]; // Update minimum if a smaller sum is found
    }
}

// Output the final minimum value found
console.log(minimumChanges);
