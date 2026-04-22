// This script processes standard input to simulate a stack/queue behavior.
// It reads numbers from standard input, pushing non-zero numbers
// onto a queue and popping/printing when a zero is encountered.

/*
 * Module dependencies:
 * fs: File System module, used for interacting with standard input.
 */
var fs = require( 'fs' ) ,

    // Determine the total length of the standard input stream.
    length = fs.fstatSync( process.stdin.fd ).size ,

    // Allocate a new Buffer object with the determined length.
    buffer = new Buffer( length ) ,

    // Read data synchronously from standard input into the buffer.
    // Parameters: file descriptor, buffer, offset, length, position.
    bytesRead = fs.readSync( process.stdin.fd , buffer , 0 , length , 0 ) ,

    // Convert the buffer content to a UTF-8 string,
    // then trim leading/trailing whitespace, and finally
    // split the string into an array of lines based on newline characters.
    input = buffer.toString( 'utf8' , 0 , bytesRead ).trim().split( '\n' ) ;


// Program entry point: Invoke the main function.
main( ) ;


/**
 * @function main
 * @description The primary function containing the core logic
 *              for processing input and manipulating the queue.
 * @returns {void}
 */
function main ( )
{
    // Initialize an empty array to serve as our queue structure.
    var queue = [ ] ;

    // Loop through each element (line) in the 'input' array.
    // 'len' variable is pre-calculated for loop optimization.
    for ( var i = 0 , len = input.length ; i < len ; i++ )
    {
        // Convert the current input string element to a number.
        // Subtracting zero is a common JavaScript idiom for type coercion.
        var inp = input[ i ] - 0 ;

        // Check if the numeric input value is truthy (i.e., non-zero).
        if ( inp )
        {
            // If 'inp' is truthy, push it onto the end of the queue.
            queue.push( inp ) ;
        }
        else
        {
            // If 'inp' is falsy (zero), remove and return the last element
            // from the queue, then print it to the console.
            console.log( queue.pop( ) ) ;
        }
    } // End of for loop
} // End of main function definition