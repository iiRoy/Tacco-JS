/*
 * Polygon Area Calculation Module
 * (Source: http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=0079)
 *
 * Status: Implemented and tested.
 *
 * Notes: This program computes the area of a polygon given its vertices.
 * It uses a triangulation method based on cross products relative to a fixed origin vertex.
 */
var output = console.log;

if (typeof process !== 'undefined') {
    var rawData = '';
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', function(chunk) {
        rawData += chunk;
    });

    process.stdin.on('end', function() {
        var inputLines = rawData.split('\n');
        processCoordinates(inputLines);
    });
}

function processCoordinates(coordinateStrings) {
    // Transform input strings into arrays of numbers, filtering out empty elements.
    coordinateStrings = coordinateStrings.map(function(currentLine) {
        return currentLine.split(' ').filter(function(elementString) {
            return elementString !== '';
        }).map(function(elementString) {
            var numericValue = Number(elementString);
            // Handle non-numeric values, typically newline characters at the end of input.
            if (numericValue.toString() === 'NaN') {
                return elementString.replace(/(\r)|(\n)/g, '');
            }
            return numericValue;
        });
    });

    // The first line often contains the count of vertices, which is not needed for the calculation itself.
    coordinateStrings.shift();

    var vertexList = coordinateStrings;
    // The original code had a commented-out reverse, indicating it might have been considered or was for a different problem variant.
    // vertexList.reverse();

    var originVertex = vertexList[0];
    var startSegmentVertex, endSegmentVertex;
    var accumulatedAreaSum = 0;
    var vertexCount = vertexList.length;

    // Iterate through the vertices to form triangles with the originVertex.
    // The loop runs from the second vertex to the second-to-last vertex.
    for (var loopIndex = 1; loopIndex < vertexCount - 1; loopIndex++) {
        // loopIndex will be 1, 2, 3, ..., vertexCount - 2
        startSegmentVertex = vertexList[loopIndex];
        endSegmentVertex = vertexList[loopIndex + 1];
        accumulatedAreaSum += calculateCrossProduct(originVertex, startSegmentVertex, endSegmentVertex);
    }

    // The total area is half of the accumulated sum of cross products.
    var finalAreaString = '' + (accumulatedAreaSum / 2);
    var decimalPointIndex = finalAreaString.indexOf('.');

    if (decimalPointIndex === -1) {
        // If the number is an integer, append ".0" for consistent formatting.
        finalAreaString += '.0';
    } else {
        // If there's a decimal part, ensure only one decimal place is shown.
        // This truncates rather than rounds, matching the original behavior.
        finalAreaString = finalAreaString.slice(0, decimalPointIndex + 2);
    }

    output(finalAreaString);
}

function calculateCrossProduct(v1, v2, v3) {
    // Compute vectors from v1 to v2 and v1 to v3.
    var vectorA = [v2[0] - v1[0], v2[1] - v1[1]];
    var vectorB = [v3[0] - v1[0], v3[1] - v1[1]];

    // Return the 2D cross product of vectorA and vectorB.
    return computeVectorCrossProduct(vectorA, vectorB);
}

function computeVectorCrossProduct(vectorA, vectorB) {
    // The 2D cross product (or Z-component of 3D cross product)
    // is (Ax * By - Ay * Bx).
    return (vectorA[0] * vectorB[1] - vectorA[1] * vectorB[0]);
}
