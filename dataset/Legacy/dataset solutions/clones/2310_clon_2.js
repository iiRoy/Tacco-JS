'use strict';

// This function processes the provided raw data to calculate a specific value.
const processInput = (rawData) => {
  // Parse the first line of input, splitting by space and converting to integers.
  const parsedNumbers = rawData[0].split(' ').map(currentValue => parseInt(currentValue, 10));

  // Destructure the parsed numbers into meaningful variables.
  let totalCount = parsedNumbers[0];
  let firstIndex = parsedNumbers[1];
  let secondIndex = parsedNumbers[2];

  // Calculate the absolute difference between the two indices.
  let difference = secondIndex - firstIndex;

  // Determine distances from boundaries.
  let leftDistance = secondIndex - 1;
  let rightDistance = totalCount - firstIndex;

  // Check if the difference is odd or even.
  if (difference % 2 !== 0) { // If the difference is odd
    // Output the minimum of the two boundary distances.
    console.log(leftDistance > rightDistance ? rightDistance : leftDistance);
  } else { // If the difference is even
    // Output half of the difference.
    console.log(difference / 2);
  }
};

// Read input from standard input, decode as UTF-8, and split by newlines.
processInput(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
