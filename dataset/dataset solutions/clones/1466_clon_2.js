/*
 * This JavaScript module processes a series of game rounds to tally scores.
 * It's designed to read input containing round information and calculate
 * final scores for two players based on card comparisons.
 */
function ProcessGameData ( rawData ) // Main routine for processing game information
{
    // First, preprocess the raw input string.
    // Trim any leading/trailing whitespace and then split the string
    // into an array of tokens using any whitespace or newline characters as delimiters.
    var tokenizedData = rawData.trim().split( /[\s\n]+/ ) ;

    // Initialize the score counters for Player One and Player Two.
    // Both players start with zero points.
    let playerOneScore = 0;
    let playerTwoScore = 0;

    // The very first token in the data array represents the total number of rounds to be played.
    // We extract this value and convert it from a string to an integer.
    const numberOfRounds = parseInt( tokenizedData.shift() );

    // Begin the main game loop, iterating once for each specified round.
    for ( let roundCounter = 0; roundCounter < numberOfRounds; roundCounter++ )
    {
        // For each round, extract the card value played by the first participant.
        // These values are still strings as they are shifted directly from the array.
        let firstPlayerCard = tokenizedData.shift();

        // Similarly, extract the card value played by the second participant.
        let secondPlayerCard = tokenizedData.shift();

        // Compare the cards played by both participants to determine the round's outcome.
        // Note: Comparisons are string-based as per the original logic, which can differ
        // from numerical comparison for multi-digit numbers.
        if ( firstPlayerCard === secondPlayerCard ) // If both cards are identical (a tie)
        {
            // In case of a tie, both players receive one point.
            playerOneScore++;
            playerTwoScore++;
        }
        else // If the cards are different, one player wins the round.
        {
            // Use a ternary operator to concisely award three points to the winner.
            // The player with the numerically smaller card (when compared as strings) loses.
            firstPlayerCard < secondPlayerCard
                ? ( playerTwoScore += 3 ) // If Player Two's card is 'greater' (lexicographically), Player Two wins.
                : ( playerOneScore += 3 ) ; // Otherwise, Player One wins.
        }
    }

    // After all rounds have been processed, print the final scores.
    // The scores are displayed on a single line, separated by a space.
    console.log( playerOneScore + " " + playerTwoScore );
}

// This section handles the execution entry point.
// It reads all data from standard input (typically a file redirected to /dev/stdin)
// using Node.js's file system module, converts it to a UTF-8 string,
// and then passes this raw data to the primary processing function.
ProcessGameData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );