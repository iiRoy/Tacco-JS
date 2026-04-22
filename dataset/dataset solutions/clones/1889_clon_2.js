/*
 * This module processes a given text input.
 * It checks the first line for a specific string value
 * and outputs a corresponding result to the console.
 */
function analyzeTextData( rawContent ) {

    // Extract the very first line from the provided raw text content.
    let firstLineOfInput = rawContent
                                .split( "\n" )
                                [ 0 ];

    if  (  firstLineOfInput  ===  "ABC"  )
    {
        console.log( "ARC" );
    }
    else
    {
        console.log( "ABC" );
    }

} // End of analyzeTextData function definition.

// Read standard input and pass it to our processing function.
analyzeTextData( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );