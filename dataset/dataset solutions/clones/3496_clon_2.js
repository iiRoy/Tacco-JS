// This function serves as the primary entry point for processing the input data.
function processInput(rawData) {
  // Split the raw input string into an array of lines.
  var linesArray = rawData.split("\n");

  // Iterate through possible X coordinates from 0 to 100.
  for (var coordX = 0; coordX <= 100; coordX++) {
    // For each X, iterate through possible Y coordinates from 0 to 100.
    for (var coordY = 0; coordY <= 100; coordY++) {
      // Check if the current (coordX, coordY) pair is a feasible center point.
      var isFeasible = checkFeasibility(linesArray, coordX, coordY);

      // If a feasible center is found, return its coordinates along with the derived height.
      if (isFeasible) {
        return "" + coordX + " " + coordY + " " + isFeasible;
      }
    }
  }
}

// This helper function determines if a given (currentX, currentY) coordinate pair
// is a valid center for all observed points.
function checkFeasibility(lineData, currentX, currentY) {
  // The first line contains the total number of observation points.
  var entryCount = Number(lineData[0]); // Parse the count of data points.

  // A variable that was potentially meant for an initial height, but currently unused in logic.
  var referenceHeight = 0;

  // Initialize the upper and lower bounds for the central height.
  var upperBoundHeight = 1000000000;
  var lowerBoundHeight = 1;

  // Loop through each observation point, starting from the second line (index 1).
  for (var pointIndex = 1; pointIndex <= entryCount; pointIndex++) {
    // Split the current line into its constituent parts (x, y, h).
    var coordinateParts = lineData[pointIndex].split(" ");

    // Extract and convert coordinate values and the observed height to numbers.
    var pointX = Number(coordinateParts[0]);
    var pointY = Number(coordinateParts[1]);
    var pointHeight = Number(coordinateParts[2]);

    // Calculate the expected height at the potential center (currentX, currentY)
    // based on the current observation point (pointX, pointY, pointHeight).
    var calculatedHeight =
      pointHeight + Math.abs(currentX - pointX) + Math.abs(currentY - pointY);

    // If the observed height (pointHeight) is 0, it means this point is a "base"
    // and only provides an upper bound for the central height.
    if (pointHeight === 0) {
      if (upperBoundHeight > calculatedHeight) {
        upperBoundHeight = calculatedHeight; // Update the upper bound if this point suggests a lower max.
      }
    } else {
      // If pointHeight is not 0, this point provides both upper and lower bounds.
      if (upperBoundHeight > calculatedHeight) {
        upperBoundHeight = calculatedHeight; // Update upper bound.
      }
      if (lowerBoundHeight < calculatedHeight) {
        lowerBoundHeight = calculatedHeight; // Update lower bound.
      }
    }

    // If at any point the lower bound exceeds the upper bound,
    // this (currentX, currentY) is not a feasible center.
    if (lowerBoundHeight > upperBoundHeight) {
      return false; // Inconsistent bounds, return false.
    }
  }

  // After checking all points, if the lower and upper bounds for the central height
  // are not identical, it implies no single central height satisfies all conditions.
  if (lowerBoundHeight !== upperBoundHeight) {
    return false; // Bounds do not converge to a single value.
  }

  // If all conditions are met, return the determined central height.
  return lowerBoundHeight;
}

// Execute the main processing function with input read from standard input
// and output the result to the console.
console.log(processInput(require("fs").readFileSync("/dev/stdin", "utf8")));