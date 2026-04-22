// This program simulates a series of card stack manipulation games.
// Each game involves an initial setup of cards and a sequence of operations
// to rearrange the deck. The final state's top card is then reported.

// Utility function to safely parse a line of text containing space-separated numbers.
// It handles potential empty lines or non-numeric input gracefully.
const extractNumericValuesFromLine = (textLine) => {
    // Ensure the input is treated as a string and remove any leading/trailing whitespace.
    const cleanedLine = String(textLine || '').trim();
    // If the line is empty after trimming, return an empty array to prevent errors.
    if (cleanedLine.length === 0) {
        return [];
    }
    // Split the line by spaces, then convert each resulting string segment to a number.
    // `Number()` constructor is used for explicit type conversion.
    return cleanedLine.split(' ').map(Number);
};

// Begin by reading the entire standard input stream synchronously.
// This is typical for competitive programming environments where input is provided in a single block.
const rawInputStreamContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Pre-process the entire input content into an array of individual instruction lines.
// 1. Remove any leading/trailing whitespace from the whole input block.
// 2. Split the block into an array where each element is a line of text.
// 3. Filter out any lines that are empty after trimming, ensuring only meaningful lines are processed.
let availableInstructionLines = rawInputStreamContent
    .trim()
    .split('\n')
    .filter(line => line.trim().length > 0);

// Main loop to process multiple card game scenarios.
// The loop continues indefinitely until a specific termination condition is met.
gameSessionLoop: while (true) {
    // Defensive check: If there are no more instruction lines, it indicates an unexpected end of input.
    if (availableInstructionLines.length === 0) {
        console.warn("Input stream exhausted prematurely. Terminating game processing.");
        break gameSessionLoop; // Exit the main loop if no more input.
    }

    // Retrieve and parse the first line for the current game's configuration.
    // This line typically contains the total number of cards (N) and the number of operations (M).
    const currentScenarioConfig = extractNumericValuesFromLine(availableInstructionLines.shift());

    // Use array destructuring for clear variable assignment of configuration parameters.
    // `numInitialCards`: The count of cards to start with in this game.
    // `numShuffleOperations`: The total number of rearrangement operations to perform.
    const [numInitialCards, numShuffleOperations] = currentScenarioConfig;

    // Check for the global termination signal: N=0 and M=0.
    // This pair of values indicates that there are no more games to process.
    if (numInitialCards === 0 && numShuffleOperations === 0) {
        break gameSessionLoop; // Exit the main game processing loop.
    }

    // Initialize the card deck for the current game.
    // The cards are numbered from `numInitialCards` down to 1, representing their initial order.
    // `Array.from` provides a concise way to create this sequence.
    const currentDeckState = Array.from({ length: numInitialCards }, (_, index) => numInitialCards - index);

    // Iterate through each shuffling operation specified for the current game.
    for (let operationIndex = 0; operationIndex < numShuffleOperations; operationIndex++) {
        // Defensive check: Ensure there's an operation line available before attempting to read it.
        if (availableInstructionLines.length === 0) {
            console.error("Error: Ran out of operation instructions before completing the current game. Input might be malformed.");
            break; // Break the inner loop for operations if input is missing.
        }

        // Parse the details for the current card manipulation operation.
        // `cutPointOneBased`: The 1-indexed position from the top where the deck is cut.
        // `segmentToMoveSize`: The number of cards, starting from `cutPointOneBased`, to move to the top.
        const operationSpecifics = extractNumericValuesFromLine(availableInstructionLines.shift());

        // Basic validation for parsed operation details.
        // Ensure two integer values are provided for a valid cut operation.
        if (operationSpecifics.length < 2 || !Number.isInteger(operationSpecifics[0]) || !Number.isInteger(operationSpecifics[1])) {
            console.error(`Invalid operation details detected: [${operationSpecifics}]. Skipping this specific operation.`);
            continue; // Skip to the next operation if the current one is malformed.
        }

        const cutPointOneBased = operationSpecifics[0];
        const segmentToMoveSize = operationSpecifics[1];

        // Convert the 1-based cut position to a 0-based array index, which JavaScript arrays use.
        const cutIndexZeroBased = cutPointOneBased - 1;

        // More robust validation: check if the cut parameters are within the bounds of the current deck.
        // An invalid cut could lead to unexpected behavior or errors.
        if (cutIndexZeroBased < 0 || cutIndexZeroBased >= currentDeckState.length ||
            segmentToMoveSize <= 0 || (cutIndexZeroBased + segmentToMoveSize > currentDeckState.length)) {
            console.error(`Invalid cut parameters (P=${cutPointOneBased}, C=${segmentToMoveSize}) for a deck of size ${currentDeckState.length}. Skipping this operation.`);
            continue; // Skip the operation if parameters are out of bounds.
        }

        // Divide the `currentDeckState` into three distinct logical segments based on the operation:
        // 1. `initialTopSegment`: Cards from the very top of the deck up to the cut point.
        const initialTopSegment = currentDeckState.slice(0, cutIndexZeroBased);
        // 2. `cardsToRelocate`: The specific segment of cards that will be moved to the new top.
        const cardsToRelocate = currentDeckState.slice(cutIndexZeroBased, cutIndexZeroBased + segmentToMoveSize);
        // 3. `remainingBottomSegment`: All cards that remain below the `cardsToRelocate` segment.
        const remainingBottomSegment = currentDeckState.slice(cutIndexZeroBased + segmentToMoveSize);

        // Reconstruct the deck in its new order:
        // The `cardsToRelocate` segment goes to the absolute top.
        // It is then followed by the `initialTopSegment`.
        // Finally, the `remainingBottomSegment` is appended at the very end.
        // The spread syntax (`...`) is used for concise array concatenation.
        currentDeckState.splice(0, currentDeckState.length, ...cardsToRelocate, ...initialTopSegment, ...remainingBottomSegment);
    }

    // After all operations for the current game are completed,
    // output the value of the card that is now at the very top of the deck.
    // Include a check to ensure the deck isn't unexpectedly empty.
    if (currentDeckState.length > 0) {
        console.log(currentDeckState[0]);
    } else {
        // This scenario would typically indicate a serious logical error in the operations
        // or severely malformed input that led to an empty deck.
        console.error("Critical Error: The card deck became empty during operations. Cannot determine the top card.");
        console.log("0"); // Output a placeholder or error value if the deck is empty.
    }
}

// The program has finished processing all game scenarios.