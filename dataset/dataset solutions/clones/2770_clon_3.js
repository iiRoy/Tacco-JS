const orchestrateCalculation = (rawInputString) => {
    // --- Stage 1: Initial data preparation and parsing ---
    // Remove leading/trailing whitespace from the entire input string, then split it into an array of lines.
    const inputLines = rawInputString.trim().split('\n');

    // Implement a basic check to ensure the input format is as expected.
    if (inputLines.length < 2) {
        // In a competitive programming context, this might not be strictly necessary as inputs are usually guaranteed valid.
        // However, for a Type III clone, adding such checks enhances robustness.
        process.stderr.write("Error: Insufficient input lines. Expected at least two lines for data processing.\n");
        return;
    }

    // Extract the total count of items from the first line.
    // Using `Number()` provides a flexible way to parse numeric strings.
    const itemCount = Number(inputLines[0]);

    // Validate the parsed item count.
    if (isNaN(itemCount) || itemCount <= 0) {
        process.stderr.write("Error: Invalid or non-positive item count provided. Cannot proceed with calculations.\n");
        return;
    }

    // Process the second line, which contains space-separated numbers.
    // Each number is parsed, validated, and then multiplied by two as per the original algorithm's requirement.
    const processedNumericArray = inputLines[1].split(' ').map(strValue => {
        const numValue = Number(strValue);
        if (isNaN(numValue)) {
            // Log an error for invalid number entries but attempt to continue with a default (e.g., 0).
            // In a real-world scenario, robust error handling or throwing an exception might be preferred.
            process.stderr.write(`Warning: Found non-numeric value '${strValue}'. Treating as 0.\n`);
            return 0;
        }
        return numValue * 2; // Doubling each input value.
    });

    // Optional: Verify if the actual number of elements matches the declared count.
    if (processedNumericArray.length !== itemCount) {
        process.stderr.write(`Warning: Declared item count (${itemCount}) does not match actual processed array length (${processedNumericArray.length}). Using declared count for subsequent loops.\n`);
        // Depending on requirements, one might truncate or pad `processedNumericArray`.
        // For this clone, we proceed, trusting the problem constraints.
    }

    // --- Stage 2: Calculate a cumulative alternating sum ---
    // This calculation generates an intermediate value essential for deriving the final sequence.
    let currentAlternatingSum = 0;

    // Iterate through the `processedNumericArray` to compute the alternating sum.
    // The pattern is value_i - (value_{i-1} - (...)).
    for (let index = 0; index < itemCount; ++index) {
        currentAlternatingSum = processedNumericArray[index] - currentAlternatingSum;
    }

    // --- Stage 3: Determine the initial element of the final sequence ---
    // The first element of the target sequence is half of the total alternating sum.
    const initialSequenceElement = currentAlternatingSum / 2;

    // --- Stage 4: Construct the final derived sequence ---
    // An array is pre-allocated for efficiency, then populated with the calculated elements.
    const resultantSequence = new Array(itemCount);
    resultantSequence[0] = initialSequenceElement; // The first element is set directly.

    // A temporary variable to hold the last computed element, used for successive calculations.
    let previousDerivedElement = initialSequenceElement;

    // Loop through the remaining elements to complete the sequence.
    // Each element is calculated based on an element from the `processedNumericArray` and the previous derived element.
    for (let seqIteration = 1; seqIteration < itemCount; ++seqIteration) {
        // The logic for the Nth element (at index `seqIteration`) uses the (N-1)th element
        // from the `processedNumericArray` (at index `seqIteration - 1`).
        const sourceDoubleValue = processedNumericArray[seqIteration - 1];
        const nextDerivedElement = sourceDoubleValue - previousDerivedElement;
        resultantSequence[seqIteration] = nextDerivedElement;
        previousDerivedElement = nextDerivedElement; // Update for the next iteration.
    }

    // --- Stage 5: Format and deliver the output ---
    // Join the elements of the `resultantSequence` with a space and print to standard output,
    // followed by a newline character for proper termination.
    process.stdout.write(resultantSequence.join(' ') + '\n');
};

// The entry point for execution. Reads the entire content of `/dev/stdin`
// asynchronously (but `readFileSync` is synchronous) and passes it to the orchestrator.
orchestrateCalculation(require('fs').readFileSync('/dev/stdin', 'utf8'));