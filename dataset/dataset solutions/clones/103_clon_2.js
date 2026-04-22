let incomingData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw data from standard input stream

// Process the raw input: remove leading/trailing whitespace and split into an array of lines.
let lineCollection = incomingData.trim().split("\n");

// Iterate through the processed lines, handling two lines at a time for each game scenario.
for (let gameRoundIndex = 0; gameRoundIndex < lineCollection.length; gameRoundIndex += 2) {

    // Parse the first line of the current round into an array of numbers, representing the player's attempt.
    let playerGuess = lineCollection[gameRoundIndex].split(" ").map(Number);

    // Parse the second line of the current round into an array of numbers, representing the hidden sequence.
    let secretCode = lineCollection[gameRoundIndex + 1].split(" ").map(Number);

    // Initialize a counter for digits that are correct in both value and position.
    let exactMatches = 0;

    // Initialize a counter for digits that are correct in value but incorrect in position.
    let partialMatches = 0;

    // Loop through each of the four positions within the numerical sequences.
    for (let positionIndex = 0; positionIndex < 4; positionIndex++) {

        // Check if the digit at the current position in the guess exactly matches the digit in the secret code.
        if (playerGuess[positionIndex] === secretCode[positionIndex]) {
            exactMatches++; // Increment the exact matches counter.
        }
        // If not an exact match, check if the digit from the secret code exists anywhere within the player's guess.
        else if (playerGuess.indexOf(secretCode[positionIndex]) !== -1) {
            partialMatches++; // Increment the partial matches counter.
        }
    }

    // Output the final count of exact matches and partial matches for the current game scenario, separated by a space.
    console.log(exactMatches + " " + partialMatches);
}