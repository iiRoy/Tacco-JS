var rawData = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

var commandLines = rawData . trim ( ) . split ( "\n" ) ; // Process the raw input into an array of command strings.

var processingStack = [ ] ; // This array serves as the primary data structure for operations.

var resultCollection = [ ] ; // This array will store the outcomes of 'pop' operations.

while ( true )
{
    var currentCommand = commandLines . shift ( ) ; // Retrieve the next instruction from the list.

    if ( currentCommand === "quit" ) // Check if the termination command has been received.
    {
        break ; // Exit the processing loop if 'quit' is encountered.
    }

    if ( currentCommand === "pop" ) // Handle the 'pop' instruction.
    {
        resultCollection . push ( processingStack . shift ( ) ) ; // Remove an element from the stack and add it to results.
    }
    else // Assume any other command is a 'push' instruction.
    {
        processingStack . unshift ( currentCommand . split ( " " ) [ 1 ] ) ; // Extract the value and add it to the front of the stack.
    }
}

console . log ( resultCollection . join ( "\n" ) ) ; // Display all collected results, separated by newlines.