/* This module handles processing of incoming text data. */
function processEntry( sourceContent )
{
    // Separate the entire input content into individual lines based on newline characters.
    var contentLines = sourceContent.split( '\n' );

    // Extract the second line and then split it by spaces to get specific data points.
    var specificDatum = contentLines[ 1 ].split( ' ' );

    // Check if the second part of the specific data point is '1'.
    if ( specificDatum[ 1 ] === '1' )
    {
        // If it is '1', output the integer 1 to the console.
        console.log( 1 );
    }
    else
    {
        // Otherwise, output the integer 0.
        console.log( 0 );
    }
}

// Invoke the primary processing function with data read from standard input.
processEntry( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );