function ProcessInput(rawData) {
  // Initialize a counter for points meeting the criteria
  let occurrenceCount = 0;

  // Split the raw input into individual lines
  let lineSegments = rawData.split('\n');

  // Extract the minimum distance threshold from the first line
  // The first line contains "N M", where M is the target distance
  let minimumDistance = Number(lineSegments[0].split(' ')[1]);

  // Remove the first line and store the remaining lines as point data
  // These lines represent (x, y) coordinates
  let pointData = lineSegments.splice(1, lineSegments.length - 1);

  // Iterate through each set of coordinates
  for (let idx = 0; idx < pointData.length; idx++) {
    // Split the current line to get individual coordinate values
    let currentPointCoords = pointData[idx].split(' ');

    // Convert string coordinates to numbers
    let coordX = Number(currentPointCoords[0]);
    let coordY = Number(currentPointCoords[1]);

    // Calculate the Euclidean distance from the origin (0,0)
    // Distance = sqrt(x^2 + y^2)
    let calculatedDistance = Math.sqrt(Math.pow(coordX, 2) + Math.pow(coordY, 2));

    // Check if the rounded distance is greater than or equal to the minimum required distance
    if (Math.round(calculatedDistance) >= minimumDistance) {
      // Increment the counter if the condition is met
      ++occurrenceCount;
    }
  }

  // Output the final count of points that satisfy the condition
  console.log(occurrenceCount);
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
