var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data
var lineSegments = (rawData.trim()).split("\n");

// Remove the first line, which might be a count or header
lineSegments.shift();

// Iterate over each line representing a set of coordinates
lineSegments.forEach(function(currentLine) {

  // Split the line into individual coordinate components and convert to numbers
  var coordinateValues = currentLine.split(" ").map(Number);

  // Scale up the coordinate values by a factor
  coordinateValues = coordinateValues.map(function(val) {
    return val * 100000;
  });

  // Extract individual coordinate components for two line segments
  var point1X = coordinateValues[0];
  var point1Y = coordinateValues[1];
  var point2X = coordinateValues[2];
  var point2Y = coordinateValues[3];
  var point3X = coordinateValues[4];
  var point3Y = coordinateValues[5];
  var point4X = coordinateValues[6];
  var point4Y = coordinateValues[7];

  // Initialize the result string
  var resultString = "NO";

  // Check if both line segments are not vertical (to avoid division by zero)
  if (point2X - point1X !== 0 && point4X - point3X !== 0) {

    // Calculate the slope of the first line segment
    var slope1 = (point2Y - point1Y) / (point2X - point1X);

    // Calculate the slope of the second line segment
    var slope2 = (point4Y - point3Y) / (point4X - point3X);

    // If the slopes are equal, the lines are parallel
    if (slope1 === slope2) {
      resultString = "YES";
    }
  }

  // Output the determination
  console.log(resultString);
});
