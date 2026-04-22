'use strict';

// This script calculates a specific geometric metric based on a given set of 2D points.
// It reads point coordinates from standard input, processes them, and then outputs a final computed value.

// An immediately invoked function expression (IIFE) to encapsulate the main logic
// and prevent global scope pollution. It receives the raw input lines as an argument.
(function processGeometricDataset(rawDataLines) {

    // A utility function to parse and validate positive integer inputs.
    // Throws an error if the input is not a valid non-negative integer.
    const ensureValidPositiveInteger = (valueString, errorMessage) => {
        const parsedValue = Number.parseInt(valueString.trim(), 10);
        if (Number.isNaN(parsedValue) || parsedValue < 0) {
            throw new Error(errorMessage || "Encountered an invalid non-negative integer value.");
        }
        return parsedValue;
    };

    // Defines a class to represent a point in a two-dimensional Cartesian plane.
    // Encapsulates coordinate values and provides methods for distance calculations.
    class TwoDimensionalPoint {
        constructor(xCoord, yCoord) {
            // Basic type and finiteness validation for coordinate components.
            if (typeof xCoord !== 'number' || !Number.isFinite(xCoord) ||
                typeof yCoord !== 'number' || !Number.isFinite(yCoord)) {
                throw new Error("Point coordinates must be finite numerical values.");
            }
            this.horizontalPosition = xCoord; // Renamed 'x' to 'horizontalPosition'
            this.verticalPosition = yCoord;   // Renamed 'y' to 'verticalPosition'
        }

        // Computes the square of the Euclidean distance between this point and another.
        // Useful for performance if only distance comparison is needed, but here we need the root.
        getSquaredDistanceTo(anotherPoint) {
            const deltaX = this.horizontalPosition - anotherPoint.horizontalPosition;
            const deltaY = this.verticalPosition - anotherPoint.verticalPosition;
            return (deltaX * deltaX) + (deltaY * deltaY);
        }

        // Computes the actual Euclidean distance between this point and another.
        calculateEuclideanDistance(anotherPoint) {
            return Math.sqrt(this.getSquaredDistanceTo(anotherPoint));
        }
    }

    // --- Data Input and Preparation ---

    // Initial validation for the presence of input data.
    if (!rawDataLines || rawDataLines.length === 0) {
        console.error("Error: No input data was provided for processing.");
        return; // Terminate execution if input is missing.
    }

    // The first line of input specifies the total number of points to expect.
    let countOfPoints;
    try {
        countOfPoints = ensureValidPositiveInteger(
            rawDataLines[0],
            "Input format error: The first line must contain a valid non-negative integer representing the total number of points."
        );
    } catch (parseError) {
        console.error(parseError.message);
        return;
    }

    // Handle edge case: zero points.
    if (countOfPoints === 0) {
        console.log(0.0); // If there are no points, the sum of distances is zero.
        return;
    }

    // Validate that enough lines are provided for all points.
    if (rawDataLines.length < countOfPoints + 1) {
        console.error(`Error: Expected ${countOfPoints + 1} lines (1 for count, ${countOfPoints} for points), but received only ${rawDataLines.length}.`);
        return;
    }

    const collectionOfPoints = []; // Stores instances of TwoDimensionalPoint.

    // Iterate through the input lines to parse and store each point's coordinates.
    // The loop starts from index 1 as index 0 contains the point count.
    for (let pointIterator = 0; pointIterator < countOfPoints; pointIterator++) {
        const currentDataLine = rawDataLines[pointIterator + 1].trim();

        // Validate that the current line for point data is not empty.
        if (!currentDataLine) {
            console.error(`Input format error: Line ${pointIterator + 2} (for point ${pointIterator + 1}) is unexpectedly empty.`);
            return;
        }

        // Split the line by space and convert components to floating-point numbers.
        const coordinateComponents = currentDataLine.split(' ').map(componentString => {
            const numericValue = Number.parseFloat(componentString);
            if (Number.isNaN(numericValue)) {
                throw new Error(`Input format error: Non-numeric coordinate value '${componentString}' found on line ${pointIterator + 2}.`);
            }
            return numericValue;
        });

        // Ensure exactly two coordinate values (X and Y) are provided per line.
        if (coordinateComponents.length !== 2) {
            console.error(`Input format error: Line ${pointIterator + 2} must contain exactly two coordinate values (X Y), but found ${coordinateComponents.length}.`);
            return;
        }

        // Create a new TwoDimensionalPoint object and add it to our collection.
        collectionOfPoints.push(new TwoDimensionalPoint(coordinateComponents[0], coordinateComponents[1]));
    }

    // --- Core Calculation Logic ---

    let aggregateDistanceSum = 0.0; // Accumulates the sum of all pairwise distances.

    // Compute the sum of Euclidean distances for all unique pairs of points.
    // The outer loop iterates from the first point up to the second-to-last.
    for (let currentPointIndexA = 0; currentPointIndexA < countOfPoints - 1; currentPointIndexA++) {
        const pointReferenceA = collectionOfPoints[currentPointIndexA];

        // The inner loop iterates from the next point after 'A' to avoid duplicate pairs (A,B and B,A)
        // and to exclude self-comparison (A,A), which would yield a zero distance.
        for (let currentPointIndexB = currentPointIndexA + 1; currentPointIndexB < countOfPoints; currentPointIndexB++) {
            const pointReferenceB = collectionOfPoints[currentPointIndexB];
            // Add the Euclidean distance between the current pair of points to the total sum.
            aggregateDistanceSum += pointReferenceA.calculateEuclideanDistance(pointReferenceB);
        }
    }

    // --- Final Output Generation ---

    // The final metric is calculated as twice the total sum of pairwise distances, divided by the number of points.
    // This formula is specific to the problem context this code is designed for.
    const resultantMetric = (aggregateDistanceSum * 2.0) / countOfPoints;

    // Display the computed metric to standard output.
    console.log(resultantMetric);

// Execute the IIFE, passing the input read from standard input.
})(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));