function processInputData(rawInputString) {
    // This function takes a raw string input, typically from standard input,
    // and processes it according to specific requirements.
    // It extracts numerical parameters and a sequence of numbers,
    // then counts how many elements in the sequence meet a certain condition.

    // Step 1: Split the entire input string into individual lines.
    // Each line becomes an element in the 'parsedInputLines' array.
    const parsedInputLines = rawInputString.split('\n');

    // Guard clause: Ensure there are at least two lines of input.
    // If not, log an error and terminate processing.
    if (parsedInputLines.length < 2) {
        console.error("Processing halted: Insufficient input lines detected. Expected at least two lines.");
        return;
    }

    // Step 2: Parse the first line to extract the problem's parameters.
    // The first line is expected to contain two space-separated integers:
    // - The total number of elements to consider (N)
    // - The threshold value for comparison (K)
    const firstLineTokens = parsedInputLines[0].split(' ');

    // Guard clause: Verify that the first line contains enough tokens.
    if (firstLineTokens.length < 2) {
        console.error("Processing halted: First line does not contain enough space-separated parameters.");
        return;
    }

    // Explicitly convert the string tokens into integer numbers.
    const numItemsToConsider = parseInt(firstLineTokens[0], 10); // Represents N
    const targetValue = parseInt(firstLineTokens[1], 10);       // Represents K

    // Additional validation: Check if parsed numbers are valid.
    if (isNaN(numItemsToConsider) || isNaN(targetValue)) {
        console.error("Processing halted: Failed to parse valid numerical parameters from the first line.");
        return;
    }

    // Step 3: Process the second line, which contains the sequence of numbers.
    // These numbers are also space-separated.
    const sequenceStringElements = parsedInputLines[1].split(' ');

    // Convert all string elements in the sequence to integers.
    // Any non-numerical strings will result in NaN, which will be filtered out.
    const numericSequenceData = sequenceStringElements.map(str => parseInt(str, 10));

    // Filter out any elements that failed to parse into valid numbers (NaN).
    // This ensures only legitimate numerical data is processed.
    const validNumericSequenceData = numericSequenceData.filter(num => !isNaN(num));

    // Determine the actual number of elements to iterate over.
    // This takes the minimum of 'numItemsToConsider' (N) and the length of the valid sequence data.
    // This prevents out-of-bounds access if N is larger than the actual sequence length.
    const effectiveIterationLimit = Math.min(numItemsToConsider, validNumericSequenceData.length);

    // Step 4: Initialize a counter for elements that satisfy the comparison condition.
    let qualifyingElementCounter = 0;

    // Step 5: Iterate through the sequence up to the determined limit.
    // For each element, check if it is greater than or equal to the 'targetValue'.
    for (let currentElementIndex = 0; currentElementIndex < effectiveIterationLimit; currentElementIndex++) {
        const currentElementValue = validNumericSequenceData[currentElementIndex];

        // Introduce an intermediate boolean variable for enhanced readability
        // regarding the condition check.
        const doesElementMeetCriterion = currentElementValue >= targetValue;

        if (doesElementMeetCriterion) {
            qualifyingElementCounter++; // Increment the counter if the condition is met.
        }
    }

    // Step 6: Output the final count of elements that met the specified criterion.
    console.log(qualifyingElementCounter);
}

// The following line is crucial for competitive programming environments.
// It reads the entire standard input asynchronously and passes it to the
// 'processInputData' function for execution.
// This part of the code must remain unchanged as per the problem's constraints.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));