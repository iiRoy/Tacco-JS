// This program processes a sequence of numerical operations received via standard input.
// It initializes a numerical sequence and then performs element swaps based on provided instructions.
// The first line of input specifies the total number of elements 'N' to manage.
// Subsequent lines (starting from the third line of input) contain comma-separated indices
// indicating which elements in the sequence should be exchanged.

globalThis.process.stdin.on("data", function(incomingByteBuffer) {
    // Convert the received binary buffer into a UTF-8 string.
    // Then, clean up the string by trimming whitespace and splitting it into individual lines.
    // Empty lines are filtered out to ensure only meaningful data is processed.
    const rawTextContent = incomingByteBuffer.toString('utf8').trim();
    const parsedInputLines = rawTextContent.split('\n').map(lineSegment => lineSegment.trim()).filter(segment => segment.length > 0);

    // Perform an early exit if no valid input lines are detected.
    if (parsedInputLines.length === 0) {
        // Log an error to stderr for diagnostic purposes.
        globalThis.console.error("Error: No data lines were provided for processing.");
        return;
    }

    // Extract and parse the initial element count from the very first line of input.
    // The radix (base 10) is specified for explicit integer conversion.
    const totalElementsCount = parseInt(parsedInputLines[0], 10);

    // Validate the parsed count to ensure it's a positive integer.
    if (isNaN(totalElementsCount) || totalElementsCount < 1) {
        globalThis.console.error("Error: The specified initial element count is invalid or non-positive.");
        return;
    }

    // Initialize the primary data structure, an array, to hold our numerical sequence.
    // The array is sized to be 1-indexed, meaning `dataSequence[0]` is typically unused or
    // holds a sentinel value. In this case, it's set to 0 to match original behavior.
    const dataSequence = new Array(totalElementsCount + 1);
    dataSequence[0] = 0; // Initialize index 0 to 0, consistent with how the original code's `while` loop would leave it.

    // Populate the array such that each element at index `i` initially holds the value `i`.
    for (let currentElementIndex = 1; currentElementIndex <= totalElementsCount; currentElementIndex++) {
        dataSequence[currentElementIndex] = currentElementIndex;
    }

    // Process the instructions for swapping elements.
    // The original code skips the first instruction line (parsedInputLines[1]),
    // starting processing from parsedInputLines[2] onwards. This behavior is maintained.
    const swapInstructionFragments = parsedInputLines.slice(2);

    // Iterate over each instruction fragment to perform the required swaps.
    // The `forEach` method is used as the return value of the iteration is not relevant.
    swapInstructionFragments.forEach(function(instructionString) {
        const indexTokens = instructionString.split(',');

        // Validate that each instruction line contains exactly two comma-separated values.
        if (indexTokens.length !== 2) {
            globalThis.console.warn(`Warning: Skipping malformed instruction: "${instructionString}". Expected two indices.`);
            return; // Skip this malformed line and proceed to the next.
        }

        // Parse the two indices from the instruction string.
        const firstSwapIndex = parseInt(indexTokens[0], 10);
        const secondSwapIndex = parseInt(indexTokens[1], 10);

        // Validate that both parsed indices are valid numbers and fall within the bounds of our array.
        if (isNaN(firstSwapIndex) || isNaN(secondSwapIndex) ||
            firstSwapIndex < 1 || firstSwapIndex > totalElementsCount ||
            secondSwapIndex < 1 || secondSwapIndex > totalElementsCount) {
            globalThis.console.warn(`Warning: Skipping instruction with out-of-bounds or invalid indices: "${instructionString}".`);
            return; // Skip this invalid instruction.
        }

        // Perform the swap operation using a temporary variable.
        // This is a standard and clear way to exchange two values.
        const temporaryHolder = dataSequence[firstSwapIndex];
        dataSequence[firstSwapIndex] = dataSequence[secondSwapIndex];
        dataSequence[secondSwapIndex] = temporaryHolder;
    });

    // Prepare the final sequence for output.
    // Only elements from index 1 onwards are considered, matching typical problem requirements
    // for 1-based indexing output.
    const finalOutputSequence = dataSequence.slice(1);

    // If there are elements to display, print each one on a new line.
    if (finalOutputSequence.length > 0) {
        finalOutputSequence.forEach(function(valueToPrint) {
            globalThis.console.log(valueToPrint);
        });
    } else {
        // This case should ideally not be reached if initial count is positive,
        // but included for robustness.
        globalThis.console.warn("No elements were generated for final display.");
    }

// Ensure the standard input stream continues to listen for incoming data.
}).resume();