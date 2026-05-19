let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Acquire raw input data from standard input
let lineBuffer = rawData.trim().split("\n"); // Process raw input into an array of individual lines

while (true) { // Begin main processing loop for multiple test cases
    let dimensions = lineBuffer.shift().split(" "); // Extract the M (players) and N (rounds) values for the current scenario

    if (dimensions.join(" ") === "0 0") { // Check for the termination condition "0 0"
        break; // Exit the main loop if the termination signal is encountered
    }

    let playerCount = parseInt(dimensions[0], 10); // Convert the first dimension to an integer for player count
    let roundCount = parseInt(dimensions[1], 10); // Convert the second dimension to an integer for round count

    let playerStatus = []; // Initialize an array to keep track of each player's active status

    for (let playerIdx = 0; playerIdx < playerCount; playerIdx++) { // Populate the player status array
        playerStatus[playerIdx] = true; // Initially, all players are active (true)
    }

    let currentRound = 0; // Initialize a counter for the current round number
    let currentPlayerIdx = 0; // Initialize an index to point to the current player

    let expectedWord = ""; // Variable to hold the correct word for the current round

    while (roundCount--) { // Iterate through each round, decrementing the round counter
        currentRound++; // Advance the round number

        let receivedWord = lineBuffer.shift(); // Get the word spoken by the current player from the input

        if (currentRound % 15 === 0) { // Check if the round number is a multiple of 15
            expectedWord = "FizzBuzz"; // Set expected word to "FizzBuzz"
        } else if (currentRound % 3 === 0) { // Check if the round number is a multiple of 3
            expectedWord = "Fizz"; // Set expected word to "Fizz"
        } else if (currentRound % 5 === 0) { // Check if the round number is a multiple of 5
            expectedWord = "Buzz"; // Set expected word to "Buzz"
        } else {
            expectedWord = String(currentRound); // Otherwise, the expected word is the round number itself
        }

        while (playerStatus[currentPlayerIdx] === false) { // Skip over players who are already out of the game
            currentPlayerIdx++; // Move to the next player
            if (currentPlayerIdx >= playerCount) { // If the index goes beyond the last player
                currentPlayerIdx = 0; // Wrap around to the first player
            }
        }

        if (receivedWord !== expectedWord) { // If the player's spoken word does not match the expected word
            playerStatus[currentPlayerIdx] = false; // Mark this player as out of the game
        }

        if (roundCount === 0) { // If this was the very last round to be processed
            break; // Terminate the round-processing loop
        }

        currentPlayerIdx++; // Advance to the next player for the subsequent turn

        if (currentPlayerIdx >= playerCount) { // If the index exceeds the player count
            currentPlayerIdx = 0; // Reset the index to the beginning of the player list
        }

        while (playerStatus[currentPlayerIdx] === false) { // Again, skip any players who are no longer active
            currentPlayerIdx++; // Move to the next player
            if (currentPlayerIdx >= playerCount) { // If the index wraps around
                currentPlayerIdx = 0; // Reset to the first player
            }
        }
    }

    let finalPlayers = []; // Create an array to store the 1-based indices of players still in the game

    playerStatus.forEach(function(statusValue, playerIndex) { // Iterate through the final status of all players
        if (statusValue) { // If a player's status is true (meaning they are still active)
            finalPlayers.push(playerIndex + 1); // Add their 1-based index to the result list
        }
    });

    console.log(finalPlayers.join(" ")); // Output the space-separated list of active players
}
