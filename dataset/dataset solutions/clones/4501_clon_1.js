// This JavaScript file contains a program that processes numerical input
// to determine a specific status, which is then printed to the console.
// The logic is based on comparisons of three integer values.

"use strict"; // Activating strict mode for the entire script to catch common coding errors and "unsafe" actions.

/*
 * The primary function responsible for handling the application's core logic.
 * It takes a single string argument, which is expected to contain space-separated numbers.
 *
 * @param {string} input - The raw input string containing numerical data.
 */
const Main = ( input ) => {

    // Process the input string:
    // 1. Remove leading/trailing whitespace using `trim()`.
    // 2. Split the string into an array of substrings based on spaces using `split(' ')`.
    // 3. Convert each substring to an integer using `map(v => parseInt(v, 10))`,
    //    ensuring base 10 for parsing.
    let xs = input . trim () . split ( ' ' ) . map ( v => parseInt ( v , 10 ) ) ;

    // Declare and initialize a variable to hold the resulting answer string.
    let ans = '' ;

    // --- Start of the conditional logic block ---

    // Check the first condition:
    // If the second number (at index 1) is greater than or equal to the third number (at index 2).
    if ( xs [ 1 ] >= xs [ 2 ] )
    {
        ans = 'delicious' ; // Assign 'delicious' if the condition is true.
    }
    // If the first condition is false, proceed to the next 'else if' block.
    // Check the second condition:
    // If the first number (at index 0) plus one is less than the difference between
    // the third and second numbers (xs[2] - xs[1]).
    else if ( xs [ 0 ] + 1 < ( xs [ 2 ] - xs [ 1 ] ) )
    {
        ans = 'dangerous' ; // Assign 'dangerous' if this condition is true.
    }
    // If the second condition is also false, proceed to the final 'else if' block.
    // Check the third condition:
    // If the first number (at index 0) plus one is greater than the difference between
    // the third and second numbers (xs[2] - xs[1]).
    else if ( xs [ 0 ] + 1 > ( xs [ 2 ] - xs [ 1 ] ) )
    {
        ans = 'safe' ; // Assign 'safe' if this condition is true.
    }

    // --- End of the conditional logic block ---

    // Output the final determined answer string to the standard console.
    console . log ( ans ) ;

} ; // End of the Main function definition.

// This part of the script is responsible for reading input from the standard input stream
// and then invoking the `Main` function with that input.
// It uses Node.js's built-in `fs` module to synchronously read the file located at '/dev/stdin'
// and decodes it as UTF-8.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;

// The program concludes after the `Main` function has executed and printed its output.