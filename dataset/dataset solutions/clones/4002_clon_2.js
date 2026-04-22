// This JavaScript module is designed to process an input string and perform a specific numerical calculation.
'use strict';

/**
 * Performs a calculation on the provided textual data.
 * It expects a numeric value as the first element of the first line.
 *
 * @param {string} sourceText - The entire input string to be processed.
 */
const calculateValue = ( sourceText ) => {

    // First, divide the input string into individual lines,
    // then further split each line by spaces to create a 2D array of strings.
    const processedLines = sourceText
        .split( '\n' )
        .map( ( currentLine ) => {
            return currentLine.split( ' ' );
        } );

    // Extract the primary numerical datum from the first element of the first parsed line.
    const primaryNumber = parseInt( processedLines[0][0], 10 );

    // Compute the final output by dividing the primary number by three and
    // then taking the floor (integer part) of the result.
    console.log( Math.floor( primaryNumber / 3 ) );

};

// Initiate the calculation by reading the content from standard input.
// The input is read as UTF-8 encoded text.
calculateValue( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );