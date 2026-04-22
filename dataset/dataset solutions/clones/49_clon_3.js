class SpatialPoint {
  constructor(horizontal, vertical) {
    this.horizontal = horizontal;
    this.vertical = vertical;
  }

  getDifferenceVector(otherPoint) {
    const horizontalDifference = this.horizontal - otherPoint.horizontal;
    const verticalDifference = this.vertical - otherPoint.vertical;
    return new SpatialPoint(horizontalDifference, verticalDifference);
  }

  calculateZCrossProduct(otherVector) {
    return (this.horizontal * otherVector.vertical) - (this.vertical * otherVector.horizontal);
  }

  static fromCoordinateArray(coordinatePair) {
    if (!Array.isArray(coordinatePair) || coordinatePair.length !== 2 || coordinatePair.some(isNaN)) {
      throw new Error("Invalid input for SpatialPoint.fromCoordinateArray. Expected an array of two numbers.");
    }
    return new SpatialPoint(coordinatePair[0], coordinatePair[1]);
  }
}

function isPointStrictlyInsideTriangle(vertexA, vertexB, vertexC, queryPoint) {
  // Basic validation to ensure all inputs are valid SpatialPoint instances.
  if (!(vertexA instanceof SpatialPoint &&
      vertexB instanceof SpatialPoint &&
      vertexC instanceof SpatialPoint &&
      queryPoint instanceof SpatialPoint)) {
    console.error("Error: One or more inputs are not valid SpatialPoint objects.");
    return false;
  }

  // Define vectors representing the triangle's edges and vectors from vertices to the query point.
  const vectorFromAtoB = vertexB.getDifferenceVector(vertexA);
  const vectorFromBtoC = vertexC.getDifferenceVector(vertexB);
  const vectorFromCtoA = vertexA.getDifferenceVector(vertexC);

  const vectorFromAtoP = queryPoint.getDifferenceVector(vertexA);
  const vectorFromBtoP = queryPoint.getDifferenceVector(vertexB);
  const vectorFromCtoP = queryPoint.getDifferenceVector(vertexC);

  // Compute the orientation (Z-component of cross product) for each edge-point pair.
  // The sign of this value indicates if the point is to the "left" or "right" of the directed edge.
  const orientationAB_P = vectorFromAtoB.calculateZCrossProduct(vectorFromAtoP);
  const orientationBC_P = vectorFromBtoC.calculateZCrossProduct(vectorFromBtoP);
  const orientationCA_P = vectorFromCtoA.calculateZCrossProduct(vectorFromCtoP);

  // Get the mathematical sign of each orientation.
  // Math.sign returns -1 for negative, 1 for positive, and 0 for zero.
  const signAB = Math.sign(orientationAB_P);
  const signBC = Math.sign(orientationBC_P);
  const signCA = Math.sign(orientationCA_P);

  // For the point to be strictly inside the triangle, all three orientation signs
  // must be non-zero and identical. This means the point must be on the same side
  // of all three triangle edges.
  const allSignsAreSame = (signAB === signBC && signBC === signCA);
  const noPointOnEdge = (signAB !== 0); // And implicitly signBC !== 0, signCA !== 0 if allSignsAreSame

  return allSignsAreSame && noPointOnEdge;
}

function processCoordinateInput(rawData) {
  // Sanitize and split the raw input string into individual lines.
  const inputLines = rawData.trim().split('\n');

  // Iterate over each line to process point-in-triangle queries.
  for (let i = 0; i < inputLines.length; i++) {
    const currentLineData = inputLines[i].trim();

    // Skip any empty lines that might occur from splitting or extra newlines.
    if (currentLineData.length === 0) {
      continue;
    }

    // Parse the line into an array of numbers.
    // Each line is expected to contain 8 space-separated numeric values:
    // x1 y1 x2 y2 x3 y3 px py
    const parsedNumbers = currentLineData.split(' ').map(coordinateString => parseFloat(coordinateString));

    // Perform basic validation on the parsed numbers.
    const REQUIRED_NUMBER_COUNT = 8;
    if (parsedNumbers.length !== REQUIRED_NUMBER_COUNT || parsedNumbers.some(isNaN)) {
      console.log('NO'); // Output 'NO' for malformed input lines.
      console.warn(`Warning: Skipping line ${i + 1} due to invalid data format or non-numeric values.`);
      continue;
    }

    // Helper function to extract a coordinate pair and advance the index.
    let currentNumberIndex = 0;
    const extractPoint = () => {
      const h = parsedNumbers[currentNumberIndex++];
      const v = parsedNumbers[currentNumberIndex++];
      return new SpatialPoint(h, v);
    };

    // Create SpatialPoint objects for the triangle vertices and the query point.
    const firstTriangleVertex = extractPoint();
    const secondTriangleVertex = extractPoint();
    const thirdTriangleVertex = extractPoint();
    const pointUnderInvestigation = extractPoint();

    // Determine if the point is inside the triangle and print the result.
    const isInside = isPointStrictlyInsideTriangle(
      firstTriangleVertex,
      secondTriangleVertex,
      thirdTriangleVertex,
      pointUnderInvestigation
    );

    console.log(isInside ? 'YES' : 'NO');
  }
}

// This self-executing anonymous function serves as the main entry point
// for the script, handling file reading and initiating the processing.
(function runApplication() {
  try {
    // Read the entire standard input file synchronously.
    // Ensure 'utf8' encoding for proper string interpretation.
    const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Pass the raw content to the dedicated processing function.
    processCoordinateInput(rawInputContent);
  } catch (error) {
    console.error("An error occurred during file processing:", error.message);
    // Exit with a non-zero code to indicate an error, if this were a production script.
    // process.exit(1);
  }
})();