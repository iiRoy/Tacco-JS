const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// This line is typically used for local debugging with a file, not for standard input.
// const rawInputData = require('fs').readFileSync('input.txt', 'utf8');

// The input string is processed: leading/trailing whitespace removed, then split into an array of strings by newline.
const processedLines = rawInputData.trim().split('\n');

// Iterate through each line obtained from the input.
processedLines.forEach(function(currentInputLine) {
    // For the current line, split it by spaces and convert each part to a number.
    const numericCoordinates = currentInputLine.split(' ').map(Number);

    // Initialize a string variable to hold the determination result.
    let finalOutcome = "NO";

    // Calculate the change in X and Y for the first line segment.
    // Points are (numericCoordinates[0], numericCoordinates[1]) and (numericCoordinates[2], numericCoordinates[3]).
    const segmentOneDeltaX = numericCoordinates[2] - numericCoordinates[0];
    const segmentOneDeltaY = numericCoordinates[3] - numericCoordinates[1];

    // Calculate the change in X and Y for the second line segment.
    // Points are (numericCoordinates[4], numericCoordinates[5]) and (numericCoordinates[6], numericCoordinates[7]).
    const segmentTwoDeltaX = numericCoordinates[6] - numericCoordinates[4];
    const segmentTwoDeltaY = numericCoordinates[7] - numericCoordinates[5];

    // Compute the slopes of the two segments. Division by zero will result in Infinity or -Infinity,
    // which is handled by the subsequent conditional logic.
    const slopeOfFirst = segmentOneDeltaY / segmentOneDeltaX;
    const slopeOfSecond = segmentTwoDeltaY / segmentTwoDeltaX;

    // Check for perpendicularity conditions.
    // Condition 1: If the first segment is vertical (deltaX is zero).
    if (segmentOneDeltaX === 0) {
        // A vertical line is perpendicular to a horizontal line (deltaY for the other segment is zero).
        if (segmentTwoDeltaY === 0) {
            finalOutcome = "YES";
        }
    }
    // Condition 2: If the second segment is vertical (deltaX is zero).
    else if (segmentTwoDeltaX === 0) {
        // A vertical line is perpendicular to a horizontal line (deltaY for the other segment is zero).
        if (segmentOneDeltaY === 0) {
            finalOutcome = "YES";
        }
    }
    // Condition 3: Neither segment is vertical. Check if the product of their slopes is -1.
    // Using a small epsilon (1e-10) for floating-point comparison to account for precision issues.
    else if (Math.abs(slopeOfFirst * slopeOfSecond + 1) < 1e-10) {
        finalOutcome = "YES";
    }

    // Output the result for the current line's segments.
    console.log(finalOutcome);
});
