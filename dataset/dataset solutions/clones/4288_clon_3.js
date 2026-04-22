let collectedInputBuffer = []; // Global buffer to accumulate incoming data chunks from standard input.

// Configure the input stream to decode data as UTF-8 strings.
process.stdin.setEncoding('utf8');

// Attach an event listener for 'data' events on the standard input stream.
// Each time a data chunk is received, it is pushed into our buffer.
process.stdin.on('data', (inputDataChunk) => {
    collectedInputBuffer.push(inputDataChunk);
});

// Attach an event listener for the 'end' event on the standard input stream.
// This signifies that all input has been received.
process.stdin.on('end', () => {
    // Once all data is collected, join the chunks, remove leading/trailing whitespace,
    // and then split the entire string into an array of individual lines.
    const processedInputLines = collectedInputBuffer.join('').trim().split(/\r?\n/);
    
    // Initiate the core logic of the application with the prepared input lines.
    executeSolutionLogic(processedInputLines);
});

/**
 * Orchestrates the main solution process, parsing input and invoking the recursive calculation.
 * @param {string[]} textualInputLines - An array of strings, where each string is a line from the input.
 */
function executeSolutionLogic(textualInputLines) {
    // Perform initial validation: ensure we have at least two lines of input.
    if (!textualInputLines || textualInputLines.length < 2) {
        console.error("Input Error: Expected at least two lines of data, but fewer were provided.");
        return; // Terminate execution if input is insufficient.
    }

    // Extract and parse the first line, which should contain the count of elements.
    const firstLineNumberStr = textualInputLines[0];
    const expectedElementCount = parseInt(firstLineNumberStr, 10);

    // Validate the parsed count for correctness (must be a non-negative integer).
    if (isNaN(expectedElementCount) || expectedElementCount < 0) {
        console.error(`Input Error: The first line '${firstLineNumberStr}' is not a valid non-negative integer for element count.`);
        return;
    }

    // Extract and parse the second line, splitting it into string tokens by spaces.
    const numericStringTokens = textualInputLines[1].split(' ');

    // Provide warnings or adjust behavior if the number of provided tokens doesn't match the expected count.
    if (numericStringTokens.length !== expectedElementCount) {
        console.warn(`Input Warning: Expected ${expectedElementCount} numbers, but found ${numericStringTokens.length}. Adjusting input array.`);
    }
    
    // Transform string tokens into an array of integers.
    // We slice to match the expected count, parse each string, and filter out any invalid numbers (NaN).
    let processedIntegerArray = numericStringTokens
        .slice(0, expectedElementCount) // Ensure we don't process more elements than specified by expectedElementCount.
        .map(token => parseInt(token, 10))
        .filter(value => !isNaN(value)); // Remove any parsing failures.

    // If, after parsing and filtering, the array is shorter than expected, pad it with zeros.
    // This ensures `processedIntegerArray` always has `expectedElementCount` elements.
    while (processedIntegerArray.length < expectedElementCount) {
        processedIntegerArray.push(0); // Default padding value.
    }

    // If the array is still empty despite `expectedElementCount` being positive, something went wrong.
    if (processedIntegerArray.length === 0 && expectedElementCount > 0) {
        console.error("Input Error: No valid numbers could be extracted from the second input line.");
        return;
    }
    
    // Invoke the recursive computation function, starting from the first element (index 0).
    const finalCalculatedSum = performRecursiveSummation(0, processedIntegerArray);

    // Output the final computed result to the standard output.
    console.log(finalCalculatedSum);
}

/**
 * Computes a weighted sum recursively based on the parity of elements and their position.
 * This function effectively explores combinations determined by the problem's rules.
 * @param {number} currentElementIndex - The zero-based index of the element currently being considered.
 * @param {number[]} numericalDataSequence - The array of integers on which the calculation is performed.
 * @returns {number} The cumulative sum from the current position onwards.
 */
function performRecursiveSummation(currentElementIndex, numericalDataSequence) {
    const sequenceLength = numericalDataSequence.length; // Cache length for repeated access.

    // Base case: If the current index is beyond the array bounds, there are no more elements to process.
    if (currentElementIndex >= sequenceLength) {
        return 0;
    }

    // Additional guard: Ensure the index is not negative, though unlikely with proper calls.
    if (currentElementIndex < 0) {
        console.error("Logic Error: Negative index encountered during recursive summation. This indicates an issue.");
        return 0; // Treat as an invalid path, contributing zero.
    }

    // Calculate the 'power of three' component.
    // This value is 3 raised to the power of how many elements are *after* the current one.
    // This replaces the explicit loop from the original code.
    const subsequentElementsCount = sequenceLength - 1 - currentElementIndex;
    const powerOfThreeFactor = (subsequentElementsCount > 0) ? Math.pow(3, subsequentElementsCount) : 1;
    // Math.pow(3, 0) correctly evaluates to 1, so the conditional could be simplified, but kept for clarity.

    // Recursively call the function for the next element in the sequence.
    const contributionFromSuccessors = performRecursiveSummation(currentElementIndex + 1, numericalDataSequence);

    let currentIterationContribution = 0;
    const valueAtCurrentIndex = numericalDataSequence[currentElementIndex];
    const isCurrentValueEven = (valueAtCurrentIndex % 2 === 0); // Pre-evaluate parity.

    // Apply the core conditional logic based on the parity of the current number.
    if (isCurrentValueEven) {
        // If the current number is even: (power_of_three_factor + 2 * contribution_from_successors)
        currentIterationContribution = powerOfThreeFactor + (2 * contributionFromSuccessors);
    } else {
        // If the current number is odd: (2 * power_of_three_factor + contribution_from_successors)
        currentIterationContribution = (2 * powerOfThreeFactor) + contributionFromSuccessors;
    }

    return currentIterationContribution;
}