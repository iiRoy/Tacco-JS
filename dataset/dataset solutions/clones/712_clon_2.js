var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var lineSegments = (rawData.trim()).split("\n"); // Split input into lines, removing leading/trailing whitespace

// Main simulation loop
while (true) {
    // Get the next line, which should contain N and P
    var currentPair = lineSegments.shift();

    // Check for termination condition
    if (currentPair === "0 0") {
        break; // Exit the loop if "0 0" is encountered
    }

    // Parse N and P from the current line
    currentPair = currentPair.split(" ").map(Number);
    var playerCount = currentPair[0]; // N: Number of players
    var initialStones = currentPair[1]; // P: Initial number of stones

    // Initialize an array to hold stones for each player
    var playerStones = [];
    for (var loopCounter = 0; loopCounter < playerCount; loopCounter++) {
        playerStones.push(0); // Each player starts with 0 stones
    }

    var currentPlayerIndex = 0; // Index of the current player
    // Simulate the game for a large number of turns to find the winner
    for (var loopCounter = 0; loopCounter < 1000000; loopCounter++) {
        // Wrap around player index if it exceeds the number of players
        if (currentPlayerIndex === playerStones.length) {
            currentPlayerIndex = 0;
        }

        // Check if there are stones to distribute
        if (initialStones > 0) {
            initialStones--; // Decrement the global stone count
            playerStones[currentPlayerIndex]++; // Give one stone to the current player

            // If global stones become zero, check for a winner
            if (initialStones === 0) {
                // Calculate the sum of stones held by all players except the current one
                var totalStones = playerStones.reduce(function(accumulator, currentValue) {
                    return accumulator + currentValue;
                });
                // If the current player holds all the stones, they are the winner
                if (totalStones - playerStones[currentPlayerIndex] === 0) {
                    console.log(currentPlayerIndex); // Output the winning player's index
                    break; // End the simulation for this game
                }
            }
        } else {
            // If global stones are zero, the current player contributes their stones
            initialStones = playerStones[currentPlayerIndex]; // Take all stones from the current player
            playerStones[currentPlayerIndex] = 0; // Current player now has 0 stones
        }
        currentPlayerIndex++; // Move to the next player
    }
}
