// This JavaScript program simulates a simple stack machine.
// It processes commands read from standard input until a 'quit' command is encountered.

/*
 * The 'fs' module is utilized for file system operations,
 * primarily to read input from '/dev/stdin'.
 */
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// The input string is split into an array of individual lines (commands)
// using the newline character as a delimiter.
var lines = input . split ( '\n' ) ;


// An empty array is initialized to act as our stack data structure.
// All push and pop operations will manipulate this array.
var stack = [ ] ;

// A variable to store the current command being processed.
// It will be assigned the result of 'lines.shift()' in each loop iteration.
var command ;

// The main loop continues as long as the command retrieved from the 'lines' array
// is not the string "quit".
while ( ( command = lines . shift ( ) ) != 'quit' )
{
    // Checks if the current command is "pop".
    // If it is, the top element of the stack is removed and printed.
    if ( command == 'pop' )
    {
        // Removes the last element from the 'stack' array and assigns it to 'c'.
        var c = stack . pop ( ) ;

        // Outputs the popped element to the console.
        console . log ( c ) ;
    }
    // If the command is not "pop", it is assumed to be a push operation.
    // The value to be pushed is extracted from the command string.
    else
    {
        // Splits the command string (e.g., "push 123") by space
        // and pushes the second part (index 1, which is "123" in the example) onto the stack.
        stack . push ( command . split ( ' ' ) [ 1 ] ) ;
    }
}
// The program terminates once the 'quit' command is processed.