// Function to determine the region type based on coordinates and a scaling factor.
function getRegionChar(sizeVal, rowCoord, colCoord) {

  // Check the first dark region quadrant.
  if (0 <= rowCoord && rowCoord < sizeVal && 0 <= colCoord && colCoord < sizeVal) {
    return "DARK"; // Indicate a dark region.
  }
  // Check the second dark region quadrant, shifted by 'sizeVal'.
  else if (sizeVal <= rowCoord && rowCoord < 2 * sizeVal && sizeVal <= colCoord && colCoord < 2 * sizeVal) {
    return "DARK"; // Another dark region.
  }

  // If neither dark region is matched, it's a light region.
  return "LIGHT";
}


// Main program entry point.
function ProcessInputAndFindBestMatch(rawData) {

  // Parse the initial configuration line.
  var firstLineParts = rawData[0].split(" ");
  var numEntries = parseInt(firstLineParts[0], 10); // Total number of input entries.
  var scaleFactor = parseInt(firstLineParts[1], 10); // The scaling factor for regions.

  // This array will store processed coordinate information for each entry.
  var adjustedPoints = [];


  // Iterate through each input entry starting from the second line.
  for (var idx = 1; idx <= numEntries; idx++) {
    var tempParts = rawData[idx].split(" ");
    var origX = parseInt(tempParts[0], 10); // Original X coordinate.
    var origY = parseInt(tempParts[1], 10); // Original Y coordinate.
    var origColor = tempParts[2];             // Original color ('B' or 'W').


    // Calculate coordinates relative to the scaling factor.
    var remainderX = origX % scaleFactor;
    var remainderY = origY % scaleFactor;


    // Determine a transformation pattern based on the integer divisions.
    // This pattern helps decide if the color needs to be inverted.
    var transformPattern = (
      ((origX - remainderX) / scaleFactor) % 2 + // Parity of X-block.
      ((origY - remainderY) / scaleFactor) % 2   // Parity of Y-block.
    ) % 2 == 1 ? "INVERT" : "NORMAL";


    var transformedColor = origColor;

    // Apply color inversion if the pattern dictates it.
    if (transformPattern == "INVERT") {
      transformedColor = (transformedColor == "B") ? "W" : "B"; // Flip 'B' to 'W' or 'W' to 'B'.
    }

    // Store the adjusted coordinates and color.
    adjustedPoints[idx - 1] = [];
    // If the color is 'W', shift its X-coordinate by 'scaleFactor' for a specific mapping.
    adjustedPoints[idx - 1][0] = ((transformedColor == "W") ? remainderX + scaleFactor : remainderX);
    adjustedPoints[idx - 1][1] = remainderY;
  }

  // Initialize the counter for the highest number of matches found.
  var highestCount = 0;


  // Perform a grid search to find the optimal shift that maximizes matches.
  // The outer loop iterates through possible row shifts (0 to 2*scaleFactor - 1).
  for (var rowShift = 0; rowShift < 2 * scaleFactor; rowShift++) {
    // The inner loop iterates through possible column shifts (0 to scaleFactor - 1).
    for (var colShift = 0; colShift < scaleFactor; colShift++) {


      var currentCount = 0; // Counter for matches in the current shift configuration.

      // Check each processed point against the current shift.
      for (var pointIndex = 0; pointIndex < numEntries; pointIndex++) {
        var pointRow = adjustedPoints[pointIndex][0]; // Adjusted row coordinate.
        var pointCol = adjustedPoints[pointIndex][1]; // Adjusted column coordinate.

        // If the region type for the shifted point is "DARK", increment the match count.
        if ("DARK" == getRegionChar(scaleFactor, colShift + pointRow, rowShift + pointCol)) {
          currentCount++;
        }
      }
      // Update the highest match count if the current count is greater.
      if (highestCount < currentCount) {
        highestCount = currentCount;
      }
      // Optimization: If all entries match, we can stop early.
      if (highestCount == numEntries) {
        break;
      }
    }
    // Optimization: If all entries match, break the outer loop as well.
    if (highestCount == numEntries) {
      break;
    }
  }


  // Output the final maximum match count to the console.
  console.log('%s', highestCount);
}

// Invoke the main processing function with data read from standard input.
ProcessInputAndFindBestMatch(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));