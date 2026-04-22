const fileSystem = require("fs");

/**
 * Processes a given data stream to calculate a combinatorial product.
 * This function handles input parsing, iterative calculations, and state management
 * for a specific problem pattern involving slot assignments.
 * @param {string} rawInputContent - The raw string content read from the input source.
 */
function processDataStream(rawInputContent) {
    // Define a mathematical constant for modulo operations to prevent integer overflow.
    const MODULO_CONSTANT = 1000000007; // Equivalent to 1e+9 + 7

    // The number of conceptual "slots" or categories being managed.
    const NUMBER_OF_SLOTS = 3;

    // Implement a basic guard clause to validate the presence and type of the input content.
    if (!rawInputContent || typeof rawInputContent !== 'string') {
        console.error("Error: Invalid or empty input content provided. Cannot proceed.");
        return; // Exit the function if input is not suitable.
    }

    // Parse the raw input string into a structured array of arrays.
    // First, trim any extraneous whitespace, then split by newlines,
    // and finally, split each resulting line by spaces.
    const parsedInputLines = rawInputContent.trim().split("\n").map(lineSegment => lineSegment.split(" "));

    // Extract the total number of elements from the first line of input.
    // This value, typically 'N', dictates the length of the sequence to process.
    const sequenceLength = parseInt(parsedInputLines[0][0], 10);

    // Validate the extracted sequence length to ensure it's a positive integer.
    if (isNaN(sequenceLength) || sequenceLength < 1) {
        console.error("Error: Invalid sequence length specified in input. Must be a positive integer.");
        return; // Terminate if the sequence length is invalid.
    }

    // Initialize the state array, which represents the current 'requirement' or 'value'
    // for each of the three conceptual slots. The initial state [1, 0, 0] is problem-specific.
    let requiredSlotValues = [1, 0, 0];

    // Initialize the accumulator for the final product. The starting value of 3
    // is often a base factor or represents initial possibilities in the problem context.
    let finalProductAccumulator = NUMBER_OF_SLOTS;

    // For convenience and readability, store the second line of input (containing the sequence data)
    // in a dedicated variable.
    const dataSequenceRow = parsedInputLines[1];

    // Begin iterating through the sequence elements, starting from the second element (index 1).
    // The problem's logic implies the first element is implicitly accounted for by the initial accumulator.
    for (let iterationIndex = 1; iterationIndex < sequenceLength; iterationIndex++) {
        // Extract and convert the current element's value from the sequence to an integer.
        const currentSequenceElement = parseInt(dataSequenceRow[iterationIndex], 10);

        // Add a validation step for the current sequence element. If it's not a number,
        // log a warning and skip to the next element to prevent calculation errors.
        if (isNaN(currentSequenceElement)) {
            console.warn(`Warning: Non-numeric element encountered at index ${iterationIndex}. This element will be skipped.`);
            continue; // Proceed to the next iteration.
        }

        // Calculate the number of slots whose current requirement matches the current sequence element.
        // This is achieved using the 'reduce' method for a more functional and concise approach.
        let availableMatches = requiredSlotValues.reduce((count, requiredVal) => {
            return count + (requiredVal === currentSequenceElement ? 1 : 0);
        }, 0);

        // Implement an early exit optimization: if no slots match the current element,
        // the cumulative product will become zero and remain zero for all subsequent steps.
        if (availableMatches === 0) {
            finalProductAccumulator = 0; // Set the product to zero.
            break; // Exit the loop as the final result is determined.
        }

        // Update the cumulative product by multiplying it with the number of available matches.
        // The modulo operation is applied immediately to keep the number within manageable bounds
        // and prevent JavaScript's number precision issues with very large integers.
        finalProductAccumulator = (finalProductAccumulator * availableMatches) % MODULO_CONSTANT;

        // Identify the index of the first slot whose requirement value matches the current sequence element.
        const firstMatchingSlotIndex = requiredSlotValues.findIndex(
            (slotRequirement) => slotRequirement === currentSequenceElement
        );

        // After finding a match, increment the required value for that specific slot.
        // This simulates an update to the slot's state, indicating it now expects the next value in its sequence.
        // A robustness check ensures that a match was indeed found, though 'availableMatches > 0' implies it should be.
        if (firstMatchingSlotIndex !== -1) {
            requiredSlotValues[firstMatchingSlotIndex]++;
        } else {
            // This 'else' branch should ideally not be executed if 'availableMatches' was greater than 0.
            // It serves as a defensive programming measure.
            console.warn(`Internal Logic Anomaly: A matching slot was expected but not found for element ${currentSequenceElement}.`);
        }
    }

    // Output the final computed product to the console.
    console.log(finalProductAccumulator);
}

// The entry point for the script: read data from standard input and pass it to the processing function.
// The input is read as a buffer and explicitly converted to a UTF-8 string.
processDataStream(fileSystem.readFileSync("/dev/stdin", "utf8").toString());