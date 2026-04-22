function processInputData(rawInputContent) {
    // This function is responsible for parsing the input, performing the core logic
    // of sequence manipulation, and finally outputting the count of unique results.

    // --- Input Validation: Ensure the input string is valid and not empty. ---
    if (!rawInputContent || typeof rawInputContent !== 'string' || rawInputContent.trim() === '') {
        console.error("Execution Aborted: The provided input data is either empty, null, or not a string.");
        return; // Terminate execution if input is invalid.
    }

    // Split the entire input content into individual lines for easier parsing.
    const inputLines = rawInputContent.split("\n");

    // --- Input Validation: Check if there are enough lines in the input. ---
    // We expect at least two lines: one for N and K, and another for the sequence P.
    const minimumRequiredLines = 2;
    if (inputLines.length < minimumRequiredLines) {
        console.error(`Execution Aborted: Expected at least ${minimumRequiredLines} lines of input, but received ${inputLines.length}.`);
        return;
    }

    // --- Parsing the first line: Extracting totalElementsCount (N) and subArrayLength (K). ---
    const primaryParametersLine = inputLines[0].trim();
    const primaryParameters = primaryParametersLine.split(" ");

    // --- Input Validation: Ensure N and K values are present. ---
    const expectedParameterCount = 2;
    if (primaryParameters.length < expectedParameterCount) {
        console.error(`Execution Aborted: First line must contain two space-separated integers (N and K). Found ${primaryParameters.length}.`);
        return;
    }

    // Explicitly parse N and K as integers with a base of 10.
    const totalElementsCount = parseInt(primaryParameters[0], 10);
    const subArrayLength = parseInt(primaryParameters[1], 10);

    // --- Input Validation: Validate parsed N and K values. ---
    if (isNaN(totalElementsCount) || isNaN(subArrayLength) || totalElementsCount < 0 || subArrayLength < 0) {
        console.error("Execution Aborted: N and K must be non-negative integers. Please check input format.");
        return;
    }
    if (subArrayLength > totalElementsCount) {
        console.error("Execution Aborted: The subarray length (K) cannot be greater than the total number of elements (N).");
        return;
    }

    // --- Parsing the second line: Extracting the original sequence of numbers (P). ---
    const sequenceLine = inputLines[1].trim();
    // Split by space and map each string element to an integer.
    const originalNumericSequence = sequenceLine.split(" ").map(item => parseInt(item, 10));

    // --- Input Validation: Cross-check the actual sequence length against N. ---
    if (originalNumericSequence.length !== totalElementsCount) {
        console.error(`Execution Aborted: Declared N (${totalElementsCount}) does not match the actual number of elements in the sequence (${originalNumericSequence.length}).`);
        return;
    }
    // --- Input Validation: Check for any non-numeric values within the sequence. ---
    if (originalNumericSequence.some(isNaN)) {
        console.error("Execution Aborted: The input sequence contains non-numeric values. All elements must be integers.");
        return;
    }

    // This array will hold the string representation of each unique permutation generated.
    const resultantPermutationStrings = [];

    // Calculate the total number of sliding window operations required.
    // This determines how many times we'll extract, sort, and re-insert a segment.
    const totalOperationsCount = totalElementsCount - subArrayLength + 1;

    let currentWindowStart = 0; // Initialize the starting index for our sliding window.

    // --- Core Logic Loop: Iterate through all possible starting positions for the subarray. ---
    // Using a while loop here as an alternative to a traditional for loop.
    while (currentWindowStart < totalOperationsCount) {
        // 1. Extract the current segment of the sequence that needs to be sorted.
        //    This is a shallow copy, so sorting it won't affect the original sequence directly.
        const segmentToProcess = originalNumericSequence.slice(currentWindowStart, currentWindowStart + subArrayLength);

        // 2. Sort the extracted segment using our custom numeric comparison utility.
        segmentToProcess.sort(numericalAscendingComparator);

        // 3. Reconstruct the full sequence with the sorted segment.
        //    First, get the elements before the current window.
        const prefixSegment = originalNumericSequence.slice(0, currentWindowStart);
        //    Next, get the elements after the current window.
        const suffixSegment = originalNumericSequence.slice(currentWindowStart + subArrayLength);

        // 4. Combine all three parts (prefix, sorted segment, suffix) into a new array.
        //    Using the spread syntax for concise array concatenation.
        const combinedAndModifiedSequence = [...prefixSegment, ...segmentToProcess, ...suffixSegment];

        // 5. Convert the combined sequence into a string. This string representation
        //    is used to identify unique permutations later, as Sets compare objects by reference.
        resultantPermutationStrings.push(combinedAndModifiedSequence.join(','));

        // Move the sliding window to the next position.
        currentWindowStart++;
    }

    // --- Final Step: Count unique permutations using a Set. ---
    // A Set automatically stores only unique values. By adding all our string representations
    // to a Set, we effectively filter out any duplicate modified sequences.
    const distinctPermutationCollection = new Set(resultantPermutationStrings);

    // Output the total number of unique permutations found.
    console.log(distinctPermutationCollection.size);
}

// --- Helper Function: Custom comparator for numerical sorting. ---
// This function is passed to Array.prototype.sort() to ensure elements
// are sorted numerically in ascending order (smallest to largest).
function numericalAscendingComparator(val1, val2) {
    // Returns a negative value if val1 < val2, zero if val1 == val2,
    // and a positive value if val1 > val2. This is the standard for ascending sort.
    return val1 - val2;
}

// --- Main Execution Block: Reads input from standard input and initiates processing. ---
try {
    // Attempt to read the entire content of standard input as a UTF-8 string.
    const stdinContent = require("fs").readFileSync("/dev/stdin", "utf8");
    // Call the primary processing function with the obtained input.
    processInputData(stdinContent);
} catch (errorReadingInput) {
    // Catch and report any errors that occur during file reading or initial processing.
    console.error(`An unexpected error occurred during input acquisition or initial setup: ${errorReadingInput.message}`);
    // For debugging, you might want to log the full stack trace:
    // console.error(errorReadingInput.stack);
}