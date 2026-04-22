/*
 * This JavaScript file processes input lines to simulate a simple card game.
 * It reads game data from standard input and calculates scores for two players, 'A' and 'B'.
 * The main function 'main' orchestrates the game logic.
 */

function    main (lines)
{
    // Initialize score for player A
    var score_a = 0;

    // Initialize score for player B
    var score_b = 0;


    // Index for iterating through the input lines array
    var i = 0;

    // Parse the total number of games from the first relevant line
    var noGemes = parseInt(lines[i++], 10);

    // Loop through each game
    for (
        var gi = 0;
        gi < noGemes;
        gi++
    )
    {
        // Split the current line into card values based on whitespace
        var cards = lines[i++].split(/\s+/);

        // Check if both players played the same card
        if (cards[0] === cards[1])
        {
            // If cards are equal, both players get 1 point
            score_a += 1;
            score_b += 1;
        }
        // Check if player A's card is greater than player B's card
        else if (cards[0] > cards[1])
        {
            // If player A wins, they get 3 points
            score_a += 3;
        }
        // Otherwise, player B's card must be greater than player A's card
        else if (cards[0] < cards[1])
        {
            // If player B wins, they get 3 points
            score_b += 3;
        }
    }

    // Output the final scores for player A and player B
    console.log(score_a, score_b);
}


/*
 * This section handles reading input from standard input (stdin).
 * It collects all incoming data chunks and then processes them once the input stream ends.
 */

// Array to store incoming data chunks
var chunks = [];

// Event listener for 'data' event on stdin
process.stdin.on('data', function(chunk)
{
    // Append each received chunk to the 'chunks' array
    chunks.push(chunk)
});

// Event listener for 'end' event on stdin
process.stdin.on('end', function()
{
    // Join all chunks into a single string and split by newline to get an array of lines
    var lines = chunks.join('').split('\n');

    // Call the main function with the processed lines
    main(lines);
});