const calculateMaxIncreasingSubsequenceSize = (dataElements) => {
    // Ensure the input is a valid array and contains elements.
    // An empty array implies an LIS length of zero.
    if (!Array.isArray(dataElements) || dataElements.length === 0) {
        return 0;
    }

    // Create a working copy of the input array. This prevents modifying
    // the original array passed to the function, which is good practice.
    // The original code modifies T[0], so we replicate that behavior on our copy.
    const mutableSequence = [...dataElements];

    // Initialize an array to store the lengths of the longest increasing subsequences
    // ending at each respective index. Each element is initially zero.
    const currentLisLengths = new Array(mutableSequence.length).fill(0);

    // Based on the original implementation's behavior:
    // It sets the first element of the sequence to 0 and its corresponding LIS length to 0.
    // This effectively treats the first position as a "sentinel" or a dummy element
    // which is smaller than any positive number, simplifying the comparison logic
    // for subsequent elements.
    mutableSequence[0] = 0; // Sentinel value to ensure all other elements are considered "greater".
    currentLisLengths[0] = 0; // The LIS ending at this sentinel has a length of 0.

    // Determine the total number of elements in the sequence for loop bounds.
    const totalElementCount = mutableSequence.length;

    // Iterate through the sequence, starting from the second element (index 1),
    // as the first element is now a sentinel.
    for (let currentIdx = 1; currentIdx < totalElementCount; ++currentIdx) {
        // This variable will hold the index of the element encountered so far
        // that results in the longest LIS which can be extended by `mutableSequence[currentIdx]`.
        // It's initialized to 0, pointing to our sentinel.
        let optimalPreviousElementIdx = 0;

        // Inner loop: Examine all elements preceding the current element.
        for (let precedingIdx = 0; precedingIdx < currentIdx; ++precedingIdx) {
            // Two conditions must be met to extend an LIS:
            // 1. The element at `precedingIdx` must be strictly smaller than the `currentIdx` element.
            // 2. The LIS length ending at `precedingIdx` must be greater than
            //    the LIS length ending at `optimalPreviousElementIdx` found until this point.
            if (
                mutableSequence[precedingIdx] < mutableSequence[currentIdx] &&
                currentLisLengths[precedingIdx] > currentLisLengths[optimalPreviousElementIdx]
            ) {
                // If both conditions are true, update `optimalPreviousElementIdx`
                // as we've found a better candidate to extend the LIS.
                optimalPreviousElementIdx = precedingIdx;
            }
        }

        // The LIS length ending at `currentIdx` is 1 plus the LIS length
        // of the best preceding element found.
        currentLisLengths[currentIdx] = currentLisLengths[optimalPreviousElementIdx] + 1;
    }

    // After populating `currentLisLengths` for all elements,
    // we need to find the overall maximum value within this array.
    // This maximum represents the length of the longest increasing subsequence
    // across the entire input sequence.
    let ultimateLisLength = 0;
    // We can start searching from index 1 because `currentLisLengths[0]` is always 0 (the sentinel).
    for (let idx = 1; idx < totalElementCount; ++idx) {
        if (currentLisLengths[idx] > ultimateLisLength) {
            ultimateLisLength = currentLisLengths[idx];
        }
    }

    // Return the final computed length.
    return ultimateLisLength;
};

// --- Execution entry point: Handles input reading and output ---

// Define the path for standard input, common in competitive programming environments.
const stdInputPath = '/dev/stdin';

try {
    // Acquire the Node.js file system module.
    const fileSystemModule = require('fs');

    // Read the entire content from the specified standard input file.
    // The content is expected to be UTF-8 encoded text.
    const rawTextContent = fileSystemModule.readFileSync(stdInputPath, 'utf8');

    // Pre-process the raw text input:
    // 1. Remove any leading or trailing whitespace (like initial/final newlines).
    // 2. Split the cleaned string into an array of individual lines.
    // 3. Transform each line (string) into a numerical value.
    const parsedNumericArray = rawTextContent
        .trim()
        .split('\n')
        .map(lineValue => Number(lineValue));

    // Invoke our specialized function to compute the LIS length
    // with the prepared numeric data.
    const finalComputedResult = calculateMaxIncreasingSubsequenceSize(parsedNumericArray);

    // Display the final calculated length to the console (standard output).
    console.log(finalComputedResult);

} catch (processingError) {
    // If any error occurs during file reading, parsing, or computation,
    // log the error message for debugging.
    console.error("An operational error occurred:", processingError.message);
    // In a real application, you might want to exit with a non-zero code.
    // process.exit(1);
}