function processRangeData(rawInputString) {
  const dataLines = rawInputString.split('\n');
  const firstLineParts = dataLines[0].split(' ');

  // The first part of the first line (N) is read but not used in the calculation.
  // It's kept here to mirror the original input parsing structure.
  const totalElementsCount = firstLineParts[0];
  // The second part of the first line (M) determines the number of ranges.
  // It's parsed as an integer for loop iteration.
  const numberOfRangeSets = parseInt(firstLineParts[1], 10);

  // Initialize arrays to store the left and right boundaries.
  // They are populated with string values to preserve the original's string comparison behavior.
  const leftBoundaryValues = [];
  const rightBoundaryValues = [];

  // Iterate through the input lines, starting from the second line (index 1),
  // to populate the boundary arrays.
  for (let lineIndex = 1; lineIndex <= numberOfRangeSets; lineIndex++) {
    const currentLineSegments = dataLines[lineIndex].split(' ');
    leftBoundaryValues.push(currentLineSegments[0]);
    rightBoundaryValues.push(currentLineSegments[1]);
  }

  // Initialize the current maximum left boundary and minimum right boundary
  // with the first elements from their respective arrays.
  // These variables will hold string values.
  let currentMaxLeftBoundary = leftBoundaryValues[0];
  let currentMinRightBoundary = rightBoundaryValues[0];

  // Iterate through all collected left boundary values to find the maximum.
  // The comparison `>` will perform a string comparison, replicating the original behavior.
  for (const boundaryItem of leftBoundaryValues) {
    if (boundaryItem > currentMaxLeftBoundary) {
      currentMaxLeftBoundary = boundaryItem;
    }
  }

  // Iterate through all collected right boundary values to find the minimum.
  // The comparison `<` will perform a string comparison, replicating the original behavior.
  for (const boundaryItem of rightBoundaryValues) {
    if (boundaryItem < currentMinRightBoundary) {
      currentMinRightBoundary = boundaryItem;
    }
  }

  // Calculate the potential length of the common range.
  // JavaScript's arithmetic operators (`-`, `+`) will implicitly convert
  // the string values of `currentMinRightBoundary` and `currentMaxLeftBoundary` to numbers.
  const potentialCommonLength = currentMinRightBoundary - currentMaxLeftBoundary + 1;

  // Output the result. If the calculated length is positive, print it.
  // Otherwise (if it's zero or negative), print 0, as there's no valid common range.
  if (potentialCommonLength > 0) {
    console.log(potentialCommonLength);
  } else {
    console.log(0);
  }
}

// Read input from stdin and pass it to the processing function.
processRangeData(require("fs").readFileSync("/dev/stdin", "utf8"));
