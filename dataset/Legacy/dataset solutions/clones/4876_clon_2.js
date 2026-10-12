function ProcessInput(rawData) {
  // Split the entire input string into an array of individual lines.
  // The first line contains initial boundary values, subsequent lines contain updates.
  let lineData = rawData.split("\n");

  // Parse the first line to establish the initial maximum X and Y coordinates.
  // The minimum X and Y coordinates are initialized to zero.
  let currentLineParts = lineData[0].split(" ");

  let maximumXCoordinate = parseInt(currentLineParts[0], 10);
  let minimumXCoordinate = 0; // Initial lower bound for X
  let maximumYCoordinate = parseInt(currentLineParts[1], 10);
  let minimumYCoordinate = 0; // Initial lower bound for Y

  // Iterate through the remaining lines of input, starting from the second line.
  // Each line represents a constraint that potentially modifies the bounding box.
  for (let lineIndex = 1; lineIndex < lineData.length; lineIndex++) {
    currentLineParts = lineData[lineIndex].split(" ");

    // The third part of the line (index 2) indicates the type of constraint.
    // Based on the constraint type, update the respective coordinate boundary.
    if (currentLineParts[2] == 1) {
      // Constraint type 1: Update minimum X if the current value is greater.
      if (minimumXCoordinate < parseInt(currentLineParts[0], 10)) {
        minimumXCoordinate = parseInt(currentLineParts[0], 10);
      }
    } else if (currentLineParts[2] == 2) {
      // Constraint type 2: Update maximum X if the current value is smaller.
      if (maximumXCoordinate > parseInt(currentLineParts[0], 10)) {
        maximumXCoordinate = parseInt(currentLineParts[0], 10);
      }
    } else if (currentLineParts[2] == 3) {
      // Constraint type 3: Update minimum Y if the current value is greater.
      if (minimumYCoordinate < parseInt(currentLineParts[1], 10)) {
        minimumYCoordinate = parseInt(currentLineParts[1], 10);
      }
    } else if (currentLineParts[2] == 4) {
      // Constraint type 4: Update maximum Y if the current value is smaller.
      if (maximumYCoordinate > parseInt(currentLineParts[1], 10)) {
        maximumYCoordinate = parseInt(currentLineParts[1], 10);
      }
    }
  }

  // Calculate the width and height of the final bounding box.
  // If the calculated area is less than 1 (meaning width or height is non-positive),
  // the effective area is 0. Otherwise, output the calculated area.
  let calculatedWidth = maximumXCoordinate - minimumXCoordinate;
  let calculatedHeight = maximumYCoordinate - minimumYCoordinate;

  if (calculatedWidth * calculatedHeight < 1) {
    console.log(0);
  } else {
    console.log(calculatedWidth * calculatedHeight);
  }
}

// This section handles reading input from standard input and invoking the main processing function.
// It should not be modified as it's part of the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
