/*
 * This JavaScript code processes an input string, attempting to
 * reduce it to a string containing only a single repeating character.
 * It iterates through possible target characters ('a' through 'z')
 * and for each target, it simulates a transformation process.
 * The goal is to find the minimum number of transformations required.
 *
 * The `Main` function serves as the entry point for the program,
 * handling the primary logic and coordination.
 */
function Main( input ) {

    // Variable to hold the initial string 't'
    var t ;

    // Split the entire input data by newline characters.
    // The problem statement implies `input` initially contains all data.
    var input = input.split( "\n" ) ;

    // The first line of input is considered the string 't' to be processed.
    t = input[0] ;

    // Initialize `min_try_count` to -1, indicating no valid count found yet.
    // This variable will store the minimum number of transformation steps.
    var min_try_count = -1 ;


    // Iterate through all lowercase English alphabet characters from 'a' to 'z'.
    // `i` represents the ASCII code of the current character.
    for ( var i = "a".charCodeAt(0) ; i < "z".charCodeAt(0) + 1 ; i++ ) {

        // Check if the current string 't' already consists of a single repeating character.
        // If it does, no transformations are needed for this 't'.
        if ( /^([a-z])\1*$/.test( t ) ) {
            min_try_count = 0 ; // Zero transformations needed.
            break ;             // Exit the loop early as the optimal case is found.
        }


        // `tmp` holds the string being transformed in the current iteration.
        var tmp       = t ;
        // `t_prime` will store the result of one transformation step.
        var t_prime   = "" ;
        // `c` is the current target character (e.g., 'a', then 'b', etc.).
        var c         = String.fromCharCode( i ) ;
        // `try_count` tracks the number of transformations for the current target character `c`.
        var try_count = 0 ;


        // This inner loop continues transforming `tmp` until `t_prime`
        // consists of a single repeating character, or a break condition is met.
        while ( true ) {

            // Loop through the string `tmp` to build `t_prime`.
            // The loop runs `tmp.length - 1` times, considering pairs of characters.
            for ( var j = 0 ; j < tmp.length - 1 ; j++ ) {

                // If the current character `tmp.charAt(j)` matches the target character `c`,
                // append `c` to `t_prime`.
                if ( c === tmp.charAt( j ) ) {
                    t_prime += c ;
                }
                // Else if the next character `tmp.charAt(j + 1)` matches `c`,
                // append `c` to `t_prime`.
                else if ( c === tmp.charAt( j + 1 ) ) {
                    t_prime += c ;
                }
                // If neither the current nor the next character matches `c`,
                // append the current character `tmp.charAt(j)` to `t_prime`.
                else {
                    t_prime += tmp.charAt( j ) ;
                }

            }

            // Increment the transformation count for this target character.
            try_count++ ;


            // Output the transformed string for debugging or tracing purposes.
            console.log( t_prime ) ;

            // After a transformation, check if `t_prime` now consists of
            // a single repeating character. If so, this sequence is complete.
            if ( /^([a-z])\1*$/.test( t_prime ) ) {
                break ; // Exit the `while` loop.
            }

            // Prepare for the next transformation step:
            // The newly formed `t_prime` becomes the `tmp` for the next iteration.
            tmp = t_prime ;
            // Reset `t_prime` to an empty string to build the next transformed string.
            t_prime = "" ;

        } // End of while (true) loop


        // After finding the `try_count` for the current target character `c`,
        // compare it with the overall minimum.
        if ( min_try_count == -1 || min_try_count > try_count ) {
            min_try_count = try_count ; // Update if a new minimum is found.
        }

    } // End of for (var i...) loop

    // Print the final minimum number of transformation steps found across all target characters.
    console.log( min_try_count ) ;

} // End of Main function


// This function `conert` is declared but not used in the provided code snippet.
// It might be a placeholder or a remnant from earlier development.
var conert = function ( t , c ) {

} ;


// This utility function replaces a character at a specific position `n` in `text`
// with `value`. It's also not used in the main logic as currently presented.
var rep = function ( text , n , value ) {
    // Uses substring manipulation to achieve the replacement.
    return text.substr( 0 , n ) + value + text.substr( n + 1 ) ;
} ;

// *This line and below should not be edited. It handles standard input/output
// and calls the `Main` function with the read data.
Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;