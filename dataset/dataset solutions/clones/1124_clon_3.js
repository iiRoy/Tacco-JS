const displayOutput = console.log;

// This section handles reading input from standard input (stdin)
// typically used in command-line environments or online judges.
if (typeof process !== "undefined" && process.stdin) {
    let completeInputBuffer = ""; // Stores all received data chunks

    // Prepare stdin to receive data
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    // Event listener for when data is received
    process.stdin.on('data', (dataChunk) => {
        completeInputBuffer += dataChunk; // Append the new chunk to the buffer
    });

    // Event listener for when the input stream has ended
    process.stdin.on('end', () => {
        // Split the accumulated input into an array of strings, one per line
        const rawInputLines = completeInputBuffer.split("\n");
        // Invoke the primary logic to compute the polygon's area
        processPolygonDataAndCalculateArea(rawInputLines);
    });
} else {
    // Placeholder for environments where `process.stdin` is not available.
    // In a browser, input would come from a different source (e.g., a form).
    // For direct execution, one might hardcode test data here.
    // Example: processPolygonDataAndCalculateArea(["3", "0 0", "10 0", "0 10"]);
}

/**
 * Defines a simple structure for a 2D point.
 */
class VertexCoordinate {
    constructor(coordX, coordY) {
        this.x = coordX;
        this.y = coordY;
    }
}

/**
 * Main function responsible for parsing input, validating data,
 * and computing the area of a polygon using the Shoelace formula.
 * @param {string[]} incomingTextLines - An array of strings, each representing a line from the input.
 */
function processPolygonDataAndCalculateArea(incomingTextLines) {
    // Initial cleanup: remove any lines that are empty or contain only whitespace.
    const effectiveInputEntries = incomingTextLines.filter(line => line.trim().length > 0);

    // If no meaningful input lines remain after filtering, output zero area.
    if (effectiveInputEntries.length === 0) {
        displayOutput("0.0");
        return;
    }

    // The first line is often the count of vertices, which we'll ignore for flexibility.
    // We'll process all subsequent lines as potential vertex coordinates.
    const potentialVertexStrings = effectiveInputEntries.slice(1);

    // Parse each string line into a VertexCoordinate object.
    // This involves splitting, converting to float, and validating.
    const polygonVertices = potentialVertexStrings.map(lineContent => {
        // Split the line by one or more spaces, and filter out any resulting empty strings.
        const coordinateStrings = lineContent.split(/\s+/).filter(part => part !== '');

        // Expect exactly two parts (X and Y coordinates).
        if (coordinateStrings.length === 2) {
            const xComponent = parseFloat(coordinateStrings[0]);
            const yComponent = parseFloat(coordinateStrings[1]);

            // Ensure both parsed values are valid numbers.
            if (!isNaN(xComponent) && !isNaN(yComponent)) {
                return new VertexCoordinate(xComponent, yComponent);
            }
        }
        return null; // Return null for any line that doesn't form a valid point.
    }).filter(vertex => vertex !== null); // Filter out all the null entries (invalid points).

    // A polygon must have at least three vertices.
    if (polygonVertices.length < 3) {
        displayOutput("0.0");
        return;
    }

    // Implement the Shoelace Formula for calculating polygon area.
    // Formula: Area = 0.5 * | Σ (x_i * y_{i+1} - x_{i+1} * y_i) |
    // The sum iterates from i=0 to n-1, with (x_n, y_n) implicitly being (x_0, y_0) for the last term.

    let accumulatedCrossProducts = 0;
    const actualVertexCount = polygonVertices.length;

    // Loop through each vertex and its successor to calculate cross product terms.
    for (let currentPointIndex = 0; currentPointIndex < actualVertexCount; currentPointIndex++) {
        const pointCurrent = polygonVertices[currentPointIndex];
        // Determine the next point, wrapping around to the first point for the last segment.
        const pointNext = polygonVertices[(currentPointIndex + 1) % actualVertexCount];

        // Add the term (x_current * y_next - x_next * y_current) to the sum.
        accumulatedCrossProducts += (pointCurrent.x * pointNext.y) - (pointNext.x * pointCurrent.y);
    }

    // The polygon's area is half the absolute value of the accumulated sum.
    const computedPolygonSurfaceArea = Math.abs(accumulatedCrossProducts / 2.0);

    // Format the final area to one decimal place as a string.
    // toFixed(1) ensures that even whole numbers like 5 become "5.0".
    const areaFormattedForDisplay = computedPolygonSurfaceArea.toFixed(1);

    // Output the formatted area result.
    displayOutput(areaFormattedForDisplay);
}