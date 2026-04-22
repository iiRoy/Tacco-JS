function executeOperations(commandStrings)
{
    // This array will hold our items, acting as a LIFO stack.
    let elementPile = [ ];

    // Loop indefinitely until a 'quit' command is encountered.
    for ( let commandIndex = 0; ; commandIndex++ )
    {
        const currentCommand = commandStrings[ commandIndex ];

        // Check if the current command indicates termination.
        if ( currentCommand.match( /^quit/ ) )
        {
            break; // Exit the loop.
        }
        // Check if the command is to add an item to the pile.
        else if ( currentCommand.match( /^push/ ) )
        {
            // Extract the item to be pushed from the command string.
            const payload = currentCommand.split( /\s+/ )[ 1 ];
            elementPile.push( payload );
        }
        // Check if the command is to remove an item from the pile.
        else if ( currentCommand.match( /^pop/ ) )
        {
            // Remove and retrieve the top item.
            const payload = elementPile.pop( );
            console.log( payload ); // Display the retrieved item.
        }
    }
}

// Prepare to receive input from standard input.
const inputSegments = [ ];
process.stdin.on( 'data', function( segmentPart ) {
    inputSegments.push( segmentPart ); // Accumulate incoming data fragments.
} );

// Once all input has been received, process it.
process.stdin.on( 'end', function( ) {
    // Join all segments and split into individual command lines.
    const commandStrings = inputSegments.join( '' ).split( '\n' );
    executeOperations( commandStrings ); // Begin processing the commands.
} );