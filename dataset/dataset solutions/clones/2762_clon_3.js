// This module is responsible for processing a dataset of N-dimensional points
// provided via standard input. Its primary function is to identify and count
// all unique pairs of these points whose Euclidean distance is an integer.
const analyzeCoordinateData = (rawDataString) => {
    // --- Input Validation and Initial Parsing ---

    // Defensive check: Ensure the input string is not empty or merely whitespace.
    if (!rawDataString || rawDataString.trim() === "") {
        console.error("Error: The provided input data is empty or malformed.");
        // In a real application, you might throw an error or return a specific status.
        return;
    }

    // Split the entire raw input into an array of individual lines.
    const inputLines = rawDataString.split("\n");

    // Extract the first line, which should contain global configuration.
    const configurationLine = inputLines[0];
    if (!configurationLine) {
        console.error("Error: The configuration line (first line) is missing from input.");
        return;
    }

    // Parse the configuration line into tokens (e.g., "N D").
    const configTokens = configurationLine.split(" ");

    // Validate that we have at least two configuration tokens.
    if (configTokens.length < 2) {
        console.error("Error: Not enough configuration parameters on the first line. Expected N and D.");
        return;
    }

    // Convert the string tokens for N (number of points) and D (dimensions) into integers.
    const numberOfPoints = parseInt(configTokens[0], 10);
    const pointDimensions = parseInt(configTokens[1], 10);

    // Validate the parsed numerical configuration values.
    if (isNaN(numberOfPoints) || isNaN(pointDimensions) || numberOfPoints < 0 || pointDimensions < 0) {
        console.error("Error: Invalid numerical values detected for point count or dimensions. Must be non-negative integers.");
        return;
    }

    // --- Coordinate Data Parsing ---

    // Initialize an array to store all points. Each point will be an array of its coordinates.
    const allPointCoordinates = [];

    // Loop through the remaining lines of input to parse each point's coordinates.
    // We start from `1` because `inputLines[0]` was the configuration line.
    for (let currentPointIdx = 0; currentPointIdx < numberOfPoints; currentPointIdx++) {
        const dataLineForPoint = inputLines[currentPointIdx + 1];

        // Ensure a data line exists for the current point.
        if (!dataLineForPoint) {
            console.error(`Error: Data line missing for point index ${currentPointIdx + 1}.`);
            return;
        }

        // Split the current data line into individual coordinate strings.
        const coordinateStrings = dataLineForPoint.split(" ");

        // Verify that the number of coordinates matches the expected dimensions.
        if (coordinateStrings.length !== pointDimensions) {
            console.error(`Error: Point ${currentPointIdx + 1} has ${coordinateStrings.length} coordinates, but ${pointDimensions} dimensions were expected.`);
            return;
        }

        // Convert all coordinate strings to numbers and add the point to our collection.
        // Using `Number` as a map callback is a concise way to parse to float/integer.
        allPointCoordinates.push(coordinateStrings.map(Number));
    }

    // --- Core Logic: Distance Calculation and Integer Check ---

    // This variable will accumulate the count of point pairs with integer distances.
    let integerDistancePairCount = 0;

    // Outer loop: Iterates through each point, representing the first point in a pair.
    for (let firstPointIndex = 0; firstPointIndex < numberOfPoints; firstPointIndex++) {
        // Inner loop: Iterates through subsequent points, representing the second point in a pair.
        // Starting `secondPointIndex` from `firstPointIndex + 1` ensures:
        // 1. No point is compared with itself.
        // 2. Each pair (P1, P2) is considered only once, avoiding redundant (P2, P1) calculations.
        for (let secondPointIndex = firstPointIndex + 1; secondPointIndex < numberOfPoints; secondPointIndex++) {
            const pointA = allPointCoordinates[firstPointIndex];
            const pointB = allPointCoordinates[secondPointIndex];

            // Initialize a sum for the squared differences of coordinates.
            let sumOfCoordinateSquaredDifferences = 0;

            // Iterate through each dimension to calculate the squared difference.
            for (let dimIdx = 0; dimIdx < pointDimensions; dimIdx++) {
                const coordA = pointA[dimIdx];
                const coordB = pointB[dimIdx];
                const difference = coordA - coordB;

                // Add the square of the difference to the running sum.
                // Using `*` for squaring is often slightly more performant than `Math.pow(x, 2)`.
                sumOfCoordinateSquaredDifferences += difference * difference;
            }

            // Calculate the final Euclidean distance by taking the square root of the sum.
            const calculatedEuclideanDistance = Math.sqrt(sumOfCoordinateSquaredDifferences);

            // Check if the calculated distance is an integer.
            // `Number.isInteger` correctly handles floating-point results.
            if (Number.isInteger(calculatedEuclideanDistance)) {
                integerDistancePairCount++;
            }
        }
    }

    // --- Output Result ---

    // Print the total count of pairs found with integer Euclidean distances.
    console.log(integerDistancePairCount);
};

// --- Execution Entry Point ---

// Read the entire content from standard input synchronously and
// pass it to our main processing function.
analyzeCoordinateData(require("fs").readFileSync("/dev/stdin", "utf8"));