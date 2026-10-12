function ProcessInput(rawData) {
  // The raw input string is split into an array of individual lines.
  var lines = rawData.split("\n");

  // The first line contains two space-separated values: N and M.
  var parts = lines[0].split(" ");
  var numItems = parts[0]; // This variable corresponds to 'N' in the problem description.
  var numRanges = parts[1]; // This variable corresponds to 'M', the total number of ranges.

  // Two arrays are initialized to store the left and right bounds of each range.
  var leftBounds = Array(numRanges); // 'L' in the original code.
  var rightBounds = Array(numRanges); // 'R' in the original code.

  // A loop iterates from the second line of input (index 1) up to the M-th line.
  // Each line represents a range with a left and right bound.
  for (var idx = 1; idx <= numRanges; idx++) {
    parts = lines[idx].split(" "); // The current line is split to get the two bounds.
    leftBounds[idx - 1] = parts[0]; // The first part is stored as a left bound.
    rightBounds[idx - 1] = parts[1]; // The second part is stored as a right bound.
  }

  // Variables are initialized to find the intersection of all ranges.
  // 'currentMaxLeft' will store the largest of all left bounds.
  // 'currentMinRight' will store the smallest of all right bounds.
  var currentMaxLeft = leftBounds[0]; // Initialize with the first range's left bound.
  var currentMinRight = rightBounds[0]; // Initialize with the first range's right bound.

  // The 'leftBounds' array is iterated to determine the overall maximum left boundary.
  leftBounds.forEach((boundVal, arrIndex) => {
    if (boundVal > currentMaxLeft) {
      currentMaxLeft = boundVal; // Update if a larger left bound is encountered.
    }
  });

  // The 'rightBounds' array is iterated to determine the overall minimum right boundary.
  rightBounds.forEach((boundVal, arrIndex) => {
    if (boundVal < currentMinRight) {
      currentMinRight = boundVal; // Update if a smaller right bound is encountered.
    }
  });

  // The length of the intersection of all ranges is calculated.
  // If 'currentMinRight' is less than 'currentMaxLeft', there is no valid intersection,
  // and this calculation will result in a non-positive number.
  var calculatedLength = currentMinRight - currentMaxLeft + 1;

  // The result is printed to the console.
  // If 'calculatedLength' is a positive number (truthy in JavaScript), it is printed.
  // Otherwise (if it's zero or negative, which are falsy), 0 is printed.
  if (calculatedLength) {
    console.log(calculatedLength);
  } else {
    console.log(0);
  }
}

// This statement reads the entire content of standard input synchronously
// and then passes it as a string to the 'ProcessInput' function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
