process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event listener for incoming data from standard input.
// When data arrives, it's processed by the primary function.
process.stdin.on('data', function(receivedInputBlock) {
    // Ensure the input string is clean before processing.
    const trimmedInput = receivedInputBlock.trim();
    if (trimmedInput.length === 0) {
        // Optionally handle empty input scenario
        // console.error("Received empty input block. Skipping processing.");
        return;
    }
    processInputSequence(trimmedInput);
});

/**
 * Main function to process the input block, perform permutations, and output the result.
 * This function simulates a "ladder game" or permutation sequence based on given instructions.
 * @param {string} rawInputContent The complete string received from standard input.
 */
function processInputSequence(rawInputContent) {
    // Split the entire input content into individual lines.
    const inputLineSegments = rawInputContent.split("\n");

    // Helper function to safely parse an integer from a string.
    const getNumericValue = (strVal, defaultVal = 0) => {
        const parsed = parseInt(strVal, 10);
        return isNaN(parsed) ? defaultVal : parsed;
    };

    // Extract the initial array size (width of the ladder).
    const ladderWidth = getNumericValue(inputLineSegments[0]);

    // Extract the total number of swap operations to perform.
    const exchangeCount = getNumericValue(inputLineSegments[1]);

    // Validate the primary parameters.
    if (ladderWidth <= 0 || exchangeCount < 0 || inputLineSegments.length < (2 + exchangeCount)) {
        console.error("Invalid input parameters or insufficient lines for swaps.");
        // We could throw an error or exit here in a real application.
        return;
    }

    // Initialize the main array with sequential numbers from 1 to ladderWidth.
    // This represents the initial state of the items on the ladder.
    const currentPermutation = Array.from({ length: ladderWidth }, (_, k) => k + 1);

    // Pointer to keep track of the current line being processed for swap instructions.
    // Swap instructions start from the third line (index 2).
    let currentLinePointer = 2;

    // Iterate through each specified exchange operation.
    for (let swapOperationIndex = 0; swapOperationIndex < exchangeCount; swapOperationIndex++) {
        // Retrieve the current line containing the swap instruction.
        const currentSwapInstructionLine = inputLineSegments[currentLinePointer];

        // Ensure the instruction line is valid before proceeding.
        if (!currentSwapInstructionLine) {
            console.error(`Missing swap instruction at line ${currentLinePointer}. Aborting.`);
            return;
        }

        // Split the instruction line by comma to get the two positions to swap.
        const positionStrings = currentSwapInstructionLine.split(",");

        // Parse the 1-based positions and convert them to 0-based array indices.
        const firstPositionIndex = getNumericValue(positionStrings[0]) - 1;
        const secondPositionIndex = getNumericValue(positionStrings[1]) - 1;

        // Perform basic bounds checking for the indices.
        if (firstPositionIndex < 0 || firstPositionIndex >= ladderWidth ||
            secondPositionIndex < 0 || secondPositionIndex >= ladderWidth) {
            console.error(`Invalid swap indices (${firstPositionIndex + 1}, ${secondPositionIndex + 1}) at line ${currentLinePointer}. Skipping this swap.`);
            currentLinePointer++; // Still advance the pointer to avoid infinite loop on bad data
            continue;
        }

        // Execute the swap using array destructuring assignment for conciseness.
        [currentPermutation[firstPositionIndex], currentPermutation[secondPositionIndex]] =
        [currentPermutation[secondPositionIndex], currentPermutation[firstPositionIndex]];

        // Move the pointer to the next instruction line.
        currentLinePointer++;
    }

    // Output the final state of the permutation array, each element on a new line.
    // Joining the array elements with newline characters allows a single console.log call.
    console.log(currentPermutation.join('\n'));
}