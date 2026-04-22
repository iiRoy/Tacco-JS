/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains the exact same functionality and structure,
 * only varying in whitespace and comments as per definition.
 */
'use strict';
// Enforce strict mode for better code quality

function Main ( inputs ) {

    // Split the input string by newlines to get an array of lines.
    const input = inputs.split ( "\n" ) ;

    // Parse the first line of input.
    // Extract 'a', 'b', and 'k' values from the space-separated string.
    const a = Number ( input[0].split ( ' ' ) [0] ) ; // First number
    const b = Number ( input[0].split ( ' ' ) [1] ) ; // Second number
    const k = Number ( input[0].split ( ' ' ) [2] ) ; // Third number

    // Calculate and log the results based on the problem's logic.
    // First value: if 'a' is greater than 'k', it's 'a - k', otherwise 0.
    // Second value: if 'a' is greater than 'k', it's 'b'.
    //               Otherwise, if 'a + b' is greater than 'k', it's 'a + b - k', else 0.
    console.log ( ( a > k ? a - k : 0 ) , ( a > k ? b : a + b > k ? a + b - k : 0 ) ) ;
}

// Read input from standard input and pass it to the Main function.
// This is typical for competitive programming environments.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;