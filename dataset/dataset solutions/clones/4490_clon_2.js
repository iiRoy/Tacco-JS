'use strict'; // Enforces strict JavaScript parsing and error handling for cleaner code.

/**
 * Core processing routine that ingests raw textual data, extracts numerical components,
 * sorts them, and then outputs the sum of the two smallest values.
 *
 * @param {string} sourceText - The entire text content provided as input.
 */
function ProcessInputData ( sourceText )
{
    // First, isolate the initial line from the entire input string.
    // Then, parse this line by splitting it at space characters, yielding an array of stringified numbers.
    let stringifiedNumbers = sourceText
                                .split( '\n' )
                                [ 0 ]
                                .split( ' ' )
                                ;

    // Arrange the array elements in ascending numerical order.
    // The lambda expression (anonymous function) ensures a correct numerical comparison.
    stringifiedNumbers.sort( ( firstElement , secondElement ) => firstElement - secondElement ) ;

    // Convert the first two elements of the sorted array from strings to integers (base 10),
    // calculate their sum, and display the result to the console.
    console.info( Number.parseInt( stringifiedNumbers[ 0 ] , 10 ) + Number.parseInt( stringifiedNumbers[ 1 ] , 10 ) ) ;
}

// Initiate the data processing by calling the main function.
// This involves synchronously reading the content from standard input (`/dev/stdin`)
// using Node.js's file system module, interpreted as UTF-8 encoded text.
ProcessInputData( require( 'node:fs' ) .readFileSync( '/dev/stdin' , 'UTF-8' ) ) ;