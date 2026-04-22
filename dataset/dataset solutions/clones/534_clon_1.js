/* This is a Type I clone example, created by an expert in code clone generation.
   As per the definition, all core elements of the code (identifiers,
   operators, expressions, and logic) are preserved exactly as they were.
   The only alterations made are to whitespace (spacing, indentation, blank lines)
   and the addition of comments. The goal is to make the code
   look visually distinct while remaining functionally identical. */


// Define the primary function for our application.
function    main ( input )
{

    // This function takes an array 'input'
    // and calculates the average of its first two elements.
    // It is assumed that 'input' will contain at least two numeric values
    // (or strings that can be coerced to numbers for arithmetic operations).

    return   ( input [ 0 ]   +   input [ 1 ] )   /   2
    ; // The return statement calculates and sends back the average.

} // End of the 'main' function definition.


/* Declare a global variable to accumulate all incoming data from standard input.
   It's initialized as an empty string. */
var

input    =    ''    ;


// Set up the standard input (stdin) stream to handle incoming data.

process
    .stdin
        .resume ( ) ; // This line ensures that the stdin stream remains open
                     // and ready to receive data from the operating system.

process
    .stdin
        .setEncoding ( 'utf8' ) ; // Specifies that the data received from stdin
                                 // should be interpreted using UTF-8 encoding.


/* Attach an event listener for the 'data' event on the stdin stream.
   This event fires whenever a new chunk of data becomes available. */
process
    .stdin
        .on ( 'data' ,

            function ( chunk )
            {
                // When a 'data' chunk is received, it is appended
                // to our 'input' variable. This accumulates all input
                // until the stream ends.
                input    +=    chunk    ;
            }

        ) ;


/* Attach another event listener for the 'end' event on the stdin stream.
   This event signifies that there is no more data to be read from stdin. */
process
    .stdin
        .on ( 'end' ,

            function ( )
            {

                // Once all input has been received, the accumulated 'input' string
                // is split into an array of strings, using a space character as the delimiter.
                // This prepares the input for the 'main' function.
                input    =    input.split ( ' ' )    ;


                // Finally, the 'main' function is called with the processed input array.
                // The result returned by 'main' is then printed to the console (standard output).
                console.log ( main ( input ) ) ;

            }

        ) ; // End of the 'end' event listener.