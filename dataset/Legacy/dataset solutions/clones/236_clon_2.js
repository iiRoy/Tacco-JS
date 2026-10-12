var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data by trimming whitespace and splitting into individual lines.
var lineSegmentsData = (rawData.trim()).split("\n");

// Iterate through each line of input data.
for (let idx = 0; idx < lineSegmentsData.length; idx++) {
    // Parse the current line into an array of numbers, representing coordinates.
    var currentCoords = lineSegmentsData[idx].split(" ").map(Number);

    // Use an immediately invoked function expression (IIFE) to encapsulate the logic
    // for checking perpendicularity of two line segments.
    (function (coordA1, coordB1, coordA2, coordB2, coordA3, coordB3, coordA4, coordB4) {
        // Declare variables to store the slopes of the two line segments.
        let slopeOne;
        let slopeTwo;

        // Calculate the slope of the first line segment (defined by (coordA1, coordB1) and (coordA2, coordB2)).
        // Handle the case of a vertical line (division by zero).
        if (coordA2 - coordA1 !== 0) {
            slopeOne = ((coordB2 - coordB1) / (coordA2 - coordA1));
        } else {
            slopeOne = Infinity; // Represents a vertical line.
        }

        // Calculate the slope of the second line segment (defined by (coordA3, coordB3) and (coordA4, coordB4)).
        // Handle the case of a vertical line.
        if (coordA4 - coordA3 !== 0) {
            slopeTwo = (coordB4 - coordB3) / (coordA4 - coordA3);
        } else {
            slopeTwo = Infinity; // Represents a vertical line.
        }

        // Initialize the result string to "NO", assuming lines are not perpendicular.
        let resultString = "NO";

        // Check for perpendicularity conditions:
        // 1. One line is horizontal (slope 0) and the other is vertical (slope Infinity).
        if (slopeOne === 0 && slopeTwo === Infinity) {
            resultString = "YES";
        }
        // 2. One line is vertical (slope Infinity) and the other is horizontal (slope 0).
        if (slopeTwo === 0 && slopeOne === Infinity) {
            resultString = "YES";
        }
        // 3. The product of their slopes is -1 (or very close to -1 due to floating point precision).
        //    This covers general cases where neither line is perfectly horizontal or vertical.
        //    The condition `slopeOne * slopeTwo + 1 < 1.0e-8` checks if `slopeOne * slopeTwo` is approximately -1.
        if (slopeOne * slopeTwo + 1 < 1.0e-8) {
            resultString = "YES";
        }

        // Output the determination of perpendicularity.
        console.log(resultString);

    }).apply(null, currentCoords); // Apply the parsed coordinates as arguments to the IIFE.
}
