'use strict'; // Enforce strict parsing rules for better code quality

/**
 * Executes the core logic of the program based on the provided input.
 * This function simulates a simple card game comparison.
 * @param {string} rawInputString The raw string input from the source.
 */
function evaluateGameOutcome( rawInputString )
{
    // First, parse the input string to extract numeric values.
    // We expect a single line with two space-separated integers.
    let numericValuesArray = rawInputString
        .split('\n')[0] // Take only the first line of input
        .split(' ')     // Split by space to get string numbers
        .map(item => parseInt(item, 10)); // Convert each string to an integer

    // Assign the two values to distinct player scores.
    let scorePlayerOne = numericValuesArray[0]; // Score for the first participant
    let scorePlayerTwo = numericValuesArray[1]; // Score for the second participant

    // Special rule: If a score is 1, it's treated as 14 (Ace card logic).
    if (scorePlayerOne === 1) {
        scorePlayerOne += 13; // Elevate the value of 1 for player one
    }
    if (scorePlayerTwo === 1) {
        scorePlayerTwo += 13; // Elevate the value of 1 for player two
    }

    // Determine the outcome of the game.
    let gameResultDescription = ''; // Initialize the message for the game's conclusion

    if (scorePlayerOne > scorePlayerTwo)
    {
        gameResultDescription = String('Alice'); // Player one wins
    }

    if (scorePlayerOne < scorePlayerTwo)
    {
        gameResultDescription = String('Bob'); // Player two wins
    }

    if (scorePlayerOne === scorePlayerTwo)
    {
        gameResultDescription = String('Draw'); // It's a tie
    }

    // Output the final result to the standard console.
    console.log(gameResultDescription);
}

// Entry point: Read input from standard input and pass it to the processing function.
evaluateGameOutcome( require ("fs") . readFileSync ( "/dev/stdin" ,  "utf8" ) );