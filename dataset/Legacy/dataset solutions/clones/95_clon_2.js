var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data
var lineSegments = fileContent.replace(/\n$/, '').split('\n');

// Get the total number of test cases
var numCases = Number(lineSegments.shift());

// Iterate through each test case
for (var caseIndex = 0; caseIndex < numCases; caseIndex++) {
  // Parse the coordinates and radii for the current case
  var currentCoords = lineSegments.shift().split(' ').map(Number);

  // Extract values for the first circle
  var circleOneX = currentCoords.shift();
  var circleOneY = currentCoords.shift();
  var circleOneRadius = currentCoords.shift();

  // Extract values for the second circle
  var circleTwoX = currentCoords.shift();
  var circleTwoY = currentCoords.shift();
  var circleTwoRadius = currentCoords.shift();

  // Calculate the Euclidean distance between the centers of the two circles
  var distanceBetweenCenters = Math.sqrt(Math.pow(circleTwoX - circleOneX, 2) + Math.pow(circleTwoY - circleOneY, 2));

  // Determine the relationship between the circles based on their distance and radii
  if (distanceBetweenCenters <= circleOneRadius + circleTwoRadius) {
    // Circles intersect or one is inside the other
    if (distanceBetweenCenters < circleTwoRadius - circleOneRadius) {
      // First circle is completely inside the second circle
      console.log(-2);
    } else if (distanceBetweenCenters < circleOneRadius - circleTwoRadius) {
      // Second circle is completely inside the first circle
      console.log(2);
    } else {
      // Circles intersect at one or two points, or are tangent externally
      console.log(1);
    }
  } else {
    // Circles are separate and do not touch
    console.log(0);
  }
}
