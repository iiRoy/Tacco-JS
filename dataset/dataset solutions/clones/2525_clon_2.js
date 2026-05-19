'use strict';

const processInputData = (incomingLines) => {
  // Parse the first line for the total count of elements.
  const totalCount = parseInt(incomingLines[0], 10);

  // Parse the second line, splitting by space and converting each part to an integer.
  const numericValues = incomingLines[1].split(' ').map(strValue => parseInt(strValue, 10));

  // Iterate 'totalCount' times to find and "remove" the smallest element in each step.
  for (let iterationIndex = 0; iterationIndex < totalCount; iterationIndex++) {
    // Determine the index of the current minimum value within the array.
    let foundMinimumIndex = numericValues.indexOf(Math.min.apply(null, numericValues));

    // Output the 1-based index of the smallest element found.
    console.log(foundMinimumIndex + 1);

    // Replace the smallest element with a large number to prevent it from being selected again.
    numericValues[foundMinimumIndex] = 100000;
  }
};

// Read input from standard input, split by newlines, and pass to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
