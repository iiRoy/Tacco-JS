// This is a Type I clone of the original JavaScript code.
// All identifiers, operators, and expressions are preserved exactly.
// Only whitespace (spaces, tabs, newlines) and comments have been altered
// to create a visually distinct, yet functionally identical, version.

var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Read raw input from standard input

// Process the input string: trim whitespace and split into an array of lines.
var arr = input . trim ( ) . split ( "\n" ) ;

// Extract the first line, which contains N (number of players) and Q (number of queries).
// Split by space and convert to numbers.
var nq = arr . shift ( ) . split ( " " ) . map ( Number ) ;

// Initialize an array to hold player scores.
var player = [ ] ;

// Variables to keep track of the highest score and the player who has it.
var maxValue = 0 ;
var maxId    = 0 ;

// Initialize all player scores to zero. The number of players is nq[0].
for ( var i = 0 ; i < nq [ 0 ] ; i ++ )
{
    player [ i ] = 0 ; // Set initial score for player 'i' to 0.
}


// Iterate through the remaining lines (queries) in the 'arr' array.
arr . forEach ( function ( V )
{
    // For each query, parse the player ID and the value to add/subtract.
    var av = V . split ( " " ) . map ( Number ) ;

    var a = av [ 0 ] - 1 ; // Player ID (0-indexed)
    var v = av [ 1 ] ;     // Value to be added to the player's score

    // Update the score of the specified player.
    player [ a ] += v ;

    // Logic to maintain the current maximum score and the ID of the player holding it.
    if ( a == maxId && v >= 0 )
    {
        // If the player whose score just changed is currently the maxId player,
        // and their score increased or stayed the same (v >= 0),
        // then the maxValue can simply be updated by adding 'v'.
        maxValue += v ;
    }
    else if ( a != maxId && v < 0 )
    {
        // If a different player's score decreased (v < 0),
        // it doesn't immediately affect the current maxId/maxValue,
        // unless that player *was* the maxId player, which is handled by the 'else' block.
        // This specific condition results in no action, as per original logic.
        ; // No operation needed here.
    }
    else
    {
        // In all other scenarios (e.g., maxId player's score decreased,
        // or a different player's score increased/decreased in a way that
        // *might* affect the max), we must re-evaluate the maximum score
        // by iterating through all players.

        var max = ( -1 * Infinity ) ; // Initialize local max to a very small number.

        // Loop through all players to find the new highest score.
        player . forEach ( function ( value , index )
        {
            if ( max < value )
            {
                max      = value ;   // Update local maximum value.
                maxValue = value ;   // Update global maximum score.
                maxId    = index ;   // Update global max player ID.
            }
        } ) ;
    }

    // Output the current max player ID (1-indexed) and their score.
    console . log ( ( maxId + 1 ) + " " + maxValue ) ;

} ) ; // End of forEach loop for queries.