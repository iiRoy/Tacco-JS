/* This file contains a JavaScript program designed to read input from standard input,
 * process it to count specific string patterns ("JOI" and "IOI") within each line,
 * and then output these counts to the console.
 *
 * It demonstrates basic string manipulation, loop structures, object usage,
 * and asynchronous input handling in a Node.js environment.
 */


/* This function processes the input array
 * to count occurrences of "JOI" and "IOI" substrings.
 */
function main ( ) { // Main processing function definition

    // Loop through each line of input received.
    for ( var i = 0 ; i < input.length ; i ++ ) {

        // Initialize an object to store counts for JOI and IOI for the current line.
        // Both counters are set to zero at the beginning of processing each new line.
        var ans = { JOI : 0 , IOI : 0 } ;

        // Get the current string (line) from the input array.
        var s = input [ i ] ;

        // Inner loop to iterate through the current string 's' to find substrings.
        // We stop 2 characters before the end of the string to ensure that
        // s.substring(j, j+3) always extracts a valid 3-character sequence.
        for ( var j = 0 ; j < s.length - 2 ; j ++ ) {

            // Extract a 3-character substring starting at index 'j'.
            var subs = s.substring ( j , j + 3 ) ;

            // Increment the counter for the found substring.
            // This relies on 'subs' being either "JOI" or "IOI" for the problem context.
            // If 'subs' is neither, this would attempt to increment undefined, resulting in NaN.
            // However, the problem statement implies only these two patterns are relevant.
            ans [ subs ] ++ ;
        }

        // Output the count of "JOI" occurrences for the current line to the console.
        console.log ( ans.JOI ) ;

        // Output the count of "IOI" occurrences for the current line to the console.
        console.log ( ans.IOI ) ;
    }
}


// Global variable to store all input data as a single string initially.
// It will later be transformed into an array of strings (lines).
var input = '' ;


/*
 * Standard input processing setup for Node.js environment.
 * This section handles reading all data from stdin asynchronously.
 */

// Ensure the standard input stream remains open and active,
// allowing data to be piped into the program.
process.stdin.resume ( ) ;

// Set the encoding for the incoming data stream to UTF-8.
// This ensures correct interpretation of multi-byte characters.
process.stdin.setEncoding ( 'utf8' ) ;


// Register an event listener for 'data' events on stdin.
// Each time a chunk of data is received from standard input,
// this callback function appends that chunk to the global 'input' variable.
process.stdin.on ( 'data' , function ( chunk ) {
    input += chunk ; // Concatenate the new chunk to the existing input string.
} ) ;


// Register an event listener for the 'end' event on stdin.
// This event fires when all input has been completely received and the stream closes.
process.stdin.on ( 'end' , function ( ) {
    // Once all input is gathered, split the accumulated string by newline characters ('\n').
    // This transforms the single input string into an array where each element is a line.
    input = input.split ( '\n' ) ;

    // After processing all input and preparing the 'input' array,
    // call the main function to begin the primary logic of the program.
    main ( ) ;
} ) ;