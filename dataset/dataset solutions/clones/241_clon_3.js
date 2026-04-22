const readline = require('readline');

async function processInputData() {
    // Array to accumulate the final result strings for each input line.
    const evaluationResults = [];

    // Configure the interface for reading input streams line by line.
    const lineReaderInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false // Indicates non-interactive input, suitable for piping.
    });

    // Utility function for robust integer parsing, defaulting to zero on failure.
    const safeParseInt = (inputString) => {
        const parsedNumber = parseInt(inputString, 10);
        return isNaN(parsedNumber) ? 0 : parsedNumber;
    };

    // Define the overall comparison threshold as a constant for clarity.
    const comparisonUpperLimit = 20;

    // Iterate asynchronously through each line provided via standard input.
    for await (const currentLineData of lineReaderInterface) {
        // Skip processing if the line is empty or contains only whitespace.
        if (!currentLineData.trim()) {
            continue;
        }

        // Split the current line into individual string components using space as a delimiter.
        const inputSegments = currentLineData.split(' ');

        // Implement a basic validation check for the number of expected input parts.
        if (inputSegments.length < 3) {
            evaluationResults.push("INSUFFICIENT_INPUT_DATA"); // Record a specific message for malformed input.
            continue; // Proceed to the next line of input.
        }

        // Parse the three primary numerical values from the segmented input.
        const primaryOperand = safeParseInt(inputSegments[0]);
        const secondaryOperand = safeParseInt(inputSegments[1]);
        const tertiaryOperand = safeParseInt(inputSegments[2]); // This value influences the candidate set indirectly.

        // Generate a collection of numbers based on a specific exclusion logic,
        // mirroring the behavior of the original C# 'mountain' list.
        // The original C# condition `if (i != c1 || i != c2 || i != c3)` means:
        // A number `i` is included UNLESS `i` is simultaneously equal to `c1`, `c2`, AND `c3`.
        // If `c1`, `c2`, `c3` are not all identical, then no numbers will be excluded.
        // If `c1 = c2 = c3 = X`, then only `X` will be excluded from the 1-10 range.
        const candidateNumericSet = [];
        for (let numberIterator = 1; numberIterator <= 10; numberIterator++) {
            // Apply the exact logical condition for inclusion/exclusion.
            if (numberIterator !== primaryOperand || numberIterator !== secondaryOperand || numberIterator !== tertiaryOperand) {
                candidateNumericSet.push(numberIterator);
            }
        }

        // Extract the fourth element (0-indexed position 3) from the generated set.
        // This element is guaranteed to exist because at most 3 numbers can be excluded from a range of 10.
        const derivedComponentValue = candidateNumericSet[3];

        // Compute the combined total for the final comparison.
        const computedTotalForCheck = primaryOperand + secondaryOperand + derivedComponentValue;

        // Evaluate the condition and store the corresponding outcome.
        if (computedTotalForCheck <= comparisonUpperLimit) {
            evaluationResults.push("YES");
        } else {
            evaluationResults.push("NO");
        }
    }

    // After all input lines have been processed, print each collected result.
    evaluationResults.forEach(finalVerdict => {
        console.log(finalVerdict);
    });
}

// Execute the main data processing function.
// Includes basic error handling for robustness.
processInputData().catch(processingError => {
    console.error("An unexpected error halted processing:", processingError.message);
    process.exit(1); // Exit with a non-zero code to indicate failure.
});