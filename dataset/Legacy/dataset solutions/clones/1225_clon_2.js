'use strict';

// This script processes input data from standard input to determine
// if a geometric condition is met based on provided dimensions.
process.stdin.on('data', function(inputDataBuffer) {
    // Convert the incoming data buffer to a string, remove leading/trailing whitespace,
    // and split it into an array of strings using space as a delimiter.
    const parsedValues = inputDataBuffer.toString().trim().split(' ');

    // Parse the string values into numerical types for calculations.
    // The first value represents the width of the boundary.
    const boundaryWidth = Number(parsedValues[0]);
    // The second value represents the height of the boundary.
    const boundaryHeight = Number(parsedValues[1]);
    // The third value is the X-coordinate of the circle's center.
    const circleXCoord = Number(parsedValues[2]);
    // The fourth value is the Y-coordinate of the circle's center.
    const circleYCoord = Number(parsedValues[3]);
    // The fifth value is the radius of the circle.
    const circleRadius = Number(parsedValues[4]);

    // Perform calculations based on the input values.
    // These intermediate variables represent specific derived coordinates.
    const calcXLeft = boundaryWidth - circleXCoord - circleRadius;
    const calcXRight = boundaryWidth - circleXCoord + circleRadius;
    const calcYBottom = boundaryHeight - circleYCoord - circleRadius;
    const calcYTop = boundaryHeight - circleYCoord + circleRadius;

    // Evaluate a complex condition using the calculated values and original boundaries.
    // The logical structure and operators are preserved exactly.
    if (calcXLeft >= 0 && calcXRight <= boundaryWidth && calcYBottom <= 0 && calcYTop >= boundaryHeight) {
        // If the condition is true, print 'Yes' to standard output.
        console.log('Yes');
    } else {
        // Otherwise, print 'No' to standard output.
        console.log('No');
    }
});

// Ensure the standard input stream remains open to receive data.
process.stdin.resume();

// Set the character encoding for standard input to UTF-8.
process.stdin.setEncoding('utf8');
