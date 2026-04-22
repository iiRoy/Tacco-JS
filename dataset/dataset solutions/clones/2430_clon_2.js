// This function processes geographical coordinate data from a text input
function processInputData(inputContent) {
    // The first line of the input typically contains a scaling factor or divisor.
    // It's parsed as a number for subsequent calculations.
    const scalingFactor = Number(inputContent.split('\n')[0]);

    // All lines of the input are separated into an array of strings.
    const rawLinesArray = inputContent.split('\n');

    // An array to store the parsed numerical coordinate pairs (x, y).
    const parsedCoordList = [];

    // Iterate through the input lines, starting from the second line (index 1).
    // The first line was already used for the scaling factor.
    for (let lineIdx = 1; lineIdx < rawLinesArray.length; lineIdx++) {
        // Each coordinate line is split by one or more whitespace characters.
        const partsOfLine = rawLinesArray[lineIdx].split(/\s+/);
        
        // Convert the string parts into numbers and add them as a pair to the list.
        parsedCoordList.push([Number(partsOfLine[0]), Number(partsOfLine[1])]);
    }

    // Initialize a variable to accumulate the sum of distances between all unique pairs of coordinates.
    let totalAccumulatedDistance = 0.0;

    // Outer loop: iterates through each coordinate point, except the very last one.
    for (let firstCoordIdx = 0; firstCoordIdx < parsedCoordList.length - 1; firstCoordIdx++) {
        // Inner loop: iterates through subsequent coordinate points to form unique pairs.
        // This avoids duplicate calculations (distance A-B is same as B-A) and self-comparison.
        for (let secondCoordIdx = firstCoordIdx + 1; secondCoordIdx < parsedCoordList.length; secondCoordIdx++) {
            // Extract the x and y components for the first point in the current pair.
            const xVal1 = parsedCoordList[firstCoordIdx][0];
            const yVal1 = parsedCoordList[firstCoordIdx][1];

            // Extract the x and y components for the second point in the current pair.
            const xVal2 = parsedCoordList[secondCoordIdx][0];
            const yVal2 = parsedCoordList[secondCoordIdx][1];

            // Calculate the difference in x and y coordinates.
            const deltaXCoord = xVal1 - xVal2;
            const deltaYCoord = yVal1 - yVal2;

            // Apply the Euclidean distance formula: sqrt((deltaX)^2 + (deltaY)^2).
            // This distance is then added to the running total.
            totalAccumulatedDistance += Math.sqrt(Math.pow(deltaXCoord, 2) + Math.pow(deltaYCoord, 2));
        }
    }

    // The final result is calculated by multiplying the total accumulated distance by 2,
    // and then dividing by the scaling factor obtained from the first line of input.
    console.log(totalAccumulatedDistance * 2 / scalingFactor);
}

// Entry point: Read data from standard input and pass it to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));