var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove leading/trailing whitespace and split into an array of lines.
var lineSegments = (rawData.trim()).split("\n");

// Main processing loop: continues until a specific termination condition is met.
while (true) {
    // Extract the next line from the input array, which contains problem parameters.
    var currentLine = lineSegments.shift();

    // Check if the current line signifies the end of input ("0 0").
    if (currentLine === "0 0") {
        break; // Exit the loop if termination condition is met.
    }

    // Parse the parameters from the current line: split by space and convert to numbers.
    var parsedValues = currentLine.split(" ").map(Number);
    var playerCount = parsedValues[0]; // The number of players in this round.
    var currentItems = parsedValues[1]; // The initial number of items.

    // Store the initial number of items for later comparison.
    var initialItems = currentItems;
    // Initialize an array to keep track of each player's score/items.
    var playerScores = [];

    // Populate the playerScores array with zeros, one for each player.
    for (var idx = 0; idx < playerCount; idx++) {
        playerScores.push(0);
    }

    // Initialize the index for the current player.
    var currentPlayerIndex = 0;

    // Simulation loop: runs for a maximum of 1,000,000 iterations to prevent infinite loops.
    for (var iterationCounter = 0; iterationCounter < 1000000; iterationCounter++) {
        // If the current player index exceeds the number of players, wrap it around to 0.
        if (currentPlayerIndex === playerScores.length) {
            currentPlayerIndex = 0;
        }

        // Check if there are items currently available to distribute.
        if (currentItems > 0) {
            // Decrement the available items and give one to the current player.
            currentItems--;
            playerScores[currentPlayerIndex]++;

            // Check for the winning condition: no items left and the current player has all initial items.
            if (currentItems === 0 && initialItems === playerScores[currentPlayerIndex]) {
                console.log(currentPlayerIndex); // Output the winning player's index.
                break; // End the simulation for this round.
            }
        } else {
            // If no items are available, the current player takes all their accumulated items.
            currentItems = playerScores[currentPlayerIndex];
            playerScores[currentPlayerIndex] = 0; // Reset the current player's score.
        }
        // Move to the next player for the next iteration.
        currentPlayerIndex++;
    }
}
