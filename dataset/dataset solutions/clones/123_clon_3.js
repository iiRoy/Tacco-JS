// This function recursively calculates the number of unique digit sequences
// of a specified length that sum up to a target value.
// It considers digits from `startDigitForNext` up to 9, ensuring each digit
// in the sequence is greater than or equal to the previous one.
function computeSequenceCombinations(currentPartialSum, startDigitForNext, requiredLength, targetOverallSum, currentRecursionLevel) {
    // Basic validation for input parameters to prevent infinite loops or errors.
    // If any fundamental parameter is invalid (e.g., negative length or sum,
    // or an impossible starting digit), we immediately return 0 as no valid combinations exist.
    if (requiredLength < 0 || targetOverallSum < 0 || startDigitForNext > 9 || startDigitForNext < 0) {
        return 0; // Invalid path detected
    }

    // Base case: Check if we have placed enough digits to satisfy the required sequence length.
    // If the next recursion level would be equal to the required length, it means
    // we are attempting to place the *last* digit of the sequence.
    if (currentRecursionLevel + 1 === requiredLength) {
        // Calculate the exact sum that the final digit must contribute.
        const remainingSumNeeded = targetOverallSum - currentPartialSum;

        // Determine if this `remainingSumNeeded` can be formed by a single digit
        // that adheres to the problem's constraints:
        // 1. The digit must be at least `startDigitForNext` (non-decreasing sequence).
        // 2. The digit must be at most 9.
        const isValidFinalDigit = (startDigitForNext <= remainingSumNeeded && remainingSumNeeded <= 9);

        // If a valid final digit exists, this path contributes 1 valid sequence; otherwise, 0.
        return isValidFinalDigit ? 1 : 0;
    }

    // Initialize a counter to accumulate the total number of valid sequences found
    // by exploring all possible branches from the current state.
    let totalValidCounts = 0;

    // Iterate through all possible digits that can be placed at the current position
    // in the sequence. The digit must be `currentCandidateDigit` and must be:
    // - Greater than or equal to `startDigitForNext` (to maintain non-decreasing order).
    // - Less than or equal to 9 (as per problem constraints).
    for (let currentCandidateDigit = startDigitForNext; currentCandidateDigit <= 9; ++currentCandidateDigit) {
        // Calculate what the sum would be if we include `currentCandidateDigit`.
        const potentialNewSum = currentPartialSum + currentCandidateDigit;

        // Optimization: If the current partial sum, combined with `currentCandidateDigit`,
        // already exceeds the `targetOverallSum`, then adding any further positive digits
        // will only increase the sum further. Thus, this branch cannot lead to a solution.
        // We can safely prune this branch and stop exploring higher digits for this position.
        if (potentialNewSum > targetOverallSum) {
            break; // Exit the loop for this particular branch
        }

        // If the `currentCandidateDigit` is valid so far, recursively call the function
        // to find combinations for the subsequent digits in the sequence.
        // - `potentialNewSum`: The updated sum after adding `currentCandidateDigit`.
        // - `currentCandidateDigit + 1`: The next digit must be at least this value
        //   to maintain the non-decreasing property.
        // - `requiredLength`, `targetOverallSum`: These remain constant for the sequence.
        // - `currentRecursionLevel + 1`: We are moving one level deeper in the sequence.
        totalValidCounts += computeSequenceCombinations(
            potentialNewSum,
            currentCandidateDigit + 1,
            requiredLength,
            targetOverallSum,
            currentRecursionLevel + 1
        );
    }

    // After exploring all valid digits for the current position, return the
    // accumulated count of all valid sequences found through these paths.
    return totalValidCounts;
}


