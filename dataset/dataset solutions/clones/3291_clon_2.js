'use strict';
process.stdin.resume(); // Continue processing standard input
process.stdin.setEncoding('utf8'); // Set character encoding for input streams

// Utility function to find the largest numeric value within a list
const obtainMaximum = (valueList) => {
  let currentIndex = valueList.length; // Initialize index from the end
  let highestPoint = Number.NEGATIVE_INFINITY; // Start with the lowest possible number

  // Iterate backwards through the collection
  while (currentIndex--) {
    if (valueList[currentIndex] > highestPoint) {
      highestPoint = valueList[currentIndex]; // Update if a larger value is found
    }
  }
  return highestPoint; // Return the identified maximum
};

// Utility function to find the smallest numeric value within a list
const obtainMinimum = (valueList) => {
  let traversalIndex = valueList.length; // Initialize index for backward iteration
  let lowestPoint = Number.POSITIVE_INFINITY; // Start with the highest possible number

  // Loop through items in reverse order
  while (traversalIndex--) {
    if (valueList[traversalIndex] < lowestPoint) {
      lowestPoint = valueList[traversalIndex]; // Update if a smaller value is encountered
    }
  }
  return lowestPoint; // Provide the smallest value
};

// Main execution function for processing input
const processInputData = (inputPayload) => {
  // Input lines are separated by newline characters
  inputPayload = inputPayload.split("\n");

  // Parse the first number from the initial line
  let numberOfItems = parseInt(inputPayload[0]);

  // Extract and convert the second line into an array of numbers
  let elevationMeasurements = inputPayload[1].split(" ").map(Number);

  // Initialize a cost array with a large default value
  let pathCosts = new Array(numberOfItems + 20).fill(Number.MAX_VALUE);

  // Set the initial cost for the starting point
  pathCosts[0] = 0;

  // Recursive function to compute minimum costs
  const calculatePath = (currentPosition) => {
    // Base case: if past the end of the items, stop
    if (currentPosition > numberOfItems) {
      return 0;
    }

    // Calculate cost to move to the next position (currentPosition + 1)
    pathCosts[currentPosition + 1] = Math.min(
      pathCosts[currentPosition] + Math.abs(elevationMeasurements[currentPosition] - elevationMeasurements[currentPosition + 1]),
      pathCosts[currentPosition + 1]
    );

    // Calculate cost to move two positions ahead (currentPosition + 2)
    pathCosts[currentPosition + 2] = Math.min(
      pathCosts[currentPosition] + Math.abs(elevationMeasurements[currentPosition] - elevationMeasurements[currentPosition + 2]),
      pathCosts[currentPosition + 2]
    );

    // Recursively call for subsequent positions
    calculatePath(currentPosition + 1);
    calculatePath(currentPosition + 2);
  };

  // Initiate the cost calculation from the beginning
  calculatePath(0);

  // Output the final computed cost for the last item
  console.log(pathCosts[numberOfItems - 1]);
};

// Do not modify anything beyond this line (handles standard input/output and calls the primary function)
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));