function processTriangleData(rawData) {
  // Define the maximum allowed side length for a triangle.
  const limitVal = 1000;

  // Split the raw input string into individual rows using the newline character.
  const dataRows = splitInputIntoRows(rawData, "\n");
  // Process each row to extract side measurements, converting them to an array of arrays.
  const sideMeasurements = dataRows.map(parseRowToSides);

  // Iterate through each set of side measurements to evaluate the triangles.
  for (let idx = 0; idx < sideMeasurements.length; idx++) {
    const currentSides = sideMeasurements[idx];

    // Perform a specific check for the very first side of the first triangle.
    if (idx === 0) {
      // If the first side exceeds the defined limit, halt further processing.
      if (currentSides[0] > limitVal) {
        break;
      }
    }

    // Create a new GeometricShape object with specified bounds and side lengths.
    const triangleObj = new GeometricShape({
      bounds: {
        lowerBound: 1, // Minimum allowed side length.
        upperBound: 1000 // Maximum allowed side length.
      },
      sides: {
        sideA: currentSides[0],
        sideB: currentSides[1],
        sideC: currentSides[2]
      }
    });

    // Check if the constructed triangle object has valid side lengths.
    if (triangleObj.isShapeValid()) {
      // Determine if the valid triangle is a right-angled triangle.
      const isOrthogonalTriangle = triangleObj.checkRightAngle();
      // Prepare the output string based on the right-angle check.
      const outputString = (isOrthogonalTriangle) ? 'YES' : 'NO';
      console.log(outputString); // Print the result to the console.
    }
  }
}

// Utility function to split a given text into an array of rows using a specified separator.
function splitInputIntoRows(sourceText, separatorChar) {
  return sourceText.split(separatorChar);
}

// Utility function to parse a single input row string into an array of side length strings.
function parseRowToSides(inputRow) {
  const sideStrings = inputRow.split(' '); // Split the row by space.
  return sideStrings;
}


// GeometricShape constructor function, representing a triangle.
function GeometricShape(configOpts) {

  this.bounds = {}; // Object to hold minimum and maximum side length constraints.
  this.sides = {}; // Object to hold the three side lengths of the triangle.

  // Initialize the bounds for side lengths, using defaults if not provided.
  this.bounds.lowerBound = configOpts.bounds.lowerBound || 1;
  this.bounds.upperBound = configOpts.bounds.upperBound || 1000;

  // Initialize the side lengths, validating each against the defined bounds.
  this.sides.sideA = (this.isSideWithinBounds(configOpts.sides.sideA)) ? configOpts.sides.sideA : null;
  this.sides.sideB = (this.isSideWithinBounds(configOpts.sides.sideB)) ? configOpts.sides.sideB : null;
  this.sides.sideC = (this.isSideWithinBounds(configOpts.sides.sideC)) ? configOpts.sides.sideC : null;

}

// Prototype method to check if a given side length is within the triangle's defined bounds.
GeometricShape.prototype.isSideWithinBounds = function(sideLength) {
  return (sideLength >= this.bounds.lowerBound && sideLength <= this.bounds.upperBound);
};

// Prototype method to check if all three side lengths of the triangle are valid (not null).
GeometricShape.prototype.isShapeValid = function() {
  return (this.sides.sideA && this.sides.sideB && this.sides.sideC);
};

// Prototype method to determine if the triangle is a right-angled triangle.
GeometricShape.prototype.checkRightAngle = function() {
  let resultFlag = false; // Initialize a flag to store the result.

  // Proceed only if the triangle's side lengths are valid.
  if (this.isShapeValid()) {
    const sideLengthsArr = []; // Create an array to hold the side lengths.
    sideLengthsArr.push(this.sides.sideA);
    sideLengthsArr.push(this.sides.sideB);
    sideLengthsArr.push(this.sides.sideC);

    // Sort the side lengths in ascending order to easily identify the hypotenuse.
    sideLengthsArr.sort(function(val1, val2) {
      return val1 - val2;
    });

    // Calculate the square of each side length.
    const squaredLengths = sideLengthsArr.map(function(sideVal) {
      return Math.pow(sideVal, 2);
    });

    // Apply the Pythagorean theorem: a^2 + b^2 = c^2 for a right triangle.
    resultFlag = (squaredLengths[2] === (squaredLengths[0] + squaredLengths[1]));
  }

  return resultFlag; // Return true if it's a right-angled triangle, false otherwise.
};

// Read the entire content from standard input, decode as UTF-8, and remove leading/trailing whitespace.
const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
// Begin processing the input data to generate and evaluate triangles.
processTriangleData(fileContent);
