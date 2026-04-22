/*
 * This is a Type I clone of an existing JavaScript program.
 * It demonstrates a variation in whitespace and comments while
 * preserving the exact structure and logic of the original code.
 */

// Import the 'fs' (file system) module to read input.
var input = require('fs') .readFileSync('/dev/stdin', 'utf8') ;


// Process the input: trim whitespace, then split into an array of lines.
var arr = (input.trim()) .split("\n") ;


// Main loop to process multiple test cases.
while ( true ) {

    // Read the next line, which contains N, M, and Start.
    var nm = arr.shift() ;

    // Check for the termination condition: "0 0 0".
    if ( nm == "0 0 0" ) {
        break ; // Exit the main loop if termination string is found.
    }

    // Split the 'nm' string by space and convert parts to numbers.
    nm = nm.split(" ") .map(Number) ;

    // Extract N, M, and Start values.
    var n     = nm[0] ;    // N: total number of participants/elements
    var m     = nm[1] ;    // M: step count for elimination
    var start = nm[2] ;    // Start: initial position

    // Initialize an array 'ary' to keep track of active participants.
    // 'true' means active, 'false' means eliminated.
    var ary = [] ;

    // Populate 'ary' from index 0 to N, initially all active (true).
    for ( var i = 0 ; i <= n ; i++ ) {
        ary[i] = true ;
    }


    // Initialize loop variables for the elimination process.
    var i = start ; // Current position, starting from 'start'.
    var j = 0 ;     // Counter for steps in the M-step elimination.

    // The starting participant is immediately eliminated in this variant of Josephus.
    ary[start] = false ;

    var cnt = 1 ; // Count of eliminated participants. Starts at 1 because 'start' is eliminated.


    // Loop for the elimination process until all but two participants are left.
    while ( true ) {

        // The problem often implies finding the last remaining, or the last few.
        // Here, it breaks when (ary.length - 2) participants are eliminated.
        // Note: ary.length is n+1 for 0-indexed, but this problem seems 1-indexed.
        // ary.length - 1 is the actual max index.
        // The condition `cnt == ary.length - 2` implies that two participants remain active.
        if ( cnt == ary.length - 2 ) {
            break ; // Exit elimination loop.
        }

        // Check if the current participant 'i' is active.
        if ( ary[i] ) {
            j++ ; // Increment step counter if active.

            // If 'm' steps have been counted, eliminate the participant.
            if ( j == m ) {
                ary[i] = false ; // Mark as eliminated.
                j = 0 ;          // Reset step counter.
                cnt++ ;          // Increment count of eliminated.
            }
        }

        i++ ; // Move to the next participant.

        // If 'i' exceeds the bounds (n), wrap around to 1 (assuming 1-indexed problem).
        if ( ary.length - 1 < i ) {
            i = 1 ;
        }
    }


    // After elimination, iterate through 'ary' and print the indices of remaining active participants.
    for ( var i = 1 ; i <= n ; i++ ) {
        // If participant 'i' is still active (true), print their number.
        if ( ary[i] ) {
            console.log(i) ;
        }
    }
}