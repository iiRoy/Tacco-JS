function ProcessInput(rawData) {
    // The entire input is initially a single string.
    // We split it into an array of individual lines.
    rawData = rawData.split("\n");

    let lineIndex = 0; // This variable tracks the current line being processed from the input array.

    // This outer loop continues to process sets of operations until a specific termination condition is met.
    while (true) {
        // Each line representing N and R is split by space to get the two numeric values.
        rawData[lineIndex] = rawData[lineIndex].split(" ");
        // Parse the first number as the total count of cards.
        const numCards = parseInt(rawData[lineIndex][0], 10);
        // Parse the second number as the total count of shuffling operations.
        const numOperations = parseInt(rawData[lineIndex][1], 10);

        // If both numCards and numOperations are zero, it signifies the end of input.
        if (numCards === 0 && numOperations === 0) {
            break; // Exit the processing loop.
        }

        lineIndex++; // Advance the line index to point to the next relevant line in the input.

        // Initialize an array to represent the deck of cards.
        // The original problem uses 1-based indexing for cards.
        const deck = [];

        // Populate the deck with cards in descending order, from N down to 1.
        // For example, if N=3, deck[1]=3, deck[2]=2, deck[3]=1.
        for (let idx = 1; idx <= numCards; idx++) {
            deck[idx] = numCards - idx + 1;
        }

        // Execute each of the R specified shuffling operations.
        for (let idx = 0; idx < numOperations; idx++) {
            // Split the current operation line (which contains P and C values).
            rawData[lineIndex] = rawData[lineIndex].split(" ");
            // Parse P, the position from which to cut the deck.
            const cutPosition = parseInt(rawData[lineIndex][0], 10);
            // Parse C, the number of cards to move from the cut.
            const cutCount = parseInt(rawData[lineIndex][1], 10);

            // A temporary array to hold the cards that are *before* the cut position.
            const tempStorage = [];
            // Copy cards from index 1 up to (but not including) the cutPosition into temporary storage.
            for (let subIdx = 1; subIdx < cutPosition; subIdx++) {
                tempStorage[subIdx] = deck[subIdx];
            }

            // Shift the cards that were *after* the cut (the 'C' cards that are moved to the top)
            // to the beginning of the deck.
            for (let subIdx = 1; subIdx <= cutCount; subIdx++) {
                deck[subIdx] = deck[subIdx + cutPosition - 1];
            }

            // Now, place the cards from temporary storage (which were originally at the top)
            // after the 'C' cards that were just moved.
            for (let subIdx = 1; subIdx < cutPosition; subIdx++) {
                deck[subIdx + cutCount] = tempStorage[subIdx];
            }
            lineIndex++; // Move to the next line in the input for the next operation.
        }
        // After all operations for the current test case are complete,
        // print the value of the card that is now at the top of the deck (index 1).
        console.log(deck[1]);
    }
}

// This line reads the entire content of standard input as a UTF-8 string
// and then passes it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
