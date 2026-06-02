function processInput(inputData) {
    // Split the entire input string into an array of lines.
    var linesArray = inputData.split("\n");

    // Parse the boundary length (L) and the number of iterations (N) from the first line.
    var boundaryLength = parseInt(linesArray[0].split(" ")[0]);
    var iterationCount = parseInt(linesArray[0].split(" ")[1]);

    // Remove the first line, as it has been processed.
    linesArray.shift();

    // The remaining lines represent the coordinates for processing.
    var coordinateList = linesArray;

    // Initialize the current position to the starting point.
    var currentPosition = 0;

    // Initialize the total accumulated distance.
    var cumulativeDistance = 0;

    // Iterate through the coordinates for the specified number of times.
    for (var loopIndex = 0; loopIndex < iterationCount; loopIndex++) {
        // Get the first coordinate from the list.
        var firstCoordinate = parseInt(coordinateList[0]);

        // Get the last coordinate from the list.
        var lastCoordinate = parseInt(coordinateList[coordinateList.length - 1]);

        // Calculate the distance to move forward to the first coordinate.
        var distanceToFirst = firstCoordinate - currentPosition;

        // Calculate the distance to move backward to the last coordinate, considering the boundary.
        var distanceToLast = (boundaryLength - lastCoordinate) + currentPosition;

        // Output the current position for debugging or tracking.
        console.log("now:" + currentPosition);
        // Output the current total distance.
        console.log("total:" + cumulativeDistance);

        // Decide whether to move forward or backward based on which path is longer.
        if (distanceToFirst > distanceToLast) {
            // If moving forward is longer, add that distance to the total.
            cumulativeDistance = cumulativeDistance + (distanceToFirst);
            // Remove the first coordinate as it has been visited.
            coordinateList.shift();
            // Update the current position to the first coordinate.
            currentPosition = firstCoordinate;
        } else {
            // Otherwise, add the backward distance to the total.
            cumulativeDistance = cumulativeDistance + (distanceToLast);
            // Remove the last coordinate as it has been visited.
            coordinateList.pop();
            // Update the current position to the last coordinate.
            currentPosition = lastCoordinate;
        }
    }

    // After the loop completes, print the final cumulative distance.
    console.log(cumulativeDistance);
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
