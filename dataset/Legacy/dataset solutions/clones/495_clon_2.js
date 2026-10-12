var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the entire input into an array of lines, removing any trailing newline.
var lineData = rawData.trim().split("\n");

// Main processing loop: continues until a specific termination condition is met.
while (true) {
    // Extract the first line, split by space, and convert to numbers.
    var params = lineData.shift().split(" ").map(Number);

    // Check for the termination condition: "0 0 0".
    if (params.join(" ") === "0 0 0") {
        break; // Exit the loop if the termination sequence is found.
    }

    // Assign parameters from the current line to descriptive variables.
    var paramX = params[0]; // Represents 'x' in the original problem context.
    var paramY = params[1]; // Represents 'y' in the original problem context.
    var paramZ = params[2]; // Represents 'z' in the original problem context.

    // Get the next line of values, split by space, and convert to numbers.
    var valuesV = lineData.shift().split(" ").map(Number);

    // Initialize an array to store special event configurations.
    var specialEvents = [];

    // Populate the specialEvents array based on 'paramZ' lines.
    for (var idxA = 0; idxA < paramZ; idxA++) {
        var eventDetails = lineData.shift().split(" ").map(Number);
        // Store event type and amount at the specified index.
        specialEvents[eventDetails[0]] = [eventDetails[1], eventDetails[2]];
    }

    // Initialize a 2D array (dynamic programming matrix) for probabilities.
    var probabilityMatrix = [];
    for (var idxA = 0; idxA <= paramY; idxA++) {
        probabilityMatrix[idxA] = [];
        for (var idxC = 0; idxC <= 5000; idxC++) {
            probabilityMatrix[idxA][idxC] = 0; // Initialize all probabilities to zero.
        }
    }

    // Set the initial state: probability of 1 at (0, 0).
    probabilityMatrix[0][0] = 1;

    // Iterate through possible states (from 0 to paramY-1).
    for (var idxA = 0; idxA < paramY; idxA++) {
        // Iterate through each of the 'paramX' possible moves.
        for (var idxB = 0; idxB < paramX; idxB++) {
            // Calculate the next state after applying the current move.
            var nextState = idxA + valuesV[idxB];
            // Ensure 'nextState' does not exceed 'paramY'.
            if (nextState > paramY) {
                nextState = paramY;
            }

            // Iterate through all possible 'k' values (up to 5000).
            for (var idxD = 0; idxD <= 5000; idxD++) {
                // Check if there's a special event at 'nextState'.
                if (specialEvents[nextState] !== undefined) {
                    var eventType = specialEvents[nextState][0];
                    var eventAmount = specialEvents[nextState][1];

                    // Apply event-specific logic.
                    if (eventType === 1) {
                        // Type 1 event: move forward by 'eventAmount'.
                        probabilityMatrix[nextState + eventAmount][idxD] += probabilityMatrix[idxA][idxD] / paramX;
                    } else if (eventType === 2) {
                        // Type 2 event: increase 'k' by 'eventAmount'.
                        probabilityMatrix[nextState][idxD + eventAmount] += probabilityMatrix[idxA][idxD] / paramX;
                    } else if (eventType === 3) {
                        // Type 3 event: decrease 'k' by 'eventAmount', but not below zero.
                        if (idxD - eventAmount < 0) {
                            eventAmount = idxD; // Adjust 'eventAmount' to prevent 'k' from going negative.
                        }
                        probabilityMatrix[nextState][idxD - eventAmount] += probabilityMatrix[idxA][idxD] / paramX;
                    }
                } else {
                    // No special event: simply transition to 'nextState' with current 'k'.
                    probabilityMatrix[nextState][idxD] += probabilityMatrix[idxA][idxD] / paramX;
                }
            }
        }
    }

    // Calculate the total expected value at the final state 'paramY'.
    var totalExpectedValue = 0;
    for (var idxA = 0; idxA <= 5000; idxA++) {
        totalExpectedValue += idxA * probabilityMatrix[paramY][idxA];
    }

    // Output the floor of the total expected value.
    console.log(Math.floor(totalExpectedValue));
}
