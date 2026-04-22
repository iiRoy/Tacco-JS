var dataBuffer = ''; // Buffer to accumulate incoming standard input.
process.stdin.resume(); // Ensure the standard input stream remains open.
process.stdin.setEncoding('utf8'); // Set the character encoding for input.
process.stdin.on('data', function (dataSegment) { // Event listener for data chunks.
    dataBuffer += dataSegment; // Append the received data part to the buffer.
});
process.stdin.on('end', function () { // Event listener for the end of input.
    processInputData(dataBuffer.split('\n')); // Process the complete input, split by newlines.
});

function processInputData(lineArray) {
    var indexer, temporaryData, initialObjects, gridMatrix, actionCount, actionSequence = []; // Declare working variables.

    while ((initialObjects = +lineArray.shift()) !== 0) { // Loop as long as there are objects to process (initialObjects not zero).
        gridMatrix = new Array(441); // Initialize a 21x21 grid (441 cells).
        for (indexer = 0; indexer < 441; indexer++) { // Populate the grid with default empty values.
            gridMatrix[indexer] = 0;
        }

        indexer = 0; // Reset counter for object placement.
        while (indexer < initialObjects) { // Place all initial objects onto the grid.
            temporaryData = lineArray.shift().split(' '); // Read object coordinates.
            gridMatrix[(+temporaryData[0]) + 21 * (+temporaryData[1])] = 1; // Mark object's position on the grid.
            indexer++; // Move to the next object.
        }

        actionCount = +lineArray.shift(); // Get the total number of actions to perform.
        indexer = 0; // Reset counter for actions.
        while (indexer < actionCount) { // Read all specified actions.
            temporaryData = lineArray.shift().split(' '); // Parse action details (direction and length).
            actionSequence.push({ directionCode: temporaryData[0], lengthValue: +temporaryData[1] }); // Store the action.
            indexer++; // Proceed to the next action.
        }

        // After processing all objects and actions for the current scenario, evaluate the outcome.
        checkAllObjectsCollected(gridMatrix, actionSequence) ? console.log('Yes') : console.log('No'); // Output result based on object collection status.
    }
}

function checkAllObjectsCollected(gridMatrix, actionSequence) {
    var currentPosition = 10 + 210, indexer, movementOffset; // Initialize robot's starting position and declare variables.

    actionSequence.forEach(function (currentAction) { // Iterate through each planned action.
        switch (currentAction.directionCode) { // Determine movement based on direction.
            case 'N': // North direction.
                movementOffset = 21;
                break;
            case 'W': // West direction.
                movementOffset = -1;
                break;
            case 'E': // East direction.
                movementOffset = 1;
                break;
            case 'S': // South direction.
                movementOffset = -21;
                break;
        }
        for (indexer = 0; indexer < currentAction.lengthValue; indexer++) { // Perform the movement for the specified length.
            currentPosition += movementOffset; // Update robot's position.
            gridMatrix[currentPosition] = 0; // Clear the object at the new position.
        }
    });

    for (indexer = 0; indexer < 441; indexer++) { // After all actions, check the entire grid for remaining objects.
        if (gridMatrix[indexer] === 1) { // If any object (marked '1') is found.
            return false; // Not all objects were collected.
        }
    }
    return true; // All objects were successfully collected.
}