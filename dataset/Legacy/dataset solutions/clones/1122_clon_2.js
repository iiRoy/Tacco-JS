// This script calculates the area of a polygon given its vertices.
// It reads coordinate data from standard input, processes it, and outputs the calculated area.
// The core algorithm relies on the shoelace formula, which sums the signed areas of triangles formed by a reference point and consecutive polygon edges.

var outputLogger = console.log;

// Check if running in a Node.js-like environment to handle standard input.
if (typeof process !== "undefined") {
    let rawData = ""; // Accumulator for incoming data chunks.
    process.stdin.resume(); // Keep the process alive while waiting for input.
    process.stdin.setEncoding('utf8'); // Specify character encoding for input.

    // Event listener for 'data' chunks from stdin.
    process.stdin.on('data', function(dataChunk) {
        rawData += dataChunk; // Append each chunk to the rawData string.
    });

    // Event listener for 'end' of stdin stream.
    process.stdin.on('end', function() {
        const inputLines = rawData.split("\n"); // Split the accumulated data into individual lines.
        processCoordinates(inputLines); // Call the main processing function with the parsed lines.
    });
}


// Main function to process the input lines and calculate the polygon area.
function processCoordinates(inputLines) {
    // Transform each input line: split by space, filter out empty strings, and convert to numbers.
    inputLines = inputLines.map(function(currentLine) {
        return currentLine.split(" ").filter(function(elementStr) {
            return elementStr !== ""; // Remove any empty string elements resulting from multiple spaces.
        }).map(function(elementStr) {
            const numericVal = Number(elementStr); // Attempt to convert string to number.
            // If conversion results in NaN, it's likely a non-numeric string (e.g., leftover newline chars).
            if (numericVal.toString() === "NaN") {
                return elementStr.replace(/(\r)|(\n)/g, ""); // Clean up potential carriage returns or newlines.
            }
            return numericVal; // Return the numeric value.
        });
    });

    // The first line typically contains the number of vertices, which is not used in this implementation
    // as the array length implicitly provides this information. So, it's discarded.
    inputLines.shift();

    // The remaining lines now represent the polygon's vertices (x, y coordinates).
    const coordinateSet = inputLines;
    // coordinateSet.reverse(); // This line was commented out in the original, indicating it's not used.

    outputLogger(coordinateSet); // Output the parsed coordinate array for verification or debugging.

    const firstPoint = coordinateSet[0]; // The first vertex serves as the common origin for triangles.
    let startSegmentPoint, endSegmentPoint; // Variables to hold consecutive points forming a segment.
    let totalSignedArea = 0; // Accumulator for the sum of signed areas of triangles.
    const numPoints = coordinateSet.length; // Total number of vertices in the polygon.

    // Iterate through the points to calculate the sum of signed areas of triangles.
    // Each triangle is formed by the first point (firstPoint) and two consecutive points (startSegmentPoint, endSegmentPoint).
    // The loop starts from the second point (index 1) and goes up to the second-to-last point (numPoints - 2).
    for (let idx = 1; idx < numPoints - 1; idx++) {
        startSegmentPoint = coordinateSet[idx]; // The current point in the iteration.
        endSegmentPoint = coordinateSet[idx + 1]; // The next point in the sequence.
        totalSignedArea += calculateSignedTriangleArea(firstPoint, startSegmentPoint, endSegmentPoint);
    }

    // The total area of the polygon is half of the accumulated signed sum.
    // The result needs to be formatted to one decimal place, ensuring ".0" for integer results.
    let resultAreaStr = "" + (totalSignedArea / 2); // Convert the calculated area to a string.
    const decimalIndex = resultAreaStr.indexOf("."); // Find the position of the decimal point.

    if (decimalIndex === -1) {
        // If no decimal point is found, the number is an integer, so append ".0".
        resultAreaStr += ".0";
    } else {
        // If a decimal point exists, truncate the string to include only one digit after the decimal.
        // This matches the original behavior of slice(0, idx + 2).
        resultAreaStr = resultAreaStr.slice(0, decimalIndex + 2);
    }
    outputLogger(resultAreaStr); // Output the final calculated area as a formatted string.
}

// Helper function to calculate the signed area of a triangle given three vertices.
// This is based on the 2D cross product of two vectors originating from the first vertex.
function calculateSignedTriangleArea(vertexA, vertexB, vertexC) {
    // Form vector AB from vertexA to vertexB.
    const vectorAB = [vertexB[0] - vertexA[0], vertexB[1] - vertexA[1]];
    // Form vector AC from vertexA to vertexC.
    const vectorAC = [vertexC[0] - vertexA[0], vertexC[1] - vertexA[1]];
    // Compute the 2D cross product of these two vectors.
    return computeCrossProduct(vectorAB, vectorAC);
}

// Computes the 2D cross product (or determinant) of two 2D vectors.
// For vectors (x1, y1) and (x2, y2), the 2D cross product is x1*y2 - y1*x2.
function computeCrossProduct(vectorOne, vectorTwo) {
    return (vectorOne[0] * vectorTwo[1] - vectorOne[1] * vectorTwo[0]);
}
