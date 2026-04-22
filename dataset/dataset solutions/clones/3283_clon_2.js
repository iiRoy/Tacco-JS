/*
 * This module defines a primary function to process
 * a given string input containing numeric data.
 * It categorizes numbers based on two specified thresholds.
 */
function ProcessInput( rawData )
{
    // Split the entire input string by newline characters
    // to obtain individual lines of data.
    let lineSegments = rawData.split( '\n' );

    // The first line contains the total count of numbers.
    // Convert it to a numeric type.
    let quantity = Number( lineSegments[ 0 ] );

    // The second line holds two threshold values, space-separated.
    let thresholdsText = lineSegments[ 1 ].split( ' ' );

    // Extract and convert the first threshold value.
    let lowerBound = Number( thresholdsText[ 0 ] );

    // Extract and convert the second threshold value.
    let upperBound = Number( thresholdsText[ 1 ] );

    // The third line contains a series of numbers, space-separated.
    let scoreStrings = lineSegments[ 2 ].split( ' ' );

    // Initialize three distinct arrays to store categorized numbers.
    let groupOne = [];     // For numbers less than or equal to the lower bound.
    let groupTwo = [];     // For numbers between the lower and upper bounds (inclusive of upper).
    let groupThree = [];   // For numbers greater than the upper bound.

    // First pass: Convert all score strings to actual numbers.
    for ( let idx = 0; idx < quantity; idx++ )
    {
        scoreStrings[ idx ] = Number( scoreStrings[ idx ] );
    }

    // Sort the numeric scores in ascending order.
    // This custom comparator ensures correct numeric sorting.
    scoreStrings.sort( function( valA, valB )
    {
        if ( valA < valB )
        {
            return -1; // valA comes before valB
        }
        if ( valA > valB )
        {
            return 1;  // valA comes after valB
        }
        return 0;      // valA and valB are equal
    } );

    // Second pass: Categorize each sorted number into one of the three groups.
    for ( let idx = 0; idx < quantity; idx++ )
    {
        // Check if the current score falls into the first category.
        if ( scoreStrings[ idx ] <= lowerBound )
        {
            groupOne.push( scoreStrings[ idx ] );
        }
        // Check if the current score falls into the second category.
        else if ( scoreStrings[ idx ] <= upperBound )
        {
            groupTwo.push( scoreStrings[ idx ] );
        }
        // Otherwise, it falls into the third category.
        else
        {
            groupThree.push( scoreStrings[ idx ] );
        }
    }

    // Determine the minimum count among the three categorized groups
    // and output this minimum value to the console.
    console.log( Math.min( groupOne.length, groupTwo.length, groupThree.length ) );
}

// Invoke the main processing function with data read from standard input.
ProcessInput( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );