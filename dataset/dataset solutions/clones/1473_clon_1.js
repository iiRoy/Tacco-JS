( function ( input ) {
    // This is an immediately invoked function expression (IIFE)
    // It takes the raw input string as an argument.

    // First, process the input string by splitting it into an array of lines.
    input = input.split( "\n" ) ;

    // Declare and initialize an array to hold parsed data (commands and arguments).
    var data = [ ] ;

    // Declare and initialize an array that will serve as our collection of stacks.
    // Each element in this array can itself be an array representing a stack.
    var stack = [ ] ;

    // Initialize an index to keep track of the current line being processed.
    var index = 0 ;

    // Loop through each line of the raw input to parse it.
    for ( var i = 0 ; i < input.length ; i ++ ) {
        // For each line, split it by spaces to get individual command parts/arguments.
        data[ i ] = input[ i ].split( " " ) ;
    }

    // Increment the index. This effectively skips the first line of input,
    // assuming it might be a header or not a command to be processed.
    index ++ ;

    // Main processing loop: continue as long as the current command is not "quit".
    while ( data[ index ][ 0 ] != "quit" ) {

        // Use a switch statement to handle different types of commands.
        switch ( data[ index ][ 0 ] ) {

            case "push" :
                // Handle the "push" command.
                // It means to push a value onto a specified stack.

                // Check if the target stack (identified by data[index][1]) already exists and is an Array.
                if ( ! ( stack[ data[ index ][ 1 ] ] instanceof Array ) ) {
                    // If it doesn't exist or isn't an array, initialize it as an empty array.
                    stack[ data[ index ][ 1 ] ] = [ ] ;
                }
                // Push the value (data[index][2]) onto the target stack.
                stack[ data[ index ][ 1 ] ].push( data[ index ][ 2 ] ) ;
                // Move to the next command in the input.
                index ++ ;
                // Exit the switch statement.
                break ;

            case "pop" :
                // Handle the "pop" command.
                // It means to remove and return the top element from a specified stack.

                // Pop the top element from the specified stack (data[index][1]).
                var p = stack[ data[ index ][ 1 ] ].pop( ) ;
                // Log the popped element to the console.
                console.log( p ) ;
                // Move to the next command.
                index ++ ;
                // Exit the switch statement.
                break ;

            case "move" :
                // Handle the "move" command.
                // It means to move the top element from one stack to another.

                // First, ensure the destination stack (data[index][2]) exists and is an Array.
                if ( ! ( stack[ data[ index ][ 2 ] ] instanceof Array ) ) {
                    // If not, initialize it as an empty array.
                    stack[ data[ index ][ 2 ] ] = [ ] ;
                }
                // Pop the top element from the source stack (data[index][1]).
                var m = stack[ data[ index ][ 1 ] ].pop( ) ;
                // Push the popped element (m) onto the destination stack (data[index][2]).
                stack[ data[ index ][ 2 ] ].push( m ) ;
                // Move to the next command.
                index ++ ;
                // Exit the switch statement.
                break ;

        } // End of switch statement.

    } // End of while loop.

// The IIFE is immediately invoked with the result of reading a file.
// It reads from standard input ("/dev/stdin") as a UTF-8 string.
} ) ( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;