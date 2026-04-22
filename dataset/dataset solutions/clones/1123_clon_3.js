// This module is designed to process geometric data, specifically to compute the area of a polygon.
// It includes logic for standard input handling in a Node.js environment
// and employs a common algorithm for area calculation.

// A dedicated function for outputting results to the console, enhancing clarity.
const printProcessedResult = console.log;

// This section manages reading data from standard input, typically in a server-side
// JavaScript context like Node.js. It buffers all incoming text until the input stream
// concludes, then passes the collected data for further processing.
if (typeof process !== "undefined" && process.stdin) {
    let receivedDataBuffer = ""; // Accumulates all parts of the input stream.
    const standardInputEncoding = 'utf8'; // Specifies the character encoding for input.

    // Activates the standard input stream to begin receiving data.
    process.stdin.resume();
    // Configures the encoding for the incoming data, ensuring correct text interpretation.
    process.stdin.setEncoding(standardInputEncoding);

    // Establishes an event listener to capture data chunks as they arrive.
    // Each piece of data is appended to the buffer.
    process.stdin.on('data', (incomingSegment) => {
        // A simple check to ensure the received segment is text-based before concatenation.
        if (typeof incomingSegment === 'string') {
            receivedDataBuffer += incomingSegment;
        } else {
            // Logs a warning if an unexpected data type is encountered, preventing potential errors.
            console.error("Warning: Non-string data received from stdin, segment skipped.");
        }
    });

    // Sets up an event listener to trigger when the entire input stream has been read.
    // At this point, the complete buffered input is ready for the main computation.
    process.stdin.on('end', () => {
        // Splits the accumulated input into individual lines, removing any empty lines
        // that might result from extra newlines at the start or end of the input.
        const allInputLines = receivedDataBuffer.split('\n').filter(line => line.trim() !== '');

        // Initiates the core geometric calculation with the parsed lines of input.
        executePolygonAreaCalculation(allInputLines);
    });
}

/**
 * Transforms an array of raw string lines into a structured array of numeric coordinate pairs.
 * This function is robust against various whitespace formats and attempts to gracefully handle
 * non-numeric input by logging warnings and discarding invalid points.
 * @param {string[]} rawInputLines - An array where each string represents a potential vertex (e.g., "10 20").
 * @returns {number[][]} An array of [x, y] coordinate arrays, representing the polygon's vertices.
 */
function parseVertexCoordinates(rawInputLines) {
    // An internal helper to safely convert a string component into a floating-point number.
    const tryParseNumber = (componentString) => {
        const cleanedString = componentString.trim();
        if (cleanedString === "") return undefined; // Treat empty strings as non-existent.
        const numericalValue = Number(cleanedString);
        // Checks if the conversion yielded a valid, finite number.
        if (isNaN(numericalValue) || !isFinite(numericalValue)) {
            console.warn(`Attempted to parse "${componentString}" but it's not a valid number.`);
            return undefined; // Indicates a parsing failure.
        }
        return numericalValue;
    };

    // Iterates through each input line to extract and convert coordinates.
    const parsedVertices = rawInputLines.map((currentLine) => {
        // Splits the line by any sequence of whitespace characters, then removes any resulting empty strings.
        const stringComponents = currentLine.split(/\s+/).filter(Boolean);

        // Converts each component to a number, discarding any that failed parsing.
        const lineNumbers = stringComponents.map(tryParseNumber).filter(val => val !== undefined);

        // Validates that each line successfully yielded exactly two numbers (an X and a Y coordinate).
        if (lineNumbers.length !== 2) {
            console.error(`Error: Line "${currentLine}" did not contain exactly two numeric coordinates. Skipping.`);
            return null; // Marks this line as invalid.
        }
        return [lineNumbers[0], lineNumbers[1]]; // Returns the valid [x, y] pair.
    }).filter(vertex => vertex !== null); // Filters out any lines that were marked as invalid.

    return parsedVertices;
}


/**
 * Computes the area of a polygon given its vertices using the Shoelace formula.
 * This function orchestrates parsing, validation, and the core calculation logic.
 * @param {string[]} inputCoordinateStrings - Raw string lines containing vertex coordinates.
 */
function executePolygonAreaCalculation(inputCoordinateStrings) {
    // First, convert the raw input strings into a usable array of numeric vertex pairs.
    const polygonVertexList = parseVertexCoordinates(inputCoordinateStrings);

    // Essential validation: A polygon must have at least three vertices to enclose an area.
    const totalVertexCount = polygonVertexList.length;
    if (totalVertexCount < 3) {
        printProcessedResult("0.0"); // Degenerate polygons (lines, points) have zero area.
        return;
    }

    // Initialize variables for the two main sums required by the Shoelace formula.
    let sumOfForwardDiagonals = 0.0;  // Accumulates (x_i * y_{i+1}) terms.
    let sumOfBackwardDiagonals = 0.0; // Accumulates (y_i * x_{i+1}) terms.

    // Loop through each vertex to apply the Shoelace formula.
    // The loop iterates from the first vertex up to the last.
    for (let currentPointIndex = 0; currentPointIndex < totalVertexCount; currentPointIndex++) {
        // Extract coordinates of the current vertex.
        const currentVertexX = polygonVertexList[currentPointIndex][0];
        const currentVertexY = polygonVertexList[currentPointIndex][1];

        // Determine the index of the next vertex in sequence, wrapping around
        // from the last vertex back to the first to close the polygon.
        const subsequentPointIndex = (currentPointIndex + 1) % totalVertexCount;
        const subsequentVertexX = polygonVertexList[subsequentPointIndex][0];
        const subsequentVertexY = polygonVertexList[subsequentPointIndex][1];

        // Add the cross-product terms to their respective accumulators.
        sumOfForwardDiagonals += (currentVertexX * subsequentVertexY);
        sumOfBackwardDiagonals += (currentVertexY * subsequentVertexX);
    }

    // Calculate the preliminary signed area using the Shoelace formula:
    // Area = 0.5 * | (Sum(x_i * y_{i+1})) - (Sum(y_i * x_{i+1})) |
    const intermediateSignedArea = 0.5 * (sumOfForwardDiagonals - sumOfBackwardDiagonals);

    // The area of a geometric shape is conventionally a positive value.
    // Therefore, take the absolute value of the calculated area.
    const finalCalculatedArea = Math.abs(intermediateSignedArea);

    // Format the final area to ensure it is represented with exactly one decimal place.
    // This includes appropriate rounding and adding ".0" for whole numbers.
    const formattedAreaOutput = finalCalculatedArea.toFixed(1);

    // Display the computed and formatted polygon area.
    printProcessedResult(formattedAreaOutput);
}