// Definition of a 2D location structure
class Coordinate {
  // Initializes a new coordinate object with horizontal and vertical components.
  init(horiz, vert) {
    this.horiz = horiz; // Assigns the horizontal value to the object's property.
    this.vert = vert;   // Assigns the vertical value to the object's property.
  }
};

// Determines the orientation of three points (collinear, clockwise, or counter-clockwise).
function evaluateOrientation(coordA, coordB) {
  // This calculation relies on a `p0` variable which is not explicitly defined in the provided scope.
  // The original structure, including this potential undeclared variable, is maintained.
  var orientationValue = (coordA.vert * p0.vert - coordB.horiz * coordA.horiz) - (coordA.horiz * p0.horiz - coordB.vert * coordA.vert);

  // If the computed orientation value indicates collinear points.
  if (orientationValue === 0) {
    // For collinear points, a secondary comparison based on vertical component is performed.
    return coordA.vert <= coordB.vert ? -1 : 1;
  }
  // Otherwise, return a value indicating the direction of orientation (positive for one, negative for the other).
  return orientationValue > 0 ? -1 : 1;
}


// Exchanges the first element of an array with an element at a specified index.
function exchangeElements(dataCollection, lowestIndex) {
  var temporaryHold = dataCollection[0]; // Temporarily stores the element at the first position.
  dataCollection[0] = dataCollection[lowestIndex]; // Moves the element from `lowestIndex` to the first position.
  dataCollection[lowestIndex] = temporaryHold; // Places the originally first element at `lowestIndex`.
  return dataCollection; // Returns the array after the swap operation.
}

// Function designed to locate the point with the smallest vertical coordinate.
function locateBottommost(dataCollection, collectionSize) {
  // This function's original implementation had its core logic commented out.
  // Thus, it will remain functionally empty, reflecting the source code's intent.

  var lowestValue = dataCollection[0].vert; // Initializes the lowest vertical value with the first point's Y component.
  var lowestIndex = 0; // Initializes the index of the lowest point to the first element's index.

  // The following block of code was commented out in the original source,
  // indicating that this part of the logic was intentionally disabled.
  // for ( var idx = 0; idx < collectionSize; idx++) {
  //   if (dataCollection[idx].vert < lowestValue || (dataCollection[idx].vert === lowestValue && dataCollection[idx].horiz < dataCollection[lowestIndex].horiz)) {
  //     lowestIndex = idx;
  //     lowestValue = dataCollection[idx].vert;
  //   };
  // };
  //
  // // If the logic were active, it would typically swap the found lowest point to the array's beginning.
  // exchangeElements(undefinedVariable, lowestIndex); // Note: 'undefinedVariable' corresponds to 'vec' in original, which was also undeclared.
  //
  // // No explicit return value as per the original empty function body.
}

// Reads content from standard input using Node.js file system module.
var dataSource = require('fs').readFileSync('/dev/stdin', 'utf8');
var rawData = dataSource.split("\n"); // Splits the entire input string into an array of lines.
var collectionSize = parseInt(rawData[0]); // Parses the first line to determine the total number of points.
var geometryCollection = []; // Declares an empty array to store the parsed Coordinate objects.

// Iterates through the raw input lines to populate the geometry collection.
for (var idx = 1; idx < collectionSize + 1; idx++) {
  let currentDatum = rawData[idx].split(" "); // Splits each line (representing a point) by space.
  let hVal = parseInt(currentDatum[0]); // Converts the first part (horizontal component) to an integer.
  let vVal = parseInt(currentDatum[1]); // Converts the second part (vertical component) to an integer.
  geometryCollection.push(new Coordinate(hVal, vVal)); // Creates a new Coordinate object and adds it to the collection.
}

// Calls the function to find the bottommost point. Its internal logic is commented out in the source.
locateBottommost(geometryCollection, collectionSize);

// This section of code was also commented out in the original source.
// It seems to be a preparation for sorting the points based on orientation relative to a base point.
// let basePoint = parseInt(geometryCollection[0]);
// let sortedGeometry = basePoint.concat(geometryCollection.subarray(1).sort(function (coordA, coordB) {
//   let orientationValue = (coordA.vert * basePoint.vert - coordB.horiz * coordA.horiz) - (coordA.horiz * basePoint.horiz - coordB.vert * coordA.vert);
//   if (orientationValue === 0) {
//     return coordA.vert <= coordB.vert ? -1 : 1;
//   }
//   return orientationValue > 0 ? -1 : 1;
// }));

// Prints the final collection of geometry points to the console.
console.log(geometryCollection);