/*
 * This JavaScript code reads input from stdin, processes it
 * in a game-like fashion, and prints the result to stdout.
 * It simulates a FizzBuzz-style game with multiple players.
 */

var input = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ;

// The input is read as a single string, then trimmed and split by newlines.
var arr = input . trim( ) . split( "\n" ) ;


// Main loop continues until a specific termination condition is met.
while ( true ) {

    // Extract 'm' (number of players) and 'n' (number of turns) from the input array.
    var mn = arr . shift( ) . split( " " ) ;

    // Termination condition: if both m and n are '0', break the loop.
    if ( mn . join( " " ) == "0 0" ) break ;


    // Convert string values to numbers for m and n.
    var m = mn[ 0 ] - 0 ; // Number of participants/players.
    var n = mn[ 1 ] - 0 ; // Number of rounds/turns.


    // Initialize an array 'p' to keep track of active players.
    // 'true' means the player is still in the game.
    var p = [ ] ;


    // All 'm' players start as active.
    for ( var i = 0 ; i < m ; i++ ) p[ i ] = true ;


    // Initialize turn counter and current player index.
    var i = 0 ; // Current turn number.
    var j = 0 ; // Index of the current player.
    var good = "" ; // Expected FizzBuzz string for the current turn.

    // Loop for 'n' turns. 'n--' decrements n and uses its original value.
    while ( n-- ) {

        i++ ; // Increment the turn counter.

        // Get the player's response for the current turn.
        var str = arr . shift( ) ;

        // Determine the correct FizzBuzz output for the current turn number 'i'.
        if ( i % 15 == 0 ) good = "FizzBuzz" ;
        else if ( i % 3 == 0 ) good = "Fizz" ;
        else if ( i % 5 == 0 ) good = "Buzz" ;
        else good = i + "" ; // If no Fizz/Buzz, the number itself (as a string).


        // Find the next active player.
        while ( p[ j ] == false ) {
            j++ ;
            if ( j >= m ) j = 0 ; // Wrap around to the first player if end is reached.
        }

        // Check if the current player's response matches the expected FizzBuzz output.
        if ( str != good ) p[ j ] = false ; // If not, the player is eliminated.


        // If this was the last turn, no need to advance player or find next.
        if ( n == 0 ) break ;


        // Move to the next player for the subsequent turn.
        j++ ;
        if ( j >= m ) j = 0 ; // Wrap around if necessary.

        // Find the next active player, skipping eliminated ones.
        while ( p[ j ] == false ) {
            j++ ;
            if ( j >= m ) j = 0 ; // Wrap around.
        }
    }


    // Prepare an array to store the 1-indexed numbers of the surviving players.
    var ans = [ ] ;

    // Iterate through the player status array.
    p . forEach( function ( v , i ) {
        // If a player is active (v is true), add their 1-indexed number to the answer.
        if ( v ) ans . push( i + 1 ) ;
    } ) ;

    // Print the space-separated list of surviving player numbers.
    console . log( ans . join( " " ) ) ;

} // End of main while loop.