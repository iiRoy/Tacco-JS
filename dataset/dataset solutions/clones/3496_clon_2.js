function ProcessInput(data) {
  // Split the input string into an array of lines
  let lines = data.split('\n');

  // Iterate through possible X coordinates from 0 to 100
  for (let coordX = 0; coordX <= 100; coordX++) {
    // Iterate through possible Y coordinates from 0 to 100
    for (let coordY = 0; coordY <= 100; coordY++) {
      // Check if the current (coordX, coordY) pair is valid
      let resultValue = checkValidity(lines, coordX, coordY);

      // If a valid height is found, return the coordinates and the height
      if (resultValue) {
        return '' + coordX + ' ' + coordY + ' ' + resultValue;
      }
    }
  }
}

/**
 * Checks if a given (currentX, currentY) coordinate pair is valid
 * based on the input data, and returns the calculated height if valid.
 * @param {string[]} inputLines - Array of input data lines.
 * @param {number} currentX - The X coordinate to check.
 * @param {number} currentY - The Y coordinate to check.
 * @returns {number|boolean} The calculated height if valid, otherwise false.
 */
function checkValidity(inputLines, currentX, currentY) {
  // The first line contains the number of data entries
  const numEntries = inputLines[0];
  // This variable is declared but not used in the original logic,
  // so it's kept for structural equivalence.
  let initialHeight = 0;

  // Initialize maximum and minimum possible heights
  let maximumPossibleHeight = 1_000_000_000; // A very large number
  let minimumPossibleHeight = 1; // Minimum possible height is 1

  // Loop through each data entry starting from the second line
  for (let entryIndex = 1; entryIndex <= numEntries; entryIndex++) {
    // Split the current entry line into components
    const entryData = inputLines[entryIndex].split(' ');
    const pointX = entryData[0] * 1; // Convert string to number
    const pointY = entryData[1] * 1; // Convert string to number
    const observedHeight = entryData[2] * 1; // Convert string to number

    // Calculate the potential height for the current entry based on (currentX, currentY)
    let calculatedHeight = observedHeight + Math.abs(currentX - pointX) + Math.abs(currentY - pointY);

    // Update maximumPossibleHeight and minimumPossibleHeight based on the observed height
    if (observedHeight === 0) {
      // If observed height is 0, it means the actual height must be less than or equal to calculatedHeight
      if (maximumPossibleHeight > calculatedHeight) {
        maximumPossibleHeight = calculatedHeight;
      }
    } else {
      // If observed height is not 0, the actual height must be exactly calculatedHeight
      // So, it must be less than or equal to calculatedHeight
      if (maximumPossibleHeight > calculatedHeight) {
        maximumPossibleHeight = calculatedHeight;
      }
      // And it must be greater than or equal to calculatedHeight
      if (minimumPossibleHeight < calculatedHeight) {
        minimumPossibleHeight = calculatedHeight;
      }
    }

    // If at any point the minimum possible height exceeds the maximum possible height,
    // this (currentX, currentY) pair is invalid.
    if (minimumPossibleHeight > maximumPossibleHeight) {
      return false;
    }
  }

  // After checking all entries, if minimumPossibleHeight is not equal to maximumPossibleHeight,
  // it means there's no single consistent height, so the pair is invalid.
  if (minimumPossibleHeight !== maximumPossibleHeight) {
    return false;
  }

  // If all checks pass, return the consistent height.
  return minimumPossibleHeight;
}

// Read input from stdin and pass it to the main processing function
console.log(ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8')));
