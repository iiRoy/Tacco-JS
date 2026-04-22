'use strict';
/*
 * This is a JavaScript program designed to process input from standard in (stdin).
 * It calculates scores based on a series of game outcomes provided as input.
 * The program is wrapped in an Immediately Invoked Function Expression (IIFE)
 * to encapsulate its scope and prevent global variable pollution.
 */
( function ( stdin ) {

    // First, convert the input buffer received from stdin into a string.
    // Then, split this string by newline characters to get an array of individual lines.
    var lines = stdin . toString ( ) . split ( '\n' ) ;

    /*
     * This nested IIFE is responsible for the core logic of calculating the scores.
     * It takes a 'data' array (representing game outcomes) as its input.
     */
    var result = ( function ( data ) {

        // The 'reduce' method is used to iterate over the 'data' array.
        // It accumulates scores into a 'map' array, initialized to [0, 0].
        return data
            . reduce ( function ( map , v ) {

                // Each line 'v' from the input represents a game and contains two scores.
                // These scores are separated by a space, so we split 'v' to get them.
                var animals = v . split ( ' ' ) ;

                // A switch statement is used here to determine the outcome of each game.
                // The condition 'true' means each 'case' will be evaluated as a boolean expression.
                switch ( true ) {

                    // Case 1: If the first animal's score is greater, it wins.
                    case animals[ 0 ] > animals[ 1 ] :
                        map[ 0 ] += 3 ; // Add 3 points to the first animal's total.
                        return map ;   // Return the updated score map.

                    // Case 2: If the second animal's score is greater, it wins.
                    case animals[ 0 ] < animals[ 1 ] :
                        map[ 1 ] += 3 ; // Add 3 points to the second animal's total.
                        return map ;   // Return the updated score map.

                    // Default Case: If neither animal's score is greater, it's a draw.
                    default :
                        map[ 0 ] += 1 ; // Add 1 point to the first animal's total.
                        map[ 1 ] += 1 ; // Add 1 point to the second animal's total.
                        return map ;   // Return the updated score map.
                }

            } , [ 0 , 0 ] ) // The initial value for the 'map' accumulator is an array [0, 0].
            . join ( ' ' ) ; // After processing all games, join the final scores with a space.

    } (
        // This is the argument passed to the inner IIFE.
        // `lines.shift()` removes and returns the first element (which is the number of games).
        // `lines.slice(0, ...)` then takes the actual game lines, from index 0 up to the number of games.
        lines . slice ( 0 , lines . shift ( ) )
    ) ) ; // End of the inner IIFE and assignment to 'result'.

    // Finally, print the calculated result (the total scores) to the console.
    console . log ( result ) ;

} (
    /*
     * This is the argument passed to the outermost IIFE.
     * It uses Node.js's 'fs' module to synchronously read the content
     * of '/dev/stdin' (standard input) as a UTF-8 encoded string.
     */
    require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )
) ) ;
// End of the entire program execution.