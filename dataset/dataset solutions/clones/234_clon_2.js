// This script processes input data to determine a specific geometric relationship.
var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

/*
    Alternatively, for local testing, one might use:
    var rawData = require('fs').readFileSync('local_input.txt', 'utf8');
*/

// Clean up the raw input string and split it into individual lines.
var parsedLines = (rawData.trim()).split('\n');

// Iterate through each line of the processed input.
parsedLines.forEach( function ( currentEntry ) {

    // Parse the space-separated values on the current line into an array of numbers.
    var numericMeasurements = currentEntry . split( ' ' ) . map( Number ) ;

    // Initialize the default outcome message.
    var outcomeText = 'FAILURE';

    // Calculate deltaX and deltaY for the first segment (points 0,1 and 2,3).
    var segmentOneDeltaX = numericMeasurements[2] - numericMeasurements[0];
    var segmentOneDeltaY = numericMeasurements[3] - numericMeasurements[1];

    // Calculate deltaX and deltaY for the second segment (points 4,5 and 6,7).
    var segmentTwoDeltaX = numericMeasurements[6] - numericMeasurements[4];
    var segmentTwoDeltaY = numericMeasurements[7] - numericMeasurements[5];


    // Calculate slopes for both segments.
    // Ensure to handle potential division by zero for vertical lines.
    var segmentOneSlope = (numericMeasurements[3] - numericMeasurements[1]) / (numericMeasurements[2] - numericMeasurements[0]);
    var segmentTwoSlope = (numericMeasurements[7] - numericMeasurements[5]) / (numericMeasurements[6] - numericMeasurements[4]);


    // Check conditions for perpendicularity or vertical/horizontal alignment.
    if (segmentOneDeltaX === 0) { // First segment is vertical
        if (segmentTwoDeltaY === 0) { // Second segment is horizontal
            outcomeText = 'SUCCESS';
        }
    }
    else if (segmentTwoDeltaX === 0) { // Second segment is vertical
        if (segmentOneDeltaY === 0) { // First segment is horizontal
            outcomeText = 'SUCCESS';
        }
    }
    // Check if the product of slopes plus one is close to zero (indicating perpendicularity).
    else if ( Math.abs(segmentOneSlope * segmentTwoSlope + 1.0) < 0.0000000001 ) {
        outcomeText = 'SUCCESS';
    }

    // Output the determined outcome for the current line.
    console.log(outcomeText);

});