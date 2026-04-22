// This function orchestrates the transformation of raw input into geometric shapes.
function processShapeData(rawData) {
  var upperLimit = 999; // Defines the maximum allowed coordinate value.

  // Break down the raw input string into individual lines.
  var inputRows = parseInputIntoRows(rawData, "\r\n");
  // Transform each line into a set of coordinate values.
  var allCoordinates = inputRows.map(convertRowToCoordinates);

  // Iterate through each collection of coordinates.
  for (var idx = 0; idx < allCoordinates.length; idx++) {
    var currentCoordSet = allCoordinates[idx]; // Get the current set of coordinates.

    // Perform an initial check on the very first coordinate set.
    if (idx === 0) {
      if (currentCoordSet[0] > upperLimit) {
        break; // Exit early if the first coordinate exceeds the maximum.
      }
    }

    // Instantiate a new geometric object with specified bounds and side lengths.
    var geometryObj = new Shape({
      bounds: {
        lowerBound: 0, // Minimum allowed dimension.
        upperBound: 999 // Maximum allowed dimension.
      },
      sides: {
        sideA: currentCoordSet[0],
        sideB: currentCoordSet[1],
        sideC: currentCoordSet[2]
      }
    });

    // Validate the newly created shape.
    if (geometryObj.isShapeValid()) {
      var isRightAngledShape = geometryObj.isRightAngled(); // Determine if it's a right-angled shape.
      // Prepare the message to be displayed.
      var outputMessage = (isRightAngledShape) ? 'TRUE' : 'FALSE';
      console.log(outputMessage); // Output the result.
    }
  }
}

// Utility function to split a string by a given character sequence.
function parseInputIntoRows(inputString, separatorChar) {
  return inputString.split(separatorChar);
}

// Converts a single string row into an array of numerical coordinate values.
function convertRowToCoordinates(lineString) {
  var coordinateValues = lineString.split(' '); // Split by space to get individual numbers.
  return coordinateValues;
}


// Shape: A constructor for defining geometric objects, specifically triangles in this context.
function Shape(configSettings) {

  // Initialize properties for boundary conditions and side lengths.
  this.bounds = {};
  this.sides = {};

  // Configure the acceptable range for side lengths.
  this.bounds.lowerBound = configSettings.bounds.lowerBound || 0; // Default min value.
  this.bounds.upperBound = configSettings.bounds.upperBound || 999; // Default max value.

  // Assign side lengths, ensuring they fall within the defined constraints.
  this.sides.sideA = (this.coordWithinBounds(configSettings.sides.sideA)) ? configSettings.sides.sideA : null;
  this.sides.sideB = (this.coordWithinBounds(configSettings.sides.sideB)) ? configSettings.sides.sideB : null;
  this.sides.sideC = (this.coordWithinBounds(configSettings.sides.sideC)) ? configSettings.sides.sideC : null;

}

// Prototype method to check if a given coordinate value is within the shape's defined boundaries.
Shape.prototype.coordWithinBounds = function(coordValue) {
  return (coordValue >= this.bounds.lowerBound && coordValue <= this.bounds.upperBound);
};

// Prototype method to determine if the shape has valid, non-null side lengths.
Shape.prototype.isShapeValid = function() {
  return (this.sides.sideA && this.sides.sideB && this.sides.sideC);
};

// Prototype method to check if the shape (triangle) is a right-angled one using Pythagorean theorem.
Shape.prototype.isRightAngled = function() {
  var resultFlag = false; // Initialize the outcome flag.
  if (this.isShapeValid) { // Proceed only if the shape's sides are valid.
    var sideLengths = []; // Array to hold side lengths.
    sideLengths.push(this.sides.sideA);
    sideLengths.push(this.sides.sideB);
    sideLengths.push(this.sides.sideC);

    // Sort the side lengths in ascending order for consistent calculation.
    sideLengths.sort(function(val1, val2) {
      return val1 - val2
    });

    // Calculate the square of each side length.
    var squaredLengths = sideLengths.map(function(coord) {
      return Math.pow(coord, 2)
    });
    // Apply Pythagorean theorem: a^2 + b^2 = c^2 (where c is the longest side).
    resultFlag = (squaredLengths[2] === (squaredLengths[0] + squaredLengths[1]));
  }

  return resultFlag; // Return the final determination.
};

// Read input from standard input, process it, and initiate the shape analysis.
var rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
processShapeData(rawInputData);