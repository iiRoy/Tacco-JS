function ProcessGameData(incomingData) {
    // The incoming raw text data is split into an array of individual lines.
    incomingData = incomingData.split("\n");

    // Initialize an index to keep track of the current line being processed from the input array.
    var currentLinePointer = 0;

    // Start an indefinite loop that will continue processing data sets until a specific termination condition is met.
    while (true) {
        // Take the current line from the input and split it by spaces to get individual values.
        incomingData[currentLinePointer] = incomingData[currentLinePointer].split(" ");

        // Parse the first value on the line as an integer, representing the total number of cards in the deck.
        var totalCardCount = parseInt(incomingData[currentLinePointer][0], 10);
        // Parse the second value on the line as an integer, indicating the total number of shuffle operations to perform.
        var totalShuffleOperations = parseInt(incomingData[currentLinePointer][1], 10);

        // Check if both the card count and operation count are zero. This is the signal to terminate the program.
        if (totalCardCount === 0 && totalShuffleOperations === 0) {
            // If the termination condition is met, exit the main processing loop.
            break;
        }

        // Increment the line pointer to move to the next line in the input for subsequent data.
        currentLinePointer++;

        // Declare an array that will represent the deck of cards for the current game scenario.
        var cardDeck = [];

        // Populate the card deck. Cards are numbered from 1 to totalCardCount, but arranged in descending order.
        // For example, if totalCardCount is 3, cardDeck[1] will be 3, cardDeck[2] will be 2, cardDeck[3] will be 1.
        for (
            var deckInitializationIndex = 1;
            deckInitializationIndex <= totalCardCount;
            deckInitializationIndex++
        ) {
            cardDeck[deckInitializationIndex] = totalCardCount - deckInitializationIndex + 1;
        }

        // Begin a loop to execute each of the specified shuffle operations.
        for (
            var operationExecutionIndex = 0;
            operationExecutionIndex < totalShuffleOperations;
            operationExecutionIndex++
        ) {
            // Process the line of input that describes the current shuffle operation.
            incomingData[currentLinePointer] = incomingData[currentLinePointer].split(" ");

            // Extract the 'p' value: the position from which to cut the deck.
            var cutPosition = parseInt(incomingData[currentLinePointer][0], 10);
            // Extract the 'c' value: the number of cards to move from the cut section to the bottom.
            var cardsToMoveCount = parseInt(incomingData[currentLinePointer][1], 10);

            // Create a temporary holding array to store a segment of the deck during the shuffle.
            var temporaryHoldingArray = [];

            // Copy cards from the top part of the deck (before the cutPosition) into the temporary array.
            for (
                var copyToTempIndex = 1;
                copyToTempIndex < cutPosition;
                copyToTempIndex++
            ) {
                temporaryHoldingArray[copyToTempIndex] = cardDeck[copyToTempIndex];
            }

            // Shift the cards that were *after* the cutPosition, and up to `cardsToMoveCount` cards,
            // to the new top of the deck.
            for (
                var shiftDeckIndex = 1;
                shiftDeckIndex <= cardsToMoveCount;
                shiftDeckIndex++
            ) {
                cardDeck[shiftDeckIndex] = cardDeck[shiftDeckIndex + cutPosition - 1];
            }

            // Re-insert the cards from the temporary holding array back into the deck,
            // placing them after the newly shifted section.
            for (
                var reinsertFromTempIndex = 1;
                reinsertFromTempIndex < cutPosition;
                reinsertFromTempIndex++
            ) {
                cardDeck[reinsertFromTempIndex + cardsToMoveCount] = temporaryHoldingArray[reinsertFromTempIndex];
            }

            // Advance the input line pointer to prepare for the next operation or scenario.
            currentLinePointer++;
        }

        // After all shuffle operations for the current scenario are complete,
        // output the value of the card that is now at the very top of the deck (index 1).
        console.log(cardDeck[1]);
    }
}

// Call the primary processing function, feeding it data read synchronously from standard input.
ProcessGameData(require("fs").readFileSync("/dev/stdin", "utf8"));