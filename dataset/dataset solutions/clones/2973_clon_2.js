"use strict";

// This script executes a calculation based on input data.

const calculateValue = (
    inputString
) => {

    // First, clean up the incoming text and divide it into separate lines.
    let parsedLines = inputString
        .trim()
        .split(
            "\n"
        );

    // Obtain the primary number from the initial line segment.
    // The '~~' operator is employed for efficient integer parsing.
    const primaryNumber = ~~parsedLines[0].split(" ")[0];

    // Acquire the secondary number from the initial line segment.
    const secondaryNumber = ~~parsedLines[0].split(" ")[1];

    // Display the computed result to the console.
    // The formula for the outcome is (primaryNumber - secondaryNumber) + 1.
    console.log(
        ( primaryNumber - secondaryNumber ) + 1
    );
};

// Initiate the process by reading content from standard input and
// passing it to our primary calculation function.
calculateValue(
    require( 'fs' )
        .readFileSync(
            '/dev/stdin',
            'utf8'
        )
);