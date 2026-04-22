'use strict';
// This module defines a function to process numerical input from a file.
const handleNumericData = ( initialInput ) => {
    // The first line of the input is expected to contain space-separated integers.
    // We parse these string values into actual integer numbers.
    initialInput = initialInput[ 0 ]
        .split( ' ' )
        .map( ( stringSegment ) => {
            // Using radix 10 for decimal conversion.
            return parseInt( stringSegment, 10 );
        } );

    // Assigning the parsed numeric components to distinct, descriptive variables.
    const primaryThreshold = initialInput[ 0 ];
    const valueOne = initialInput[ 1 ];
    const valueTwo = initialInput[ 2 ];

    // Determine the output based on a specific condition:
    // If the sum of 'valueOne' and 'valueTwo' exceeds 'primaryThreshold',
    // calculate their combined excess; otherwise, the result is zero.
    console.log( ( valueOne + valueTwo > primaryThreshold )
        ? ( valueOne + valueTwo - primaryThreshold )
        : 0
    );
};

// Entry point: Read content from standard input, split it by newlines,
// and then pass the resulting array to our processing function.
handleNumericData(
    require( "fs" )
        .readFileSync( "/dev/stdin", "utf-8" )
        .split( '\n' )
);