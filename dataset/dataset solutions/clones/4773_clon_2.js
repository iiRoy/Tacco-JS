"use strict"; // Enable strict mode for better error handling

const processInputData = ( incomingString ) => {
    // Clean and split the initial input string into lines
    incomingString = incomingString.trim()
                                   .split( "\n" );

    // Take the first line and break it down by comma delimiters
    const segmentList = incomingString[0].split( "," );

    // Print the collected segments joined by a space
    console.log( segmentList.join( " " ) );
};

// Execute the primary function, reading data from standard input
processInputData( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );