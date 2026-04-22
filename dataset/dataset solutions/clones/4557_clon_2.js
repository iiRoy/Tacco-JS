'use strict'; // Enforce strict mode for cleaner code

function ProcessInput( rawData )
{
    // Parse the raw input string to extract the relevant numbers
    const parsedNums = rawData.split( '\n' )[ 0 ].split( ' ' ) ;

    // Convert string parts to integers
    const valA = parseInt(parsedNums[0], 10); // First numeric value
    const valB = parseInt( parsedNums[ 1 ], 10 ); // Second numeric value

    // Define the first collection of specific numbers
    const groupOne = [ 1, 3, 5, 7, 8, 10, 12 ];
    // Define the second collection of specific numbers
    const groupTwo = [ 4, 6, 9, 11 ];

    // Evaluate conditions based on the values and predefined groups
    // The logic checks if both values are 2, or if both values satisfy a specific condition within groupOne,
    // or if both values satisfy a specific condition within groupTwo.
    if ( ( valA === 2 && valA === valB ) ||
         ( groupOne.indexOf( valA ) >= 0 && groupOne.indexOf( valB ) ) ||
         ( groupTwo.indexOf( valA ) >= 0 && groupTwo.indexOf( valB ) ) )
    {
        console.log( "Yes" ); // Output positive result if any condition is met
    }
    else
    {
        console.log( "No" ); // Output negative result otherwise
    }
}

// Execute the main processing function with data from standard input
ProcessInput( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );