/* This is a Type I clone of an original JavaScript program.
 * It demonstrates basic conditional logic and input processing. */
"use strict" /* Enforces strict mode for cleaner code. */


const Main = ( input ) => {
    // Declare and initialize an array 'xs' from the input string.
    let xs = input.trim().split( "\n" ) ;


    let a = xs [ 0 ] ; // Extract the first element into 'a'.
    let s = xs [ 1 ] ; // Extract the second element into 's'.

    /* The following line was originally a commented-out debug statement.
     * It has been preserved as a comment here.
     * console.log(xs); */

    if ( a >= 3200 ) { // Check if 'a' is greater than or equal to 3200.
        console.log( s ) ; // If true, print 's'.
    } else if ( a < 3200 ) { // Otherwise, if 'a' is less than 3200.
        // Nested conditional logic based on the value of 's'.
        if ( s == "pink" ) {
            console.log( "red" ) ; // If 's' is "pink", print "red".
        } else if ( s == "red" ) {
            console.log( "pink" ) ; // If 's' is "red", print "pink".
        }
    }
} // End of the Main function.


// Invoke the Main function with input read from standard input.
Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;