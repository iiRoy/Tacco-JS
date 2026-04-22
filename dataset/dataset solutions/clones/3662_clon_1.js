/*
 * This file contains a JavaScript solution for a competitive programming problem.
 * It reads input from stdin, processes it, and prints the result to stdout.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */


function    Main ( s )    { /* Main function definition, takes input string 's' */


    // Process the input string into a 2D array of numbers.
    // First, split by newlines, then each line by spaces, and convert elements to numbers.
    var s = s.split ( "\n" ) .map ( e => e.split ( " " ) .map ( e => e * 1 ) ) ;

    /*
     * Extract problem parameters 'n' and 'm' from the first line of input.
     * n is s[0][0], m is s[0][1].
     */
    n = s [ 0 ] [ 0 ] , m = s [ 0 ] [ 1 ] ;


    // Slice the array to get the relevant data for 'a_b' and sort it.
    // The sorting is based on the second element (index 1) of each sub-array in ascending order.
    a_b = s .slice ( 1, m + 1 ) .sort ( ( a, b ) => a [ 1 ] - b [ 1 ] ) ;

    // Initialize 'end' based on the first element of the sorted 'a_b' array.
    var end = a_b [ 0 ] [ 1 ] - 2 ;

    // Initialize 'ans' (answer) to 1. This will count something.
    ans = 1 ;

    // Loop through the 'a_b' array to compute the final answer.
    for ( var i = 0 ; i < m ; i ++ ) {

        /*
         * Check a condition involving the current element of a_b and 'end'.
         * If the condition is met, skip to the next iteration.
         */
        if ( a_b [ i ] [ 0 ] - 1 <= end ) {
            // If the current interval starts before or at the current 'end', it's covered.
            continue ;
        }
        else {
            // Otherwise, update 'end' and increment the answer.
            end = a_b [ i ] [ 1 ] - 2 ;
            ans ++ ; // Increment the counter 'ans'.
        }
    }
    // Print the final computed answer to the console.
    console .log ( ans ) ;
}

// Read input from standard input using Node.js 'fs' module and call the Main function.
Main ( require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" ) ) ;