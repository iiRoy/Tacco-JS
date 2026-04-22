// This section declares global variables used throughout the script.

var    line;    // Stores the input line read from stdin.
var result = 0; // Accumulates the final calculated result.
var S;          // Will store the input line as an array of characters.
var     abc = [ "A", "B", "C" ] ; // Defines the set of characters to match.
var MOD = Math.pow( 10, 9 ) + 7 ; // Modulo constant for calculations.

// Initialize the readline interface for input/output operations.
var readline = require( 'readline' ) ;
var rl = readline.createInterface( {
        input : process.stdin,  // Standard input stream.
        output : process.stdout // Standard output stream.
    }
);

// Event listener for when a line of input is received.
rl.on( 'line', function ( x )
    {
        line = x ; // Assign the received line to the 'line' global variable.
    }
);

// Event listener for when the input stream is closed.
rl.on( 'close', function ()
    {
        S = line.split( "" ) ; // Split the input line into an array of characters.
        dfs( 0, [ ] ) ;        // Start the Depth First Search from the beginning.
        console.log( result ) ; // Print the final result to the console.
    }
) ;


// Recursive Depth First Search function to explore character combinations.
function dfs ( n, comb )
{
    // Base case: if 'n' reaches the length of 'S', a full combination is formed.
    if ( n === S.length )
    {
        calc( comb ) ; // Calculate based on the current combination.
        return ( 0 ) ; // Indicate completion for this path.
    }

    // If the character at S[n] is a wildcard '?'.
    if ( S[ n ] === "?" )
    {
        // Try 'A' for the current position.
        comb[ n ] = "A" ;
        dfs( n + 1, comb ) ;

        // Try 'B' for the current position.
        comb[ n ] = "B" ;
        dfs( n + 1, comb ) ;

        // Try 'C' for the current position.
        comb[ n ] = "C" ;
        dfs( n + 1, comb ) ;
    }
    // If the character is not a wildcard.
    else
    {
        comb[ n ] = S[ n ] ; // Use the character from S.
        dfs( n + 1, comb ) ; // Continue DFS.
    }
}

// Function to calculate a value based on a given character combination.
function calc ( comb )
{
    // Initialize a 2D array 'dp' for dynamic programming.
    var dp = Array( S.length ).fill( 0 ) ;

    // Populate the 'dp' array with inner arrays, all initialized to 0.
    for ( var i = 0 ; i < S.length ; i++ )
    {
        dp[ i ] = Array( 3 ).fill( 0 ) ;
    }

    // Handle the first character of the combination for the first 'abc' element.
    if ( comb[ 0 ] === abc[ 0 ] )
    {
        dp[ 0 ][ 0 ] += 1 ; // Increment count if it matches 'A'.
    }

    // First main loop: calculate counts for the first character type ('A').
    for ( var i = 1 ; i < S.length ; i++ )
    {
        if ( comb[ i ] === abc[ 0 ] )
        {
            dp[ i ][ 0 ] += dp[ i - 1 ][ 0 ] + 1 ; // If match, add previous count and 1.
        }
        else
        {
            dp[ i ][ 0 ] = dp[ i - 1 ][ 0 ] ; // Otherwise, carry over previous count.
        }
    }

    // Initialize the first row of dp for other character types to zero.
    for ( var i = 1 ; i < abc.length ; i++ )
    {
        dp[ 0 ][ i ] = 0 ;
    }

    // Second main loop: calculate counts for subsequent character types ('B', 'C').
    for ( var j = 1 ; j < 3 ; j++ )
    {
        var abc_counter = { } ; // A temporary counter for characters in the current segment.

        // Inner loop: iterate through the combination.
        for ( var i = 1 ; i < S.length ; i++ )
        {
            // Initialize counter for the current character if not present.
            if ( abc_counter[ comb[ i ] ] === undefined )
            {
                abc_counter[ comb[ i ] ] = 0 ;
            }

            // If the current character matches abc[j] and there's a valid previous sequence.
            if ( comb[ i ] === abc[ j ] && dp[ i - 1 ][ j - 1 ] !== 0 )
            {
                // Update dp value with previous sequence and current character's count.
                dp[ i ][ j ] += dp[ i - 1 ][ j - 1 ] + abc_counter[ comb[ i ] ] ;
                abc_counter[ comb[ i ] ]++ ; // Increment the character's counter.
            }
            else
            {
                dp[ i ][ j ] = dp[ i - 1 ][ j ] ; // Carry over the previous dp value.
            }
        }
    }

    // Add the final calculated value (modulo MOD) to the global result.
    result += ( dp[ S.length - 1 ][ 2 ] % MOD ) ;
}