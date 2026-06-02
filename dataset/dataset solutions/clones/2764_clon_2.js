"use strict"; // Enforce strict parsing and error handling in the script.

/**
 * Main function to process input data and calculate the number of pairs of points
 * with integer Euclidean distances.
 * @param {string} inputData - The raw input string from stdin.
 */
const processInput = (inputData) => {
    // Clean and split the input string into an array of lines.
    inputData = inputData.trim().split("\n");

    // Parse the first line to get the number of points (numPoints) and dimensions (dimensions).
    const firstLineParts = inputData[0].split(" ");
    const numPoints = parseInt(firstLineParts[0], 10); // Total number of data points.
    const dimensions = parseInt(firstLineParts[1], 10); // Number of dimensions for each point.

    // Extract the coordinate strings for each point, skipping the first line.
    const coordinateStrings = inputData.slice(1, numPoints + 1);
    let integerDistanceCount = 0; // Counter for pairs with integer distances.

    // Iterate through each point (point A) to compare with subsequent points.
    for (let idxA in coordinateStrings) {
        // Convert the current point's coordinate string into an array of integers.
        const currentPointCoordsStr = coordinateStrings[idxA].split(" ").map(coordStr => parseInt(coordStr, 10));
        let currentPointCoordinates = []; // Array to hold numeric coordinates for point A.

        // Populate the currentPointCoordinates array.
        for (let coordIndexA in currentPointCoordsStr) {
            currentPointCoordinates.push(currentPointCoordsStr[coordIndexA]);
        }

        // Iterate through subsequent points (point B) to avoid duplicate pairs and self-comparison.
        // Start from idxA + 1 to ensure each pair is checked only once.
        for (let idxB = parseInt(idxA, 10) + 1; idxB < numPoints; idxB++) {
            // Convert the next point's coordinate string into an array of integers.
            const nextPointCoordsStr = coordinateStrings[idxB].split(" ").map(coordStr => parseInt(coordStr, 10));
            let nextPointCoordinates = []; // Array to hold numeric coordinates for point B.

            // Populate the nextPointCoordinates array.
            for (let coordIndexB in nextPointCoordsStr) {
                nextPointCoordinates.push(nextPointCoordsStr[coordIndexB]);
            }

            let squaredDistanceSum = 0; // Accumulator for the sum of squared differences.

            // Calculate the squared Euclidean distance between currentPointCoordinates and nextPointCoordinates.
            // The original code includes Math.abs, which is preserved here for strict Type II cloning.
            for (let coordIdx = 0; coordIdx < dimensions; coordIdx++) { // Loop through each dimension.
                const diff = currentPointCoordinates[coordIdx] - nextPointCoordinates[coordIdx];
                squaredDistanceSum += Math.abs(Math.pow(diff, 2));
            }

            // Calculate the actual Euclidean distance by taking the square root.
            const euclideanDistance = Math.sqrt(squaredDistanceSum);

            // Check if the calculated Euclidean distance is an integer.
            // A number % 1 === 0 is a common way to check for integers in JavaScript.
            if (euclideanDistance % 1 === 0) {
                integerDistanceCount++; // Increment the counter if it's an integer distance.
            }
        }
    }

    // Output the final count of pairs with integer distances to the console.
    console.log(integerDistanceCount);
};

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
