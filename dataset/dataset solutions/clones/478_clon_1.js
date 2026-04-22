/*
 * This JavaScript code processes input from /dev/stdin.
 * It simulates a game where players are eliminated based on their responses.
 * The game continues until only one player remains or the input runs out.
 */

var input = require( 'fs' ).readFileSync( '/dev/stdin' , 'utf8' );

// Split the input into an array of lines, after trimming any leading/trailing whitespace.
var arr = input.trim().split( "\n" );

// Main game loop: continue as long as there are game rounds to process.
while ( true ) {
    // Read the first line of the current round, which contains 'm' (number of players) and 'n' (number of turns).
    var mn = arr.shift().split( " " );

    // Check for the termination condition: "0 0" indicates the end of input rounds.
    if ( mn.join( " " ) == "0 0" ) {
        break; // Exit the loop if the termination signal is found.
    }

    // Parse 'm' and 'n' as numbers.
    var m = mn[ 0 ] - 0; // Number of players.
    var n = mn[ 1 ] - 0; // Number of turns.

    // Initialize an array 'p' to keep track of active players.
    // 'p[i] = true' means player (i+1) is active.
    var p = [];
    for ( var i = 0; i < m; i++ ) {
        p[ i ] = true; // All players are initially active.
    }

    // Initialize game state variables.
    var i = 0;   // Current number in the FizzBuzz sequence.
    var j = 0;   // Current player index (0-based).
    var good = ""; // The correct FizzBuzz response for 'i'.
    var cnt = m; // Count of active players.

    // Loop through 'n' turns.
    while ( n-- ) {
        // Optimization: If only one player is left, the game is effectively over for this round.
        if ( cnt == 1 ) {
            break;
        }

        i++; // Increment the FizzBuzz counter for the current turn.

        // Read the player's response for the current turn.
        var str = arr.shift();

        // Determine the correct FizzBuzz response.
        if ( i % 15 == 0 ) {
            good = "FizzBuzz";
        }
        else if ( i % 3 == 0 ) {
            good = "Fizz";
        }
        else if ( i % 5 == 0 ) {
            good = "Buzz";
        }
        else {
            good = i + ""; // Convert number to string for comparison.
        }

        // Check if the player's response was incorrect.
        if ( str != good ) {
            p[ j ] = false; // Mark the current player as eliminated.
            cnt--;          // Decrement the count of active players.
        }

        // Check again if only one player is left after potential elimination.
        if ( cnt == 1 ) {
            break;
        }

        // If this was the last turn (n is now 0), break the loop.
        if ( n == 0 ) {
            break;
        }

        // Move to the next player.
        j++;
        if ( j >= m ) {
            j = 0; // Wrap around to the first player if current player index exceeds 'm'.
        }

        // Skip eliminated players to find the next active player.
        while ( p[ j ] == false ) {
            j++; // Move to the next player.
            if ( j >= m ) {
                j = 0; // Wrap around.
            }
        }
    }

    // Collect the indices (1-based) of the remaining active players.
    var ans = [];
    p.forEach( function( v, i ) {
        if ( v ) {
            ans.push( i + 1 ); // Add 1 to convert 0-based index to 1-based player number.
        }
    } );

    // Print the result: space-separated list of remaining player numbers.
    console.log( ans.join( " " ) );
}