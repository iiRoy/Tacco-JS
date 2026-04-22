// This script initializes a Node.js environment to read input line by line from standard input.

process.stdin.resume(); /* This keeps the process alive and allows stdin to continue emitting events. */

process.stdin.setEncoding( 'utf8' ); // Configure the standard input stream to decode data as UTF-8 strings.


var   lines   =   []; // Declare an array to hold all the lines read from stdin.

// Create an interface for reading data from a Readable stream (like process.stdin) one line at a time.
var reader = require('readline') . createInterface ( {
    input   : process.stdin,  // Specify standard input as the source for reading lines.
    output  : process.stdout  // Specify standard output (though not explicitly written to by reader in this case).
} ) ;


// Attach an event listener to the 'line' event of the reader interface.
// This function will be called every time a new line of input is received.
reader . on ( 'line' , ( line ) => {
    lines . push ( line ) ; // Add the current line received to our 'lines' array.
} ) ;


// Attach an event listener to the 'close' event of the reader interface.
// This function executes once the input stream has ended (e.g., EOF is received).
reader . on ( 'close' , ( ) => {

    // On close, we process the first line of input.
    // It's expected to contain three space-separated numbers.
    // These are parsed as BigInts and assigned to constants A, B, and C.
    const   [ A , B , C ]   =   lines [ 0 ] . split ( " " ) . map ( v => BigInt ( v ) ) ;


    // Check if any of the three BigInt numbers (A, B, or C) is even.
    // An even BigInt has a remainder of 0 when divided by 2n.
    if ( A % 2n == 0n || B % 2n == 0n || C % 2n == 0n ) {
        console . log ( 0 ) ; // If any number is even, print 0 to the console.
    } else {
        // If all three numbers (A, B, C) are odd,
        // calculate the products A*B, B*C, and A*C.
        // Then find the minimum among these three products using the 'min' function.
        // Finally, convert the minimum BigInt result to a string and print it.
        console . log ( min ( A * B , B * C , A * C ) . toString ( ) ) ;
    }

} ) ;


// Define a global function named 'min' using an arrow function syntax.
// This function accepts a variable number of arguments (rest parameter 'a').
// It uses the 'reduce' method to find the smallest value among its arguments.
// The initial accumulator value for reduce is set to the first element of 'a'.
min   =   ( ... a )   => {
    return   a . reduce ( ( a , b ) =>   a < b   ?   a : b ,   a [ 0 ] )
} ;