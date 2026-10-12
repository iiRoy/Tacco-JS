function ProcessInput(rawData) {
  // Split the entire input string into individual lines.
  let processedLines = rawData.split("\n");

  // Parse the first line for general parameters.
  let firstLineParts = processedLines[0].split(" ");

  // Extract X-coordinates from the second line.
  let xCoordinates = processedLines[1].split(" ");

  // Extract Y-coordinates from the third line.
  let yCoordinates = processedLines[2].split(" ");

  // Convert string parts to integers.
  let countN = parseInt(firstLineParts[0], 10);
  let countM = parseInt(firstLineParts[1], 10);
  let initialX = parseInt(firstLineParts[2], 10);
  let initialY = parseInt(firstLineParts[3], 10);

  // Check for an immediate "War" condition.
  if (initialX >= initialY) {
    console.log('War');
    return;
  }

  // Initialize maximum X and minimum Y values.
  let maximumXValue = initialX;
  let minimumYValue = initialY;

  // Iterate through X-coordinates to find the true maximum X.
  for (let currentValue of xCoordinates) {
    if (parseInt(currentValue) > parseInt(maximumXValue)) {
      maximumXValue = currentValue;
    }
  }

  // Iterate through Y-coordinates to find the true minimum Y.
  for (let currentValue of yCoordinates) {
    if (parseInt(currentValue) < parseInt(minimumYValue)) {
      minimumYValue = currentValue;
    }
  }

  // Determine the final outcome based on the calculated maximum X and minimum Y.
  if (parseInt(minimumYValue) >= parseInt(maximumXValue)) {
    console.log('War');
  } else {
    console.log('No War');
  }
}

// This section handles reading input and invoking the main processing function.
// It should not be modified as it interacts with the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
