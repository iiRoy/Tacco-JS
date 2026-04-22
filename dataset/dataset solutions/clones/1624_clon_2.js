// Function to analyze spatial data points based on a distance criterion
function ProcessCoordinates(rawData) {
  // Initialize a tally for points satisfying the condition
  let matchCounter = 0;

  // Divide the complete input string into individual lines
  let lineData = rawData.split('\n');

  // Parse the required minimum distance from the first line of input
  // The threshold is expected as the second number on the first line
  const thresholdDistance = Number(lineData[0].split(' ')[1]);

  // Extract all subsequent lines, which contain the actual coordinate pairs
  // The splice method modifies lineData in place, returning the removed elements
  let pointList = lineData.splice(1, lineData.length - 1);

  // Iterate over each entry in the list of points
  for (let idx = 0; idx < pointList.length; idx++) {
    // Separate the X and Y components of the current coordinate string
    let coordPair = pointList[idx].split(' ');

    // Convert the string representations of coordinates into numerical values
    const xCoord = Number(coordPair[0]);
    const yCoord = Number(coordPair[1]);

    // Compute the Euclidean distance from the origin (0,0) to the current point (xCoord, yCoord)
    // This involves squaring each coordinate, summing them, and then taking the square root
    let calculatedDistance = Math.sqrt(Math.pow(xCoord, 2) + Math.pow(yCoord, 2));

    // Evaluate if the rounded distance is greater than or equal to the predefined threshold
    if (Math.round(calculatedDistance) >= thresholdDistance) {
      // If the condition holds true, increment our counter
      matchCounter++;
    }
  }

  // Display the total number of points that met the distance requirement
  console.log(matchCounter);
}

// Read the entire content of standard input synchronously, encoded as UTF-8,
// then pass it to the main processing function
ProcessCoordinates(require("fs").readFileSync("/dev/stdin", "utf8"));