/*
 * This JavaScript program reads commands from standard input,
 * processes them, and outputs results.
 * It simulates a basic stack-like or deque-like behavior.
 * This is a Type I clone, meaning only whitespace and comments are altered.
 */

// Initialize the 'input' variable by reading from standard input.
var input    = require( 'fs' ) . readFileSync( '/dev/stdin' ,  'utf8' );

// Process the raw input string: trim it and split into lines.
var arr      = input . trim() . split( "\n" ); // 'arr' will hold individual commands.

// Declare and initialize the primary data arrays.
var a        = [ ] ;    // 'a' acts as the operational data structure (e.g., a stack).
var ans      = [ ] ;    // 'ans' stores results from 'pop' operations for final output.

/*
 * Main processing loop:
 * It continues indefinitely until a specific termination command ("quit") is encountered.
 * Each iteration processes one command from the 'arr' array.
 */
while ( true )
{
    // Retrieve the next command from the beginning of the 'arr' array.
    // The 'shift()' method removes the first element and returns it.
    var x = arr . shift ( ) ;

    // Check if the current command signals the end of input processing.
    if ( x == "quit" )
    {
        break ; // If "quit" is found, exit the 'while' loop immediately.
    }

    // Conditional logic to handle different types of commands.
    if ( x == "pop" )
    {
        // If the command is "pop", an element is removed from 'a'
        // and subsequently added to the 'ans' array.
        ans . push ( a . shift ( ) ) ;
    }
    else
    {
        // For any other command (implicitly an "add" or "push" operation),
        // extract the value from the command string and add it to the front of 'a'.
        // The command is expected to be in the format "command value".
        a . unshift ( x . split ( " " ) [ 1 ] ) ;
    }
} // End of the primary command processing loop.

// After all commands have been processed and the loop has terminated,
// join all elements collected in the 'ans' array with newline characters
// and print the resulting string to the console.
console . log ( ans . join ( "\n" ) ) ;

// This marks the successful completion of the script execution.
// No further actions are performed.