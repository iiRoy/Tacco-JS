let rawInputPayload = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (dataChunk) => {
    rawInputPayload += dataChunk;
});

process.stdin.on('end', () => {
    initiateSequenceProcessing(rawInputPayload.split(/\r?\n/));
});

/**
 * Executes the primary permutation adjustment logic.
 * This function identifies elements that are "fixed" in their 1-indexed position
 * and performs swaps to displace them, counting the total adjustments.
 * @param {string[]} inputLines - An array of strings, where each string is a line of input.
 */
function initiateSequenceProcessing(inputLines) {
    // Pre-validation: Ensure we have at least two lines for processing.
    if (!inputLines || inputLines.length < 2) {
        console.error("Error: Insufficient input lines provided for sequence processing.");
        return;
    }

    // Parse the array size from the first line.
    const sequenceLengthCandidate = parseInt(inputLines[0], 10);

    // Guard clause for invalid or non-positive sequence length.
    if (isNaN(sequenceLengthCandidate) || sequenceLengthCandidate <= 0) {
        console.error("Error: Invalid or non-positive sequence length detected. Must be an integer greater than 0.");
        return;
    }
    const sequenceLength = sequenceLengthCandidate; // Confirming the variable name after validation.

    // Extract and parse the numeric elements from the second line.
    // Using Array.prototype.map for a more functional and concise transformation (Type III change).
    const rawNumericStrings = inputLines[1].split(' ');
    const targetPermutation = rawNumericStrings.map(str => parseInt(str, 10));

    // Post-validation: Check if the parsed array's length matches the declared length.
    if (targetPermutation.length !== sequenceLength) {
        console.error(`Error: Mismatch between declared sequence length (${sequenceLength}) and actual parsed elements (${targetPermutation.length}).`);
        return;
    }
    // Post-validation: Check for any non-numeric values resulting from parsing.
    if (targetPermutation.some(isNaN)) {
        console.error("Error: Non-numeric values found in the input sequence after parsing.");
        return;
    }

    // Initialize a counter for the total number of element exchanges performed.
    let totalDisplacements = 0;

    // Iterate through the permutation to identify and correct "fixed" elements.
    for (let currentElementIndex = 0; currentElementIndex < sequenceLength; currentElementIndex++) {
        // Calculate the expected value if the element were in its "correct" 1-indexed position.
        const expectedValueForOneIndexing = currentElementIndex + 1;
        const currentElementValue = targetPermutation[currentElementIndex];

        // Check if the current element is indeed in its "fixed" position.
        if (currentElementValue === expectedValueForOneIndexing) {
            // An element is found in its "fixed" position, thus it must be displaced.

            // Determine the appropriate index for the swap:
            // If it's the very last element, swap with the element immediately preceding it.
            // Otherwise, swap with the element immediately succeeding it.
            const isLastElement = (currentElementIndex === sequenceLength - 1);
            let swapTargetIndex;

            if (isLastElement) {
                // Edge case: If the last element is fixed, swap it with the previous one.
                // This requires the sequence to have at least two elements.
                if (sequenceLength > 1) {
                    swapTargetIndex = currentElementIndex - 1;
                } else {
                    // If sequenceLength is 1 and the only element is "fixed", no valid swap can occur based on the problem's logic.
                    // We skip the swap and do not increment the count.
                    continue;
                }
            } else {
                // Standard case: Swap with the next element.
                swapTargetIndex = currentElementIndex + 1;
            }

            // Execute the element exchange and increment the total count.
            performElementExchange(targetPermutation, currentElementIndex, swapTargetIndex);
            totalDisplacements++;
        }
    }

    // Output the final count of necessary displacements.
    console.log(totalDisplacements);
}

/**
 * Utility function to swap two elements within a given array.
 * This implementation uses array destructuring for a more modern and concise swap (Type III change).
 * Includes basic index validation as a Type III addition to prevent errors.
 * @param {Array<any>} targetCollection - The array where elements will be swapped.
 * @param {number} sourceIndex - The index of the first element.
 * @param {number} destinationIndex - The index of the second element.
 */
function performElementExchange(targetCollection, sourceIndex, destinationIndex) {
    // Guard clauses to ensure indices are within valid bounds.
    if (sourceIndex < 0 || sourceIndex >= targetCollection.length ||
        destinationIndex < 0 || destinationIndex >= targetCollection.length) {
        console.warn(`Warning: Attempted to perform swap with out-of-bounds indices: [${sourceIndex}, ${destinationIndex}] for an array of length ${targetCollection.length}. Swap operation skipped.`);
        return; // Exit if indices are invalid.
    }

    // Perform the swap using array destructuring assignment.
    [targetCollection[sourceIndex], targetCollection[destinationIndex]] =
        [targetCollection[destinationIndex], targetCollection[sourceIndex]];
}