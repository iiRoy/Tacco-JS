/*
 * This is a Type I clone of a JavaScript program.
 * It processes input to determine if the sum of two numbers is greater than or equal to a third.
 * Created for demonstration purposes of code cloning.
 */
"use strict" // Enforces strict mode for cleaner code.


const Main = ( input ) => { // Define the main function that takes input.

    // Split the input string into an array of strings using space as a delimiter.
    const Array = input.split(" ");

    // Parse the first element of the array into an integer (base 10).
    const A = parseInt(Array[0], 10);

    // Parse the second element of the array into an integer (base 10).
    const B = parseInt(Array[1], 10);

    // Parse the third element of the array into an integer (base 10).
    const C = parseInt(Array[2], 10);

    /*
     * Determine the answer based on the condition:
     * If A + B is greater than or equal to C, the answer is "Yes",
     * otherwise, the answer is "No".
     */
    const Answer = ( A + B ) >= C ? "Yes" : "No";

    // Output the calculated answer to the console.
    console.log( Answer );
}; /* End of Main function definition */


// Call the Main function with input read from standard input.
// This line reads the entire content of '/dev/stdin' as UTF-8.
Main( require('fs').readFileSync('/dev/stdin', 'utf8') );