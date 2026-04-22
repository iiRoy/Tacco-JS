process.stdin.resume( );
process.stdin.setEncoding( "utf8" );

// Begin monitoring the standard input for incoming information.
process.stdin.on ( "data", function ( inputSegment ) {

    // Process the received data by splitting it into distinct lines.
    let lineCollection = inputSegment.split ( '\n' );

    // Implement a safeguard: if too many lines are provided, halt execution.
    if ( lineCollection.length > 2 )
    {
        while ( true );
    }

    // Initialize a regular expression to locate pairs of numbers.
    const numericPattern = /(\d+)\s(\d+)/;

    // Process each individual line within the collected set.
    for ( let lineCounter = 0; lineCounter < lineCollection.length; lineCounter++ ) {

        // Execute the pattern matching on the current line.
        let matchDetails = numericPattern.exec(lineCollection[lineCounter]);

        // Validate the match: ensure it was successful and captured two numeric groups.
        if ( matchDetails && matchDetails.length === 3 )
        {
            // Convert the captured strings to integers and output their combined value.
            console.log( parseInt(matchDetails[1]) + parseInt(matchDetails[2]) );
        }
    }
} );

// Attach a placeholder function for the standard output stream's completion event.
process.stdout.on ( "end", function ( ) { } );