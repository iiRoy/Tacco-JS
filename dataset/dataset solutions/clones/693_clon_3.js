function processCardGameRounds(gameDataString) {
    // Divide the comprehensive game input into individual lines for sequential processing.
    const instructionLines = gameDataString.split("\n");
    let currentLinePointer = 0; // Tracks the current line being read from the instructionLines array.

    /**
     * Facilitates parsing a string line containing space-separated numeric values.
     * @param {string} lineContent - The string line to be parsed.
     * @returns {number[]} An array where each element is a parsed integer.
     *         Returns [NaN, NaN] if the line is empty or invalid, indicating a parsing issue.
     */
    const parseNumericLine = (lineContent) => {
        // Guard against empty or whitespace-only lines to prevent errors.
        if (!lineContent || lineContent.trim() === '') {
            return [NaN, NaN];
        }
        // Split the line by spaces and convert each part to a number.
        return lineContent.split(" ").map(Number);
    };

    // The core loop iterates through each distinct game scenario provided in the input.
    // This loop will continue indefinitely until a specific termination signal is encountered.
    while (true) {
        // Precautionary check: Ensure the line pointer doesn't exceed the available instructions.
        if (currentLinePointer >= instructionLines.length) {
            // This indicates an unexpected end of the input stream.
            break;
        }

        // Extract the primary parameters for the current game round: total cards and number of operations.
        const [deckSize, operationCount] = parseNumericLine(instructionLines[currentLinePointer]);

        // Robustness check: Verify that the parsed values are indeed valid numbers.
        if (isNaN(deckSize) || isNaN(operationCount)) {
            // If parsing fails, it suggests malformed input or an unexpected end. Terminate gracefully.
            break;
        }

        // The specific termination condition for the entire program, as defined by the problem.
        if (deckSize === 0 && operationCount === 0) {
            break;
        }

        // Advance the pointer to the next line, preparing for the card operation details.
        currentLinePointer++;

        // Initialize the playing deck. Cards are ordered from the largest number (deckSize) down to 1.
        // We use 0-based indexing for the array, so `cardPile[0]` will represent the top card.
        let cardPile = [];
        for (let cardIdx = 0; cardIdx < deckSize; cardIdx++) {
            cardPile.push(deckSize - cardIdx);
        }

        // Execute each card manipulation operation for the current game scenario.
        for (let currentOperation = 0; currentOperation < operationCount; currentOperation++) {
            // Another safety check: Ensure there are sufficient lines for operation parameters.
            if (currentLinePointer >= instructionLines.length) {
                // Abrupt end of input during operations.
                break;
            }

            // Parse the parameters for the current operation: `cutPosition` and `segmentLength`.
            // `cutPosition` (equivalent to original 'p') is 1-based, indicating how many cards from the top
            // are involved in the first segment that gets moved to the bottom.
            // `segmentLength` (equivalent to original 'c') is the number of cards that will become the new top.
            const [cutPosition, segmentLength] = parseNumericLine(instructionLines[currentLinePointer]);

            // Validate the operation parameters to prevent out-of-bounds access or logical errors.
            if (isNaN(cutPosition) || isNaN(segmentLength) || cutPosition < 1 || segmentLength < 1 ||
                (cutPosition - 1 + segmentLength) > deckSize) {
                // Log an error for invalid parameters and skip this specific operation.
                console.error(`Invalid operation parameters detected (p=${cutPosition}, c=${segmentLength}). Skipping operation.`);
                currentLinePointer++;
                continue;
            }

            // Move the pointer to the next line for the subsequent operation or game setup.
            currentLinePointer++;

            // --- Advanced Card Manipulation Logic (Structural Rewrite) ---
            // This section reinterprets the original card rearrangement using modern JavaScript array methods.
            // The operation moves the top (cutPosition - 1) cards to a temporary location,
            // then brings the next 'segmentLength' cards to the very top,
            // and finally places the temporarily held cards directly beneath these new top cards.

            // Calculate the total number of cards from the top of the deck that are subject to rearrangement.
            // This includes the segment that moves to the bottom and the segment that moves to the top.
            const totalCardsAffectedFromTop = (cutPosition - 1) + segmentLength;

            // 1. Identify the 'A' segment: These are the cards that are moved aside from the very top.
            //    They will eventually be placed below the 'newTopSegment'.
            const topSegmentToMoveAside = cardPile.slice(0, cutPosition - 1);

            // 2. Identify the 'B' segment: These are the cards that will form the new top of the deck.
            //    They are located immediately after 'topSegmentToMoveAside' in the original deck.
            const newTopSegment = cardPile.slice(cutPosition - 1, totalCardsAffectedFromTop);

            // 3. Identify the 'C' segment: These are the cards at the bottom of the deck that remain untouched
            //    by this specific rearrangement operation.
            const unaffectedBottomSegment = cardPile.slice(totalCardsAffectedFromTop);

            // Reconstruct the `cardPile` by concatenating the segments in their new order.
            // The `newTopSegment` comes first, followed by `topSegmentToMoveAside`,
            // and finally `unaffectedBottomSegment`.
            cardPile = [...newTopSegment, ...topSegmentToMoveAside, ...unaffectedBottomSegment];
        }

        // After completing all operations for the current round, display the value of the card
        // that is now at the very top of the deck (which corresponds to index 0).
        console.log(cardPile[0]);
    }
}

// The entry point for the program execution. It reads the entire input from standard input
// (typically a file in competitive programming contexts) as a UTF-8 string,
// and then passes this string to the main processing function.
processCardGameRounds(require("fs").readFileSync("/dev/stdin", "utf8"));