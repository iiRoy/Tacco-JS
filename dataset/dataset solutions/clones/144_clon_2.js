// Define a constructor function for representing two-dimensional points or vectors.
function Coordinate(horizontal, vertical) {
  this.horizontal = horizontal; // Assigns the first coordinate component.
  this.vertical = vertical;     // Assigns the second coordinate component.
}

// Attach a method to the Coordinate prototype to calculate the vector difference between two points.
Coordinate.prototype.getDifference = function(otherPoint) {
  // Creates and returns a new Coordinate instance representing the vector from 'otherPoint' to 'this' point.
  return new Coordinate(this.horizontal - otherPoint.horizontal, this.vertical - otherPoint.vertical);
};

// Attach a method to the Coordinate prototype to compute the 2D cross product.
Coordinate.prototype.computeCrossProduct = function(anotherPoint) {
  // Calculates the 'z' component of the cross product for two 2D vectors (this.vec and anotherPoint.vec).
  // This value indicates the orientation of 'anotherPoint' relative to 'this' vector.
  return this.horizontal * anotherPoint.vertical - this.vertical * anotherPoint.horizontal;
};


// This immediately-invoked function expression handles the main input processing logic.
(function(sourceText) {
  // First, remove any single trailing newline character from the input string.
  // Then, split the processed string into an array of individual lines.
  var lineSegments = sourceText.replace(/\n$/, '').split('\n');
  // Store the total number of lines to be processed.
  var totalEntries = lineSegments.length;

  // Loop through each line of the input data.
  for (var lineIndex = 0; lineIndex < totalEntries; lineIndex++) {
    // Extract the first line from the array, split it by commas, and convert each part to a number.
    var parsedCoordinates = lineSegments.shift().split(',').map(Number);
    // Call the primary geometry checking function with the parsed numbers as arguments,
    // and print its return value to the console.
    console.log(determineOverlap.apply(null, parsedCoordinates));
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Reads the entire content of standard input as UTF-8.


// This function checks if a quadrilateral defined by four points is convex.
function determineOverlap(ptAX, ptAY, ptBX, ptBY, ptCX, ptCY, ptDX, ptDY) {
  // Instantiate Coordinate objects for each of the four input points.
  var pointCoordA = new Coordinate(ptAX, ptAY);
  var pointCoordB = new Coordinate(ptBX, ptBY);
  var pointCoordC = new Coordinate(ptCX, ptCY);
  var pointCoordD = new Coordinate(ptDX, ptDY);

  // Calculate the vectors representing the sides of the quadrilateral in sequence.
  var vecBA = pointCoordB.getDifference(pointCoordA); // Vector A to B
  var vecCB = pointCoordC.getDifference(pointCoordB); // Vector B to C
  var vecDC = pointCoordD.getDifference(pointCoordC); // Vector C to D
  var vecAD = pointCoordA.getDifference(pointCoordD); // Vector D to A (closes the loop)

  // Compute the 2D cross products for consecutive side vectors.
  // The sign of the cross product indicates the turning direction at each vertex.
  var orientation1 = vecBA.computeCrossProduct(vecCB);
  var orientation2 = vecCB.computeCrossProduct(vecDC);
  var orientation3 = vecDC.computeCrossProduct(vecAD);
  var orientation4 = vecAD.computeCrossProduct(vecBA);

  // A quadrilateral is convex if all turns are consistently in the same direction (all cross products have the same sign).
  if ((orientation1 > 0 && orientation2 > 0 && orientation3 > 0 && orientation4 > 0) ||
    (orientation1 < 0 && orientation2 < 0 && orientation3 < 0 && orientation4 < 0)) {
    return 'YES'; // The quadrilateral is convex.
  }
  return 'NO'; // The quadrilateral is not convex.
}

// A simple helper function to calculate the 2D cross product (determinant) of two vectors.
function calculateDeterminant2D(val1X, val1Y, val2X, val2Y) {
  // Computes (val1X * val2Y) - (val2X * val1Y).
  return val1X * val2Y - val2X * val1Y;
}