// This function serves as the primary data processing logic.
// It receives the entire input string, parses it line by line,
// and invokes the recursive combination calculation for each valid entry.
const processInputLines = (entireInputPayload) => {
    // Implement a robust check for input sanity.
    // If the payload is not a string or is effectively empty after trimming,
    // there's nothing to process, so we exit early.
    if (typeof entireInputPayload !== 'string' || entireInputPayload.trim().length === 0) {
        return;
    }

    // Split the raw input into an array of individual lines.
    // `trim()` ensures no leading/trailing whitespace affects the split.
    const linesOfData = entireInputPayload.trim().split('\n');

    // Iterate over each line to process its contents.
    // Using a `for...of` loop provides a clear and modern iteration construct.
    for (const singleLine of linesOfData) {
        // Skip any lines that are empty or contain only whitespace.
        if (singleLine.trim().length === 0) {
            continue;
        }

        // Each line is expected to contain two space-separated values (N and S).
        const lineSegments = singleLine.split(' ');

        // Validate the format of the line. If it doesn't have exactly two parts,
        // it's malformed for this problem's context, so we skip it.
        if (lineSegments.length !== 2) {
            continue;
        }

        // Extract the string representations of N and S.
        const lengthStr = lineSegments[0];
        const sumStr = lineSegments[1];

        // Convert the string values to integers using `parseInt` with radix 10.
        const parsedLength = parseInt(lengthStr, 10);
        const parsedSum = parseInt(sumStr, 10);

        // Validate that the parsed values are indeed numbers. `isNaN` checks for invalid conversions.
        if (isNaN(parsedLength) || isNaN(parsedSum)) {
            continue;
        }

        // The problem statement specifies that an input of "0 0" acts as a termination signal.
        // Upon encountering this, we cease further processing of the input batch.
        if (parsedLength === 0 && parsedSum === 0) {
            // For a `for...of` loop, `return` exits the entire function, effectively stopping.
            return;
        }

        // Invoke the recursive calculation function with the parsed parameters.
        // The initial call starts with:
        // - `currentPartialSum`: 0 (no digits added yet)
        // - `startDigitForNext`: 0 (the first digit can be any from 0 to 9)
        // - `requiredLength`: The 'N' value from input.
        // - `targetOverallSum`: The 'S' value from input.
        // - `currentRecursionLevel`: 0 (representing the first level of recursion/digit placement).
        const resultForLine = computeSequenceCombinations(0, 0, parsedLength, parsedSum, 0);

        // Output the computed result to standard output.
        console.log(resultForLine);
    }
};


// This function is responsible for setting up and managing the standard input stream.
// It buffers all incoming data and, once the input stream concludes,
// it passes the complete accumulated data to a designated processing function.
function setupStandardInputProcessor(dataProcessingFunction) {
    // Ensure that a valid callback function is provided to handle the input.
    // If not, throw an error to indicate a critical setup issue.
    if (typeof dataProcessingFunction !== 'function') {
        throw new Error("A valid data processing function must be supplied to setupStandardInputProcessor.");
    }

    // Declare a mutable string variable to store all input data chunks as they arrive.
    let bufferedInputContent = '';

    // Check for the availability of Node.js-specific `process.stdin`.
    // This makes the code more robust if run in environments without `process` object.
    if (!process || !process.stdin) {
        // If `process.stdin` is not available, log a warning and exit,
        // as standard input cannot be read in this context.
        console.warn("Node.js 'process.stdin' not available. Cannot read standard input.");
        return;
    }

    // Explicitly resume the standard input stream. In some Node.js versions/contexts,
    // stdin might be paused by default.
    process.stdin.resume();

    // Set the character encoding for the input stream to 'utf8' to correctly handle
    // various characters and ensure proper string concatenation.
    process.stdin.setEncoding('utf8');

    // Attach an event listener for the 'data' event.
    // This event fires whenever a chunk of data becomes available from stdin.
    // Each `dataFragment` is appended to our `bufferedInputContent`.
    process.stdin.on('data', (dataFragment) => {
        bufferedInputContent += dataFragment;
    });

    // Attach an event listener for the 'end' event.
    // This event signifies that the input stream has closed (e.g., end-of-file reached).
    // Once all input is received, the `dataProcessingFunction` is called with the full content.
    process.stdin.on('end', () => {
        dataProcessingFunction(bufferedInputContent);
    });

    // Attach an optional 'error' event listener for robustness.
    // This catches potential issues during the input reading process.
    process.stdin.on('error', (err) => {
        console.error("An error occurred while reading from standard input:", err);
    });
}


// This is the main execution entry point of the script.
// It initiates the input handling process by passing our `processInputLines`
// function to the `setupStandardInputProcessor`.
// This effectively starts listening for and processing standard input.
setupStandardInputProcessor(processInputLines);