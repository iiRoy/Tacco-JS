const fileUtility = require('fs');

// Acquire the size of the standard input stream.
let contentLength = fileUtility.fstatSync(process.stdin.fd).size;

// Allocate a buffer to store the incoming data.
let dataBuffer = new Buffer(contentLength);

// Read bytes from standard input into the buffer.
let actualBytesRead = fileUtility.readSync(
  process.stdin.fd,
  dataBuffer,
  0,
  contentLength,
  0
);

// Process the raw bytes into an array of strings, one per line.
let inputRows = dataBuffer
  .toString('utf8', 0, actualBytesRead)
  .trim()
  .split('\n');

// Begin the main execution flow.
processAllEntries();

function processAllEntries() {
  for (
    let rowIndex = 0, totalRows = inputRows.length;
    rowIndex < totalRows;
    rowIndex++
  ) {
    // Split the current input line into individual string components.
    let rowComponents = inputRows[rowIndex].split(' ');

    let componentIdx = 0;

    // Define three vertices of a triangle and a query point.
    let pointOne = new PlanarVector(
      rowComponents[componentIdx++],
      rowComponents[componentIdx++]
    );
    let pointTwo = new PlanarVector(
      rowComponents[componentIdx++],
      rowComponents[componentIdx++]
    );
    let pointThree = new PlanarVector(
      rowComponents[componentIdx++],
      rowComponents[componentIdx++]
    );
    let queryPoint = new PlanarVector(
      rowComponents[componentIdx++],
      rowComponents[componentIdx++]
    );

    // Calculate vectors representing the edges of the triangle.
    let vecOneTwo = pointTwo.getVectorDifference(pointOne);
    let vecTwoQuery = queryPoint.getVectorDifference(pointTwo);

    let vecTwoThree = pointThree.getVectorDifference(pointTwo);
    let vecThreeQuery = queryPoint.getVectorDifference(pointThree);

    let vecThreeOne = pointOne.getVectorDifference(pointThree);
    let vecOneQuery = queryPoint.getVectorDifference(pointOne);

    // Compute cross products to determine the orientation of the query point
    // relative to each triangle edge.
    let crossResultA = vecOneTwo.computeCrossProduct(vecTwoQuery);
    let crossResultB = vecTwoThree.computeCrossProduct(vecThreeQuery);
    let crossResultC = vecThreeOne.computeCrossProduct(vecOneQuery);

    // Check if all cross products have the same sign (indicating the point is inside).
    if (
      (crossResultA > 0 && crossResultB > 0 && crossResultC > 0) ||
      (crossResultA < 0 && crossResultB < 0 && crossResultC < 0)
    ) {
      console.log('INSIDE');
    } else {
      console.log('OUTSIDE');
    }
  }
}

// Constructor function for a 2D vector or point.
function PlanarVector(xInput, yInput) {
  this.xCoord = parseInt(xInput, 10);
  this.yCoord = parseInt(yInput, 10);

  // Method to calculate the vector difference between this vector and another.
  this.getVectorDifference = function (otherVector) {
    return new PlanarVector(
      this.xCoord - otherVector.xCoord,
      this.yCoord - otherVector.yCoord
    );
  };

  // Method to compute the 2D cross product (scalar magnitude) with another vector.
  this.computeCrossProduct = function (anotherVector) {
    return this.xCoord * anotherVector.yCoord - this.yCoord * anotherVector.xCoord;
  };
}