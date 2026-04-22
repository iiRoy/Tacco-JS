/* This is a Type I clone of the original JavaScript code.
 * It demonstrates extensive modifications to whitespace and comments,
 * while preserving the exact structure and logic of the original.
 * All identifiers, operators, and expressions remain unchanged.
 */

// Enforce strict mode for better error handling and cleaner code.
'use strict'

/**
 * The main function that processes the input.
 * @param {string} input - The raw input string from stdin.
 */
function Main(   input   ) {
    // Split the input string. By default, split() without arguments
    // splits by whitespace and returns an array of non-empty strings.
    // In this specific case, if input is "10", input.split() will result in ["10"].
    input = input.split();


    // Assign the processed input to 'r'.
    // Given the previous line, 'r' will be an array, e.g., ["10"].
    // JavaScript's loose typing will attempt to convert this array to a number
    // during the multiplication operation, which might lead to unexpected results
    // if the array has more than one element or is empty.
    // For single-element arrays like ["10"], it often works as expected,
    // converting to "10" then to 10.
    let r = input;

    // Calculate the area.
    // This performs a multiplication operation.
    // If 'r' is an array like ["10"], JavaScript will coerce it to "10" then to 10
    // for the arithmetic operation, resulting in 10 * 10 = 100.
    let area = r * r;

    // Output the calculated area to the console.
    console.log(area);

} // End of Main function definition.


// Read input from standard in and pass it to the Main function.
// This uses Node.js 'fs' module to read the file /dev/stdin (standard input).
// The input is read synchronously and decoded as UTF-8.
Main(  require("fs").readFileSync("/dev/stdin", "utf8")  );

// End of file.