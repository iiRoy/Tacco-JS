// This script processes coordinate data from standard input to calculate the area of a polygon.
// The method employed is a variant of the shoelace formula, utilizing cross products of vectors.
// Input lines are expected to contain numeric coordinates, potentially with extra whitespace.

let outputConsole = console.log;

// Check if running in a Node.js environment to handle standard input.
if (typeof process !== 'undefined') {
    let rawData = ''; // Accumulates all incoming data from stdin.
    process.stdin.resume(); // Keep the process alive for input.
    process.stdin.setEncoding('utf8'); // Set encoding for input data.

    // Event listener for incoming data chunks.
    process.stdin.on('data', function(dataChunk) {
        rawData += dataChunk;
    });

    // Event listener for the end of input stream.
    process.stdin.on('end', function() {
        let inputLines = rawData.split('\n'); // Split accumulated data into individual lines.
        processInputData(inputLines); // Pass lines to the main processing function.
    });
}


// Main function to process the array of input lines.
function processInputData(inputLines) {
    // Transform each input line: split by space, filter out empty strings, then convert to numbers.
    let parsedLines = inputLines.map(function(currentLine) {
        return currentLine.split(' ').filter(function(elementStr) {
            return elementStr !== ''; // Remove any empty string elements resulting from multiple spaces.
        }).map(function(elementStr) {
            let numericVal = Number(elementStr); // Attempt to convert string to number.
            // If conversion results in NaN, it means the element was not a pure number (e.g., had newlines).
            if (numericVal.toString() === 'NaN') {
                // Clean up the string by removing carriage returns or newlines.
                return elementStr.replace(/(\r)|(\n)/g, '');
            }
            return numericVal; // Return the numeric value.
        });
    });

    // The last line might be empty or contain a valid point.
    // Pop it off and re-add if it's a valid two-element point.
    let finalEntry = parsedLines.pop();
    if (finalEntry.length === 2) {
        parsedLines.push(finalEntry);
    }

    // The first line of input often contains metadata (like the number of vertices),
    // which is not used by this specific algorithm, so it's discarded.
    parsedLines.shift();

    // The remaining parsed lines represent the vertices of the polygon.
    let polygonVertices = parsedLines;
    // The original algorithm does not require reversing the order of vertices.

    let originVertex = polygonVertices[0]; // The first vertex serves as the common origin for triangulation.
    let startSegmentVertex, endSegmentVertex;
    let totalSignedArea = 0.0; // Accumulator for the sum of signed areas of triangles.
    let vertexCount = polygonVertices.length;

    // Iterate through the vertices, forming triangles with the origin vertex.
    // Each triangle is (originVertex, polygonVertices[idx], polygonVertices[idx+1]).
    for (let idx = 1; idx < vertexCount - 1; idx++) {
        // Loop from the second vertex to the second-to-last vertex.
        startSegmentVertex = polygonVertices[idx];
        endSegmentVertex = polygonVertices[idx + 1];
        // Add the signed area of the current triangle to the total.
        totalSignedArea += calculateCrossProductArea(originVertex, startSegmentVertex, endSegmentVertex);
    }

    // The total area of the polygon is half of the accumulated sum of signed triangle areas.
    let resultAreaStr = '' + (totalSignedArea / 2);
    let decimalPointPos = resultAreaStr.indexOf('.');

    // Format the output string to ensure it always has at least one decimal place.
    if (decimalPointPos === -1) {
        // If no decimal point is present, append ".0".
        resultAreaStr += '.0';
    } else {
        // If a decimal point exists, truncate the string to include only one digit after the decimal.
        // This matches the original behavior of `slice(0, idx + 2)`.
        resultAreaStr = resultAreaStr.slice(0, decimalPointPos + 2);
    }
    outputConsole(resultAreaStr); // Print the formatted area to the console.
}

// Computes the signed area of a triangle defined by three vertices (vertexA, vertexB, vertexC).
// This is achieved by calculating the 2D cross product of vectors AB and AC.
function calculateCrossProductArea(vertexA, vertexB, vertexC) {
    // Form vector AB by subtracting coordinates of vertexA from vertexB.
    let vectorAB = [vertexB[0] - vertexA[0], vertexB[1] - vertexA[1]];
    // Form vector AC by subtracting coordinates of vertexA from vertexC.
    let vectorAC = [vertexC[0] - vertexA[0], vertexC[1] - vertexA[1]];
    // Return the 2D cross product of these two vectors.
    return computeVectorCrossProduct(vectorAB, vectorAC);
}

// Calculates the 2D cross product of two 2D vectors.
// For vectors [x1, y1] and [x2, y2], the 2D cross product is (x1*y2 - y1*x2).
function computeVectorCrossProduct(vectorOne, vectorTwo) {
    // Perform the cross product calculation.
    return (vectorOne[0] * vectorTwo[1] - vectorOne[1] * vectorTwo[0]);
}
