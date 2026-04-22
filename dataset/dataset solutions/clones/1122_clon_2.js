/*
 *  Module: Geometric Area Calculation Utility
 *  Description: Determines the area of a polygon defined by a sequence of points.
 *  Source: Referenced from a programming challenge portal (e.g., Aizu Online Judge 0079 equivalent).
 *  Current Status: Fully functional, passed initial tests.
 *  Note: This implementation uses the Shoelace formula (or Surveyor's formula)
 *        to compute the area based on the coordinates of the polygon's vertices.
 *        It specifically calculates half of the sum of the cross products of
 *        consecutive vector pairs originating from the first point.
 */
var printOutput = console.info; // Alias for displaying information to the console.

// Check if running in a Node.js-like environment by inspecting the 'process' global object.
if (typeof process !== "undefined") {
    // Create an alias for the global process object to avoid using its original name directly in subsequent code.
    const systemRuntime = process;
    let incomingDataBuffer = ""; // Accumulator for raw input data.
    systemRuntime.stdin.resume(); // Begin reading from the standard input stream.
    systemRuntime.stdin.setEncoding('utf8'); // Configure input character encoding to UTF-8.

    systemRuntime.stdin.addListener('data', function(dataPiece) {
        incomingDataBuffer += dataPiece; // Append each received data segment to the buffer.
    });

    systemRuntime.stdin.addListener('end', () => {
        let rawInputLines = incomingDataBuffer.split("\n"); // Split the accumulated data into individual lines.
        processGeometricData(rawInputLines); // Invoke the primary processing function with the parsed lines.
    });
}


function processGeometricData(coordinateStrings) {
    // Transform each input line into an array of numbers, filtering out empty string elements.
    coordinateStrings = coordinateStrings.map(function(currentString) {
        return currentString.split(" ")
            .filter(function(elementValue) {
                return elementValue !== ""; // Discard any empty string resulting from the split operation.
            })
            .map(function(itemToProcess) {
                const numericValue = parseFloat(itemToProcess); // Convert string to a floating-point number.
                if (isNaN(numericValue)) { // Check if the conversion resulted in Not-a-Number.
                    // If not a number, clean up the string by removing newline or carriage return characters.
                    return itemToProcess.replace(/(\r|\n)/g, "");
                }
                return numericValue; // Return the successfully parsed number.
            });
    });

    coordinateStrings.shift(); // Remove the initial line, which often contains metadata like the number of points.
    const spatialPoints = coordinateStrings; // Assign the processed lines as our list of polygon vertices.

    // spatialPoints.reverse(); // Optional: uncomment this line if the polygon's winding order needs to be inverted.

    printOutput(spatialPoints); // Display the parsed list of points for verification or debugging purposes.

    const initialPoint = spatialPoints[0]; // The very first vertex, serving as the common origin for vector calculations.
    let currentPoint, nextPoint; // Variables to hold two successive vertices during the loop iteration.
    let totalAreaSum = 0.0; // Accumulator for the summation of cross products, initialized as a float.
    const numberOfVertices = spatialPoints.length; // Determine the total count of vertices in the polygon.

    // Iterate through the vertices to calculate the sum of signed triangle areas using the Shoelace formula principle.
    // The loop begins from the second point and continues up to the second-to-last point.
    for (let vertexIndex = 1; vertexIndex < numberOfVertices - 1; ++vertexIndex) {
        currentPoint = spatialPoints[vertexIndex]; // Designate this as the 'middle' point of the current triangle.
        nextPoint = spatialPoints[vertexIndex + 1]; // Designate this as the 'end' point of the current triangle.
        // Add the signed area component of the triangle formed by initialPoint, currentPoint, and nextPoint.
        totalAreaSum += calculateOrientationValue(initialPoint, currentPoint, nextPoint);
    }

    // The Shoelace formula yields twice the actual area of the polygon.
    let formattedResult = String(totalAreaSum / 2.0); // Compute half of the accumulated sum and convert it to a string.
    const decimalPosition = formattedResult.indexOf("."); // Locate the position of the decimal point within the string.

    if (decimalPosition === -1) {
        // If the number is an integer (no decimal point found), append ".0" for consistent formatting.
        formattedResult += ".0";
    } else {
        // If a decimal exists, truncate the string to include only one digit after the decimal point.
        // This is a specific formatting requirement, possibly for a fixed precision output.
        formattedResult = formattedResult.slice(0, decimalPosition + 2);
    }
    printOutput(formattedResult); // Output the final calculated area, formatted as required.
}

// Helper function to determine the signed area component of a triangle formed by three given coordinates.
// This is achieved by computing the 2D cross product of two vectors originating from the first coordinate.
function calculateOrientationValue(coord1, coord2, coord3) {
    // Construct the first vector, spanning from coord1 to coord2.
    const vectorOne = [coord2[0] - coord1[0], coord2[1] - coord1[1]];
    // Construct the second vector, spanning from coord1 to coord3.
    const vectorTwo = [coord3[0] - coord1[0], coord3[1] - coord1[1]];

    // Delegate the actual computation of the cross product to a specialized function.
    return computeVectorCrossProduct(vectorOne, vectorTwo);
}

// Core utility function to compute the scalar 2D cross product of two vectors.
// For two-dimensional vectors vecA=(x1, y1) and vecB=(x2, y2), their cross product is defined as (x1*y2 - y1*x2).
function computeVectorCrossProduct(vecA, vecB) {
    return (vecA[0] * vecB[1] - vecA[1] * vecB[0]);
}