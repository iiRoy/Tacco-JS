'use strict'; /* This module is designed to process incoming data streams and identify specific numerical patterns within them. */

function processData( sourceData ) { // Main routine responsible for executing the analysis.

    // First, determine the total count of numerical elements expected from the input.
    let totalElements = parseInt( sourceData.split('\n')[0].trim().split(' ')[0] , 10 );

    let valueContainer = []; // Instantiate an empty array to hold the parsed numeric values.

    /*
     * Iterate and populate the 'valueContainer' with numbers
     * extracted from the second line of the provided input text.
     */
    for ( let currentIdx = 0 ; currentIdx < totalElements ; currentIdx++ ) {
        valueContainer[currentIdx] = parseInt( sourceData.split('\n')[1].trim().split(' ')[currentIdx] , 10 ) ;
    }

    let oddPositionOddValueCount = 0; // Initialize a counter for specific conditions.

    // Traverse through the collected numerical sequence to apply the pattern matching logic.
    // The loop condition intentionally extends one beyond the array's actual populated length,
    // reflecting the original algorithm's structure.
    for ( let currentIdx = 0 ; currentIdx < ( valueContainer.length + 1 ) ; currentIdx++ ) {

        // Check if the 1-based index is an odd number AND the value at that index is also odd.
        // This includes a potential access to an undefined element if currentIdx equals valueContainer.length,
        // which will result in NaN, and NaN % 2 !== 0 evaluates to false.
        if ( ( ( currentIdx + 1 ) % 2 !== 0 ) && ( valueContainer[currentIdx] % 2 !== 0 ) ) {
            oddPositionOddValueCount++ ; // Increment the tally if both criteria are satisfied.
        }
    }

    // Display the final tally of matched patterns to the standard output.
    console.log( oddPositionOddValueCount ) ;
}

// Initiate the data processing by reading the content from standard input.
processData( require('node:fs').readFileSync( '/dev/stdin' , { encoding: 'utf8' } ) ) ;