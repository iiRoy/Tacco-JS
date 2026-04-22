'use strict'   ; // Enforce strict mode for cleaner code and error handling.


// This is the main processing function for the program.
/**
 * @function Main
 * @description Processes the given input string to perform a specific calculation.
 * @param {string} INPUT The raw input string, typically from standard input.
 * @returns {void} This function prints its result directly to the standard output.
 */
function     Main     (     INPUT     )     {

    // Parse the input string.
    // First, split by newline to get lines, then take the first line.
    // Next, split that line by spaces to get individual number strings.
    // Finally, map each string to its numerical representation.
    const     input     =     INPUT . split ( "\n" ) [ 0 ] . split ( " " ) . map ( n     =>     Number ( n ) ) ;


    // Perform the core calculation: (first number - 1) * (second number - 1).
    // The problem implies a 0-indexed array for input values.
    console . log ( ( input [ 0 ]     -     1 )     *     ( input [ 1 ]     -     1 ) ) ;

} // End of the Main function.


// --- Program Entry Point ---

// Read the entire content from standard input synchronously using Node.js's 'fs' module.
// The '/dev/stdin' path is common for competitive programming environments on Linux-like systems.
// The 'utf8' encoding ensures correct interpretation of text.
// Then, pass the read content to the Main function for processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// End of the JavaScript program.