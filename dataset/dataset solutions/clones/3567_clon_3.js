// This JavaScript module is designed to compute the coordinates of the two remaining
// vertices of a square, given the coordinates of two adjacent vertices.
// It reads input from standard input, processes it, and prints the result.

// Explicitly import the Node.js file system module for handling input operations.
const fileSystemInterface = require('node:fs');

// Define a constant for the standard input file path, common in competitive programming environments.
const standardInputFilePath = '/dev/stdin';

/**
 * Processes a string containing space-separated numeric coordinates and converts them to an array of numbers.
 * This function also includes basic validation to ensure the input is well-formed.
 *
 * @param {string} coordinateStringData - The raw string read from input, expected to contain coordinates.
 * @returns {Array<number>} An array of numeric coordinate values.
 * @throws {Error} If the input string is empty, null, or does not contain enough numeric parts.
 */
function parseCoordinateString(coordinateStringData) {
    // Check for null, undefined, or empty string input.
    if (!coordinateStringData || coordinateStringData.trim() === '') {
        throw new Error('Provided coordinate string is empty or invalid. Cannot parse.');
    }

    // Split the string by one or more whitespace characters to handle varying spacing.
    const stringCoordinateParts = coordinateStringData.trim().split(/\s+/);

    // A square requires at least two points, meaning four coordinate values (x1, y1, x2, y2).
    const expectedCoordinateCount = 4;
    if (stringCoordinateParts.length < expectedCoordinateCount) {
        throw new Error(
            `Insufficient coordinate values provided. Expected ${expectedCoordinateCount}, ` +
            `but received ${stringCoordinateParts.length}.`
        );
    }

    // Convert each string part to a number. The `Number()` constructor is explicit and handles various formats.
    const numericCoordinates = stringCoordinateParts.map(Number);

    // Basic validation to ensure all conversions were successful.
    if (numericCoordinates.some(isNaN)) {
        throw new Error('One or more parsed coordinate values are not valid numbers.');
    }

    return numericCoordinates;
}

/**
 * Calculates the coordinates of the two unknown vertices of a square, given two adjacent vertices.
 * This geometric calculation involves determining the vector between the given points and
 * then applying a 90-degree rotation to find the offset for the other vertices.
 *
 * @param {{x: number, y: number}} firstPoint - The first known vertex of the square.
 * @param {{x: number, y: number}} secondPoint - The second known vertex, adjacent to the first.
 * @returns {{vertexC: {x: number, y: number}, vertexD: {x: number, y: number}}} An object
 *          containing the coordinates of the third (C) and fourth (D) vertices.
 */
function calculateMissingSquareVertices(firstPoint, secondPoint) {
    // Calculate the difference in X and Y coordinates, representing the vector from firstPoint to secondPoint.
    // This is effectively (x2 - x1, y2 - y1) but expressed as (x1 - x2, y1 - y2) for the original logic.
    const xDifference = firstPoint.x - secondPoint.x; // Analogous to 'xd' in original code
    const yDifference = firstPoint.y - secondPoint.y;   // Analogous to 'yd' in original code

    // To find the third vertex (C), we rotate the vector (xDifference, yDifference) 90 degrees clockwise.
    // A vector (dx, dy) rotated 90 degrees clockwise becomes (dy, -dx).
    // We then add this rotated vector to the coordinates of the secondPoint (B).
    const vertexCX = secondPoint.x + yDifference;
    const vertexCY = secondPoint.y - xDifference;

    // To find the fourth vertex (D), we apply the same rotated vector to the coordinates of the firstPoint (A).
    const vertexDX = firstPoint.x + yDifference;
    const vertexDY = firstPoint.y - xDifference;

    // Return the results in a structured object for clarity.
    return {
        vertexC: { x: vertexCX, y: vertexCY },
        vertexD: { x: vertexDX, y: vertexDY }
    };
}

// The main execution logic is encapsulated within an Immediately Invoked Function Expression (IIFE).
// This helps to prevent global variable pollution and organizes the script's flow.
(function executeSquareVertexCalculation() {
    let rawInputData; // Variable to hold the raw string content read from the file.

    try {
        // Synchronously read the entire content of the standard input file.
        // Specifying 'utf8' encoding ensures correct interpretation of text data.
        rawInputData = fileSystemInterface.readFileSync(standardInputFilePath, { encoding: 'utf8' });
    } catch (readingError) {
        // If there's an issue reading the file, log the error and exit with a non-zero status code.
        console.error(`Error encountered while reading input from ${standardInputFilePath}: ${readingError.message}`);
        process.exit(1);
    }

    // Split the entire input content into an array of lines.
    const allInputLines = rawInputData.split('\n');

    // Perform a preliminary check to ensure there is at least one line of actual data.
    if (allInputLines.length === 0 || allInputLines[0].trim() === '') {
        console.error('No valid input lines were detected. Please provide coordinate data.');
        process.exit(1);
    }

    // Extract the very first line of input, which is expected to contain the coordinates.
    // `shift()` removes the first element from the array and returns it.
    const coordinateInputLine = allInputLines.shift();

    let numericalCoordinates; // Variable to store the parsed numeric values.
    try {
        // Attempt to parse the extracted coordinate line using our dedicated function.
        numericalCoordinates = parseCoordinateString(coordinateInputLine);
    } catch (parsingError) {
        // If parsing fails due to invalid format or insufficient data, log and exit.
        console.error(`Failed to process coordinate string: ${parsingError.message}`);
        process.exit(1);
    }

    // Destructure the array of numerical coordinates into individually named variables.
    // This improves readability and makes it clear which coordinate is which.
    const [
        firstPointX, firstPointY,
        secondPointX, secondPointY
    ] = numericalCoordinates;

    // Create point objects for the two known vertices. This makes passing them to functions cleaner.
    const knownVertexA = { x: firstPointX, y: firstPointY };
    const knownVertexB = { x: secondPointX, y: secondPointY };

    // Call the calculation function to determine the coordinates of the other two square vertices.
    const calculatedResult = calculateMissingSquareVertices(knownVertexA, knownVertexB);

    // Extract the X and Y components of the newly calculated vertices for output.
    const vertexCX_Output = calculatedResult.vertexC.x;
    const vertexCY_Output = calculatedResult.vertexC.y;
    const vertexDX_Output = calculatedResult.vertexD.x;
    const vertexDY_Output = calculatedResult.vertexD.y;

    // Print the final coordinates to the console.
    // Using a template literal provides a clean and flexible way to format the output string.
    console.log(`${vertexCX_Output} ${vertexCY_Output} ${vertexDX_Output} ${vertexDY_Output}`);

})(); // End of the main execution block.