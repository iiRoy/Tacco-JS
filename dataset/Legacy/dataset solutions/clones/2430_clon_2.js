function processInput(inputData) {
    // The first line of the input is expected to contain a value, which we extract.
    var numPointsStr = inputData.split("\n")[0];

    // Split the entire input string into an array of individual lines.
    var inputLines = inputData.split("\n");

    // Initialize an empty array to store the parsed coordinate pairs.
    var parsedPoints = [];

    // Iterate through the input lines, starting from the second line (index 1),
    // as the first line was already processed for 'numPointsStr'.
    for (let idx = 1; idx < inputLines.length; idx++) {
        // For each relevant line, split it by any whitespace to get the two coordinate values,
        // and add this array of string coordinates to our 'parsedPoints' collection.
        parsedPoints.push(inputLines[idx].split(/\s/g));
    }

    // Initialize a variable to accumulate the sum of all pairwise distances.
    var totalDistance = 0;

    // Use nested loops to calculate the Euclidean distance between every unique pair of points.
    // The outer loop iterates from the first point up to the second-to-last point.
    for (let outerIdx = 0; outerIdx < parsedPoints.length - 1; outerIdx++) {
        // The inner loop iterates from the point immediately following 'outerIdx' to the last point.
        for (let innerIdx = outerIdx + 1; innerIdx < parsedPoints.length; innerIdx++) {
            // Retrieve the x and y coordinates for the current pair of points.
            // Note: JavaScript's Math functions will implicitly convert these string values to numbers.
            let x1 = parsedPoints[outerIdx][0];
            let y1 = parsedPoints[outerIdx][1];
            let x2 = parsedPoints[innerIdx][0];
            let y2 = parsedPoints[innerIdx][1];

            // Calculate the squared difference in x-coordinates and y-coordinates.
            let deltaXSquared = Math.pow(x1 - x2, 2);
            let deltaYSquared = Math.pow(y1 - y2, 2);

            // Add the Euclidean distance (sqrt(deltaX^2 + deltaY^2)) to the total sum.
            totalDistance += Math.sqrt(deltaXSquared + deltaYSquared);
        }
    }

    // Perform the final calculation as specified by the algorithm:
    // (total accumulated distance * 2) divided by the value from the first input line.
    console.log(totalDistance * 2 / numPointsStr);
}

// Read the entire content of standard input as a UTF-8 string
// and then pass it to our processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
