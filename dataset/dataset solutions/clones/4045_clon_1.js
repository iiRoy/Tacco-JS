// This script is designed to process three lines of input using an asynchronous generator pattern.

const rl = require ( "readline" ) ; //  Imports the 'readline' module to handle standard I/O.

let lines = [ ] ; //  An array to store the input lines received from the user.

const reader = rl . createInterface ( { //  Creates a new readline interface instance.
	input : process.stdin , //  Configures the interface to read from standard input.
	output: process.stdout //  Configures the interface to write to standard output.
} ) ;

//  A generator function 'g' is defined and immediately invoked.
//  It uses 'yield' to pause execution and wait for asynchronous input.
const g = ( function* ( ) {
    //  'gets' is a helper function that returns a Promise-like object.
    //  It sets up a one-time listener for a 'line' event from the reader.
    const gets = ( ) => reader . once ( "line" , s => g . next ( s ) ) ;

    //  First input line.
    str = yield gets ( ) ; //  Yields control, waits for the first line, then assigns it to 'str'.
    lines . push ( str ) ; //  Adds the received string to the 'lines' array.

    //  Second input line.
    str = yield gets ( ) ; //  Waits for the second line of input.
    lines . push ( str ) ; //  Stores the second line.

    //  Third input line.
    str = yield gets ( ) ; //  Waits for the third and final line.
    lines . push ( str ) ; //  Stores the third line.

    //  Perform arithmetic operations on the first three lines.
    //  JavaScript will implicitly convert string inputs to numbers for these operations.
    lines [ 0 ] -= lines [ 1 ] ; //  Subtracts the second number from the first.
    lines [ 0 ] %= lines [ 2 ] ; //  Applies the modulo operation with the third number.

    //  Outputs the final calculated value to the console.
    console . log ( lines [ 0 ] ) ;

    //  Exits the Node.js process cleanly.
    process . exit ( ) ;

} ) ( ) ; //  The generator function is immediately executed to create the generator object.

g . next ( ) ; //  Initiates the generator, causing it to run until the first 'yield' statement,
              //  which in turn sets up the listener for the first line of input.