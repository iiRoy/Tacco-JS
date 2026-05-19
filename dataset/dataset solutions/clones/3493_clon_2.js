function ProcessInput(data) {
  // Split the input string into an array of lines.
  const lines = data.split('\n');

  // Iterate through possible X coordinates from 0 to 100.
  for (let coordX = 0; coordX <= 100; coordX++) {
    // For each X, iterate through possible Y coordinates from 0 to 100.
    for (let coordY = 0; coordY <= 100; coordY++) {
      // Check if the current (coordX, coordY) pair is a valid center.
      const resultCheck = checkValidity(lines, coordX, coordY);

      // If a valid center is found (resultCheck is not false),
      // return the coordinates and the calculated height.
      if (resultCheck) {
        return `${coordX} ${coordY} ${resultCheck}`;
      }
    }
  }
}

function checkValidity(inputLines, currentX, currentY) {
  // The first line contains the number of data points.
  const numPoints = inputLines[0];
  // Initialize a variable to store the common height, if found.
  let commonHeight = 0;

  // Loop through each data point starting from the second line.
  for (let pointIndex = 1; pointIndex <= numPoints; pointIndex++) {
    // Split the current line into components (x, y, h).
    const pointData = inputLines[pointIndex].split(' ');
    const pointX = pointData[0] * 1; // Convert string to number.
    const pointY = pointData[1] * 1; // Convert string to number.
    const pointHeight = pointData[2] * 1; // Convert string to number.

    // Only consider points that have a non-zero height.
    if (pointHeight !== 0) {
      // Calculate the expected height for this point based on the current center (currentX, currentY).
      const calculatedHeight = pointHeight + Math.abs(currentX - pointX) + Math.abs(currentY - pointY);

      // If this is the first non-zero height point encountered, set the common height.
      if (commonHeight === 0) {
        commonHeight = calculatedHeight;
      } else {
        // If a common height was already established, check if the current calculated height matches it.
        // If it doesn't match, this (currentX, currentY) is not a valid center.
        if (commonHeight !== calculatedHeight) {
          return false; // Not a valid center.
        }
      }
    }
  }
  // If all non-zero height points are consistent, return the common height.
  return commonHeight;
}

// Read input from standard input and print the result to standard output.
console.log(ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8')));
