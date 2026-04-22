(function() {
    'use strict';

    // A temporary buffer to accumulate all incoming lines from standard input.
    let inputDataBuffer = [];

    // Establish a readline interface to handle input stream processing.
    const inputReader = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout // Required by the API, but not directly used for program output here.
    });

    // Register an event listener to capture each line as it's received.
    inputReader.on('line', (currentInputLine) => {
        inputDataBuffer.push(currentInputLine);
    });

    // Attach a handler for the 'end' event, which triggers when the input stream concludes.
    // All core application logic resides within this asynchronous callback.
    process.stdin.on('end', () => {

        // --- Input Processing and Initial Setup ---

        // Essential validation: Ensure that a minimum number of input lines are present.
        // The problem expects at least two lines: one for game parameters, one for card values.
        if (inputDataBuffer.length < 2) {
            // In a production environment, this might lead to an error or default behavior.
            // For competitive programming, input is typically guaranteed to be well-formed.
            return; // Terminate execution if input is insufficient.
        }

        // Parse the first line, which contains global game parameters.
        // It's expected to be space-separated integers, e.g., "N Z W".
        const parsedGameParameters = inputDataBuffer[0].split(' ').map(Number);

        // Extract named parameters for improved readability.
        const totalCardsInDeck = parsedGameParameters[0]; // Corresponds to original 'N'
        const playerZInitialState = parsedGameParameters[1]; // Corresponds to original 'Z', not utilized in this solution snippet.
        const playerWDecisionFactor = parsedGameParameters[2]; // Corresponds to original 'W'

        // Parse the second line, containing the sequence of card values.
        // This creates an array of numbers, e.g., "[card1, card2, ..., cardN]".
        const cardValueSequence = inputDataBuffer[1].split(' ').map(Number);

        // --- Core Game Strategy Analysis ---
        // The optimal strategy for this particular game structure often boils down to two key scenarios
        // concerning the last few cards.

        let highestCalculatedScore; // This variable will hold the final answer, corresponding to original 'ans'.

        // Scenario A: Player X is positioned to take the very last card in the sequence.
        // This scenario is always relevant provided there is at least one card left.
        if (totalCardsInDeck >= 1) {
            const finalCardValue = cardValueSequence[totalCardsInDeck - 1];
            // The score in this case is the absolute difference between the last card and Player W's reference value.
            const scoreIfXTakesLast = Math.abs(finalCardValue - playerWDecisionFactor);
            highestCalculatedScore = scoreIfXTakesLast; // Initialize with this potential outcome.
        } else {
            // Edge case: If no cards are available, the game score defaults to zero.
            highestCalculatedScore = 0;
        }

        // Scenario B: Player Y takes the second-to-last card.
        // This implies Player X would then take the very last card.
        // This scenario is only applicable if there are at least two cards remaining.
        if (totalCardsInDeck >= 2) {
            const penultimateCardValue = cardValueSequence[totalCardsInDeck - 2];
            const ultimateCardValue = cardValueSequence[totalCardsInDeck - 1];
            // The score here is the absolute difference between these two final cards.
            const scoreIfYTakesSecondLast = Math.abs(penultimateCardValue - ultimateCardValue);

            // Update the maximum score identified so far by comparing with the current scenario's outcome.
            highestCalculatedScore = Math.max(highestCalculatedScore, scoreIfYTakesSecondLast);
        }
        // If totalCardsInDeck was 0 or 1, Scenario B is bypassed, and highestCalculatedScore retains its value from Scenario A.

        // Output the final determined maximum achievable score to standard output.
        console.log(highestCalculatedScore);

    }); // End of the 'end' event handler.

})(); // End of the Immediately Invoked Function Expression (IIFE).