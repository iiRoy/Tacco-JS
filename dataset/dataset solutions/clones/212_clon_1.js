/*
 * This file contains a JavaScript program designed to calculate the number of trailing zeros
 * in the factorial of a given integer. It reads input from standard input, processes each number,
 * and prints the result to standard output.
 *
 * This is a Type I clone, preserving all identifiers and logic while extensively modifying
 * whitespace and adding comments to visually distinguish it from the original.
 */

( function () {

    // Global variable to store input received from stdin.
    // It is initialized as an empty string and later processed.
    var input = '';


    /**
     * The main entry point function for processing the input.
     * It iterates through the input numbers, calculates trailing zeros, and logs them.
     */
    function main ( ) {

        // Declare local variables used within the main function.
        // inputLen: Stores the length of the processed input array.
        // i: Loop counter for iterating through input numbers.
        // n: Stores the current number being processed.
        // z: Stores the calculated number of trailing zeros.
        var inputLen,
            i,
            n,
            z;


        // Loop through the input array, excluding the last element which is often an empty string
        // due to the final newline character in stdin.
        for ( i = 0 , inputLen = input . length - 1 ; i < inputLen ; i += 1 ) {

            // Parse the current input string element into an integer.
            // The radix 10 is specified for decimal conversion.
            n = parseInt( input[ i ] , 10 );


            // If the parsed number is 0, it signifies the end of valid input
            // according to the problem specification, so the loop is terminated.
            if ( n === 0 ) {

                break; // Exit the loop.

            } else {

                // If the number is not 0, calculate the number of trailing zeros
                // in its factorial using the 'zero' helper function.
                z = zero( n );

                // Output the calculated number of trailing zeros to the console.
                console.log( z );

            } // End of if-else block for handling 'n'.

        } // End of for loop iterating through input.

    } // End of 'main' function definition.


    /**
     * Calculates the number of trailing zeros in the factorial of a given integer 'f'.
     * This is based on Legendre's formula, which counts factors of 5.
     *
     * @param {number} f The integer for which to calculate factorial trailing zeros.
     * @returns {number} The count of trailing zeros.
     */
    function zero ( f ) {

        // Declare local variables for the 'zero' function.
        // j: A temporary variable used in the loop to repeatedly divide by 5.
        // zeroCnt: Accumulates the total count of trailing zeros.
        var j,
            zeroCnt = 0;


        // Loop as long as 'j' divided by 5 is not zero.
        // In each iteration, 'j' is divided by 5 to find powers of 5.
        for ( j = f ; j / 5 !== 0 ; j /= 5 ) {

            // Add the floor of (j / 5) to zeroCnt.
            // This counts multiples of 5, then multiples of 25, then 125, etc.
            zeroCnt += Math.floor( j / 5 );

        } // End of for loop for calculating zeros.

        // Return the final accumulated count of trailing zeros.
        return zeroCnt;

    } // End of 'zero' function definition.


    // --- Node.js specific input/output handling ---

    // Ensure stdin is open and ready to receive data.
    process.stdin.resume( );

    // Set the encoding for stdin to UTF-8.
    process.stdin.setEncoding( 'utf8' );

    // Register an event listener for 'data' chunks from stdin.
    // Each received chunk is appended to the 'input' variable.
    process.stdin.on( 'data' , function ( chunk ) {

        input += chunk; // Concatenate the received data chunk.

    } ); // End of 'data' event listener.


    // Register an event listener for the 'end' of stdin stream.
    // Once all input has been received, process it.
    process.stdin.on( 'end' , function ( ) {

        // Split the accumulated input string by newline characters
        // to get an array of individual numbers (as strings).
        input = input.split( '\n' );

        // Call the main function to begin processing the parsed input.
        main( );

    } ); // End of 'end' event listener.

} () ); // Immediately Invoked Function Expression (IIFE) closure.