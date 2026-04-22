/*
  This script computes the area of a polygon given its vertices.
  It uses the Shoelace formula, specifically by triangulating the polygon
  relative to the first vertex and summing signed areas of triangles.
*/

var displayOutput = console.log;

if (typeof process !== "undefined") {
  let receivedStreamData = "";
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', function (dataPortion) {
    receivedStreamData += dataPortion;
  });

  process.stdin.on('end', function () {
    let inputLines = receivedStreamData.split("\n");
    processPolygonData(inputLines);
  });
}


function processPolygonData(rawInputLines) {
  // Convert each line into an array of numbers or strings, filtering empty elements.
  const processedInputRows = rawInputLines.map(function (singleRow) {
    return singleRow.split(" ")
      .filter(function (item) {
        return item !== "";
      })
      .map(function (elementStr) {
        const numericValue = Number(elementStr);
        // If conversion results in NaN, keep the original string after trimming newlines.
        if (numericValue.toString() === "NaN") {
          return elementStr.replace(/(\r)|(\n)/g, "");
        }
        return numericValue;
      });
  });

  // Remove the first row, which typically contains the number of vertices.
  processedInputRows.shift();

  // The remaining rows represent the polygon's vertices.
  const vertexCoordinates = processedInputRows;

  // For Shoelace formula, order might matter. This line is commented out.
  // vertexCoordinates.reverse();


  const originVertex = vertexCoordinates[0];
  let currentVertex, nextVertex;
  let totalSignedArea = 0;
  const vertexCount = vertexCoordinates.length;

  // Iterate through vertices to form triangles with the origin vertex.
  // The loop runs from the second vertex to the second-to-last vertex.
  for (let idx = 1; idx < vertexCount - 1; idx++) {
    currentVertex = vertexCoordinates[idx];
    nextVertex = vertexCoordinates[idx + 1];
    // Accumulate the signed area of the triangle formed by originVertex, currentVertex, and nextVertex.
    totalSignedArea += computeTriangleOrientation(originVertex, currentVertex, nextVertex);
  }

  // The total signed area needs to be divided by two to get the final polygon area.
  let finalAreaString = "" + (totalSignedArea / 2);
  let decimalPointIndex = finalAreaString.indexOf(".");

  if (decimalPointIndex === -1) {
    // If no decimal point, append ".0" for consistent formatting.
    finalAreaString += ".0";
  } else {
    // If there is a decimal, truncate to one decimal place.
    // This effectively rounds towards zero for the second decimal place.
    finalAreaString = finalAreaString.slice(0, decimalPointIndex + 2);
  }
  displayOutput(finalAreaString);
}

function computeTriangleOrientation(pointOne, pointTwo, pointThree) {
  // Calculate vectors from pointOne to pointTwo and pointOne to pointThree.
  const vectorA = [pointTwo[0] - pointOne[0], pointTwo[1] - pointOne[1]];
  const vectorB = [pointThree[0] - pointOne[0], pointThree[1] - pointOne[1]];

  // Return the scalar component of the 2D cross product.
  // This value's sign indicates orientation, and its magnitude is twice the signed area.
  return calculateCrossProductScalar(vectorA, vectorB);
}

function calculateCrossProductScalar(vecA, vecB) {
  // Computes the 2D cross product scalar: (Ax * By - Ay * Bx)
  return (vecA[0] * vecB[1] - vecA[1] * vecB[0]);
}