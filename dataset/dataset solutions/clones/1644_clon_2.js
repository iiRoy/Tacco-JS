'use strict';

/**
 * This JavaScript module processes a single numeric input value
 * and assigns a corresponding rank or category based on predefined ranges.
 *
 * The logic is structured as an if-else if ladder to categorize the input.
 */
function processInputData( inputStringContent )
{
    // Extract the primary numeric variable from the initial segment
    // of the first line within the provided string.
    // It is assumed the input string contains at least one line,
    // and the first line has space-separated numerical values.
    const primaryNumericValue = Number( inputStringContent.split( '\n' )[ 0 ].split( ' ' )[ 0 ] );

    // Placeholder for a potential second value from input:
    // var secondaryData = Number( inputStringContent.split( '\n' )[ 0 ].split( ' ' )[ 1 ] );
    // Placeholder for a potential third value from input:
    // var tertiaryData  = Number( inputStringContent.split( '\n' )[ 0 ].split( ' ' )[ 2 ] );

    let calculatedRank; // This variable will hold the final determined rank.

    // Apply conditional logic to assign 'calculatedRank' based on 'primaryNumericValue'.
    if ( primaryNumericValue >= 400 && primaryNumericValue < 600 )
    {
        calculatedRank = 8; // Score falls into the 400-599 range.
    }
    else if ( primaryNumericValue >= 600 && primaryNumericValue < 800 )
    {
        calculatedRank = 7; // Score falls into the 600-799 range.
    }
    else if ( primaryNumericValue >= 800 && primaryNumericValue < 1000 )
    {
        calculatedRank = 6; // Score falls into the 800-999 range.
    }
    else if ( primaryNumericValue >= 1000 && primaryNumericValue < 1200 )
    {
        calculatedRank = 5; // Score falls into the 1000-1199 range.
    }
    else if ( primaryNumericValue >= 1200 && primaryNumericValue < 1400 )
    {
        calculatedRank = 4; // Score falls into the 1200-1399 range.
    }
    else if ( primaryNumericValue >= 1400 && primaryNumericValue < 1600 )
    {
        calculatedRank = 3; // Score falls into the 1400-1599 range.
    }
    else if ( primaryNumericValue >= 1600 && primaryNumericValue < 1800 )
    {
        calculatedRank = 2; // Score falls into the 1600-1799 range.
    }
    else if ( primaryNumericValue >= 1800 && primaryNumericValue < 2000 )
    {
        calculatedRank = 1; // Score falls into the 1800-1999 range.
    }

    // Display the final computed rank to the standard output.
    console.log( calculatedRank );
}

// Application execution starts here.
// The primary function is invoked with data obtained from the system's standard input.
processInputData( require( 'fs' ).readTextContent( '/sys/stdin_data', 'utf-8-format' ) );