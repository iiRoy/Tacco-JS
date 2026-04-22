/**
 * This script demonstrates basic input processing and stack operations
 * using Node.js standard I/O.
 * It includes utility functions for repetitive tasks and input handling.
 *
 * All identifiers, keywords, and operators are preserved exactly
 * as in the original code. Only whitespace and comments have been altered
 * to create a Type I clone.
 */


/**
 * The main function orchestrates the program's logic.
 * It processes input numbers, acting as a stack-like structure.
 */
function main () {

    // Initialize an empty array to serve as our stack.
    var s = [ ];

    // Declare a variable to hold the scanned input value.
    var x;

    // Loop indefinitely, processing input values.
    // The condition 'x === x' is always true for non-NaN values,
    // effectively creating an infinite loop until an error or external break.
    while ( ( x = scan ( ) ) , x === x ) {

        // Check if the scanned value is zero.
        if ( x === 0 ) {
            // If it's zero, pop the last element from the stack and print it.
            print ( s.pop ( ) );
        }
        else {
            // Otherwise, push the scanned value onto the stack.
            s.push ( x );
        }

    } // End of while loop.

} // End of main function.


/*
 * This function 'rep' is a utility for repetitive tasks.
 * It can act as a simple loop or a loop with a callback.
 */
function rep ( a , b , c ) {

    // If 'c' (the callback) is not provided,
    // then 'b' becomes the callback, 'a' becomes the upper limit,
    // and the loop starts from 0.
    if ( c === undefined ) {
        c = b; // 'c' now holds the function that was passed as 'b'
        b = a; // 'b' now holds the value that was passed as 'a' (the loop limit)
        a = 0; // 'a' is reset to 0 for the loop start
    }

    // Loop from 'a' up to (but not including) 'b'.
    for ( var i = a ; i < b ; ++i ) {

        // Execute the callback function 'c' with the current index 'i'.
        // If the callback returns 'false', then break out of the loop.
        if ( c ( i ) === false ) {
            break; // Exit the loop prematurely.
        }

    } // End of for loop.

} // End of rep function.


// Ensure the standard input stream remains open.
process.stdin.resume ( );

// Set the encoding for incoming data to UTF-8.
process.stdin.setEncoding ( 'utf8' );


// Global variable to store all input data.
var input = '';

// Global index to track the current position in the input array.
var input_index = 0;


/**
 * Reads the next token from the input stream.
 * @param {string} [type] - Optional. If 'string', returns the token as a string.
 *                          Otherwise, attempts to convert it to a number.
 * @returns {string|number} The next input token.
 */
function scan ( type ) {

    // Check if the requested type is 'string'.
    if ( type === 'string' ) {
        // Return the token as a string and increment the index.
        return input [ input_index++ ];
    }
    else {
        // Convert the token to a number (using unary plus operator)
        // and return it, then increment the index.
        return +input [ input_index++ ];
    }

} // End of scan function.


/**
 * Prints a value to the standard output, followed by a newline.
 * This is a wrapper around console.log.
 * @param {*} val - The value to be printed.
 */
function print ( val ) {

    // Use console.log to output the value.
    console.log ( val );

} // End of print function.


// Attach an event listener for 'data' events on the standard input stream.
// This accumulates all incoming data chunks into the 'input' variable.
process.stdin.on ( 'data' , function ( chunk ) {
    input += chunk; // Append the new chunk of data to the 'input' string.
} ); // End of 'data' event listener.


// Attach an event listener for the 'end' event on the standard input stream.
// This signifies that all input has been received.
process.stdin.on ( 'end' , function ( ) {
    // Process the accumulated input:
    // 1. Trim leading/trailing whitespace.
    // 2. Split the string into an array of tokens based on any whitespace.
    input = input.trim ( ).split ( /\s+/ );

    // Once input is processed, call the main function to start program execution.
    main ( );
} ); // End of 'end' event listener.