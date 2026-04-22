'use strict'
// This directive enforces strict mode, which helps catch common coding errors and "unsafe" actions.

// Define a function named 'read' that will manage input tokenization.
const read = ( ) => {

    /**
     * @generator
     * @function iterInput
     * @description A generator function to read input from stdin and yield tokens.
     *              It reads the entire input, trims whitespace, and splits by any sequence of whitespace.
     */
    function* iterInput ( ) {
        // Read the entire content of standard input synchronously.
        // The 'utf8' encoding is specified for text processing.
        const input = require('fs').readFileSync ( '/dev/stdin' ,  'utf8' ) ;

        // Iterate over each token obtained by trimming the input and splitting it by whitespace.
        for ( const token   of   input.trim ( ).split ( / \s+ / ) ) {
            // Yield each token one by one.
            yield   token ;
        }
    }


    // Create an iterator instance from the iterInput generator.
    const it = iterInput ( ) ;

    // Return a closure (an arrow function) that, when called, will provide the next token.
    return ( ) => {
        // Advance the iterator and return its current value.
        return it.next ( ).value ;
    }

} // End of 'read' function definition.


// The main function where the core logic of the program resides.
// It takes a 'next' function (which is expected to provide input tokens) as an argument.
const main = ( next ) => {

    // Initialize an array 'abc' with three elements.
    // Each element is populated by calling the 'next' input function and converting its result to a number.
    const abc = Array.from ( { length : 3 } ) . map ( ( ) =>   + next ( ) ) ;

    // Sort the 'abc' array in ascending order.
    // For numbers, the default sort behavior works as expected.
    abc . sort ( ) ;

    // Calculate the result: (third element * 10) + first element + second element.
    // Then, print the result to the console.
    console.log ( abc [ 2 ]   *   10   +   abc [ 0 ]   +   abc [ 1 ] ) ;

} // End of 'main' function definition.


// Execute the main function, passing the 'read' function's return value (the token provider) as its argument.
main ( read ( ) ) ;
// The program starts execution from this point.