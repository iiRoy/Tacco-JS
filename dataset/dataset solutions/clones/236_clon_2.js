let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Retrieve raw data from standard input stream

const lineSegments = (rawData.trim()).split('\n'); // Process raw data: remove leading/trailing whitespace, then split into an array of lines

for (let segmentIndex = 0; segmentIndex < lineSegments.length; segmentIndex++) { // Iterate through each processed line segment
  // For each line, parse the space-separated numeric coordinate values
  let coordinateValues = lineSegments[segmentIndex].split(' ').map(Number);

  // An anonymous function is invoked for each set of coordinates to determine perpendicularity
  (function(pt1X, pt1Y, pt2X, pt2Y, pt3X, pt3Y, pt4X, pt4Y) {
    let slopeOne; // Represents the slope of the first line segment
    let slopeTwo; // Represents the slope of the second line segment

    // Calculate the slope of the first line (defined by points P1 and P2)
    if ( (pt2X - pt1X) !== 0 ) {
      slopeOne = ( (pt2Y - pt1Y) / (pt2X - pt1X) );
    } else {
      // If the line is vertical, its slope is considered infinite
      slopeOne = Infinity;
    }

    // Calculate the slope of the second line (defined by points P3 and P4)
    if ( (pt4X - pt3X) !== 0 ) {
      slopeTwo = ( (pt4Y - pt3Y) / (pt4X - pt3X) );
    } else {
      // If the line is vertical, its slope is considered infinite
      slopeTwo = Infinity;
    }

    let resultString = "NO"; // Initialize the result, assuming lines are not perpendicular

    // Check for perpendicularity conditions:

    // Case 1: One line is horizontal (slope 0) and the other is vertical (slope Infinity)
    if ( slopeOne === 0 && slopeTwo === Infinity ) {
      resultString = "YES";
    }

    // Case 2: One line is vertical (slope Infinity) and the other is horizontal (slope 0)
    if ( slopeTwo === 0 && slopeOne === Infinity ) {
      resultString = "YES";
    }

    // Case 3: Standard perpendicularity condition (product of slopes is -1)
    // Using a small epsilon value for floating-point comparison to account for precision issues
    const epsilonValue = 0.00000001; // A very small positive number
    if ( (slopeOne * slopeTwo + 1) < epsilonValue ) {
      resultString = "YES";
    }

    // Output the determination for the current pair of line segments
    console.log(resultString);
  }).apply(null, coordinateValues); // Execute the anonymous function with the parsed coordinate values
}