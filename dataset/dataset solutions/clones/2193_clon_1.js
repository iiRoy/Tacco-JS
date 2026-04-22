/*
 * This file contains a JavaScript program designed to process input data.
 * It reads input from standard input, parses it, and then performs a calculation.
 *
 * Author: Code Clone Generator
 * Date: Current Date
 * Version: 1.0
 */

// Define the main function that processes the input string.
function         Main (  input  ) {
    // Trim leading/trailing whitespace from the input string
    // and then split it into an array of lines based on newline characters.
    input = input.trim  (  ) .split   ( '\n'    );


    // Extract the value of K from the first line of input.
    // The first line is expected to contain two space-separated values;
    // K is the second value (index 1).
    K = input [0] .split ( ' ' ) [1];

    /*
     * Process the second line of input (index 1).
     * 1. Split the line by spaces to get an array of string numbers.
     * 2. Sort these numbers in descending order (b - a).
     * 3. Convert each sorted string number to an actual Number type.
     * 4. Reduce the array:
     *    - Initialize accumulator 'a' to 0.
     *    - For each value 'v' at index 'i':
     *      - If the current index 'i' is less than K,
     *        it means we are considering one of the largest K numbers,
     *        so we do not add it to the sum (keep 'a' as is).
     *      - Otherwise (i.e., 'i' >= K), add 'v' to 'a'.
     *    This effectively sums all numbers *except* the K largest ones.
     */
    console.log( input[1].split(' ').sort( ( a, b ) => b - a ).map( Number ).reduce( ( a, v, i ) => i < K ? a : a + v, 0 ) );
} // End of Main function definition.


// Call the Main function, passing the content of standard input as an argument.
// This reads the entire file content from /dev/stdin as a UTF-8 string.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );
// Program execution concludes after the Main function completes.