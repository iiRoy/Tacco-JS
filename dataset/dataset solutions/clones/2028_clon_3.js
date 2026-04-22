process.stdin.resume(); // Ensures the Node.js event loop keeps running for input
process.stdin.setEncoding('utf8'); // Sets the character encoding for incoming data

// A buffer to accumulate all lines received from standard input
let inputLineBuffer = [];

// Configures the readline interface to process input line by line
const terminalInputProcessor = require('readline').createInterface({
    input: process.stdin,   // Specifies standard input as the source
    output: process.stdout  // Although output isn't strictly used here, it's good practice
});

// Event handler for each new line of input
terminalInputProcessor.on('line', (currentInputRow) => {
    // Removes leading/trailing whitespace and stores the processed line
    inputLineBuffer.push(currentInputRow.trim());
});

// Event handler triggered when the input stream has ended
terminalInputProcessor.on('close', () => {
    // --- Start of Problem-Specific Logic ---

    // Basic validation: Check if enough input lines were provided
    if (inputLineBuffer.length < 2) {
        console.error("Error: Not enough input lines received. Expected at least two.");
        // In a production scenario, you might exit the process here.
        return;
    }

    // Parse the first line, which contains the total perimeter and number of points
    const parameterStrings = inputLineBuffer[0].split(' ');
    // Use parseInt with radix for robust number conversion
    const overallTrackLength = parseInt(parameterStrings[0], 10); // Corresponds to 'k'
    let numberOfPathPoints = parseInt(parameterStrings[1], 10);    // Corresponds to 'n'

    // Validate the parsed numeric parameters
    if (isNaN(overallTrackLength) || isNaN(numberOfPathPoints) || overallTrackLength <= 0 || numberOfPathPoints <= 0) {
        console.error("Input Error: Invalid or non-positive values for track length or number of points.");
        return;
    }

    // Parse the second line into an array of point locations
    const pointCoordinates = inputLineBuffer[1].split(' ').map(coordStr => parseInt(coordStr, 10)); // Corresponds to 'a'

    // Data consistency check: Does the number of points match what was declared?
    if (pointCoordinates.length !== numberOfPathPoints) {
        console.warn(`Warning: Declared ${numberOfPathPoints} points, but ${pointCoordinates.length} were provided. Adjusting point count.`);
        numberOfPathPoints = pointCoordinates.length; // Adjust N to actual count
        // If adjusted N is still 0 or less, we should probably stop.
        if (numberOfPathPoints <= 0) {
            console.error("Error: No valid point coordinates found after adjustment.");
            return;
        }
    }

    // Variable to keep track of the maximum distance found between any two consecutive points
    let largestSegmentSpan = 0; // Conceptually 'max'

    // Iterate through the array to find the longest segment between adjacent points
    // This loop covers segments from index 0 to (N-2)
    for (let pointIdx = 0; pointIdx < numberOfPathPoints - 1; pointIdx++) {
        const currentSegmentGap = pointCoordinates[pointIdx + 1] - pointCoordinates[pointIdx];
        // Update the maximum if the current segment is longer
        if (currentSegmentGap > largestSegmentSpan) {
            largestSegmentSpan = currentSegmentGap;
        }
    }

    // Calculate the 'wrap-around' segment from the last point back to the first point
    // This is equivalent to (overallTrackLength - distance from origin to last point) + (distance from origin to first point)
    // Or, more directly, overallTrackLength - (pointCoordinates[numberOfPathPoints - 1] - pointCoordinates[0])
    const closingSegmentLength = overallTrackLength - pointCoordinates[numberOfPathPoints - 1] + pointCoordinates[0];

    // Compare this final segment with the largest one found so far
    if (closingSegmentLength > largestSegmentSpan) {
        largestSegmentSpan = closingSegmentLength;
    }

    // The problem requires finding the sum of all segments *excluding* the longest one.
    // This is mathematically equivalent to subtracting the longest segment from the total perimeter.
    // This replaces the original logic of creating a full array, finding max, splicing, and reducing.
    const totalDistanceWithoutLongestGap = overallTrackLength - largestSegmentSpan;

    // Output the computed result to standard output
    console.log(totalDistanceWithoutLongestGap);

    // --- End of Problem-Specific Logic ---
});