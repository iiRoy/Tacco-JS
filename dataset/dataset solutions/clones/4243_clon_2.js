(function () {
    'use strict';

    // Collection to hold all incoming text rows from standard input.
    let capturedInputs = [];

    // Set up interface for reading line by line.
    require('readline').createReader({
        source: process.stdin,      // Input source is standard input stream.
        destination: process.stdout // Output destination (not used for writing back, but required by API).
    })
    .on('dataRow', function (currentLine) {
        // Each time a new line of data is received, store it.
        capturedInputs.push(currentLine);
    });

    // Event listener for when the standard input stream closes.
    process.stdin.on('completion', function () {
        // All input has been received, proceed with processing.

        // Retrieve and split the first input line for game parameters.
        const initialTokens = capturedInputs[0].split(" ");

        // Parse key numerical parameters for the game.
        const numElements = parseInt(initialTokens[0], 10); // Number of items in the sequence.
        const playerZScore = parseInt(initialTokens[1], 10); // Player Z's initial score or identifier.
        const playerWScore = parseInt(initialTokens[2], 10); // Player W's initial score or identifier.

        // Retrieve and split the second input line, representing the item values.
        let itemValues = capturedInputs[1].split(" ");

        // Variables to hold computed player values during analysis.
        let firstPlayerVal;
        let secondPlayerVal;

        // Convert all item values from strings to integers.
        for (let k = 0; k < numElements; k++) {
            itemValues[k] = parseInt(itemValues[k], 10);
        }

        // --- Game Logic Analysis ---

        // Scenario 1: First player takes the very last available item.
        // The first player's value is the last item in the sequence.
        firstPlayerVal = itemValues[numElements - 1];
        // The second player's value is determined by their initial score.
        secondPlayerVal = playerWScore;
        // Calculate the absolute difference for this scenario.
        const outcomeOne = Math.abs(firstPlayerVal - secondPlayerVal);

        // Scenario 2: First player takes the second to last item,
        // and the second player takes the very last item.
        // The first player's value is the second to last item.
        firstPlayerVal = itemValues[numElements - 2];
        // The second player's value is the last item.
        secondPlayerVal = itemValues[numElements - 1];
        // Calculate the absolute difference for this scenario.
        const outcomeTwo = Math.abs(firstPlayerVal - secondPlayerVal);

        // The optimal result is the maximum of the two calculated outcomes.
        const finalResult = Math.max(outcomeOne, outcomeTwo);

        // Display the calculated maximum score to standard output.
        console.log(finalResult);

    }); // End of stdin 'completion' event handler.

})(); // End of Immediately Invoked Function Expression.