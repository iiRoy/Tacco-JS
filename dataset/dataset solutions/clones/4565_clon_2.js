const parseInteger = (inputString) => {
  /* Converts a string representation into a whole number value. */
  return Number.parseInt(inputString, 10);
};

const parseFloatNumber = (inputString) => {
  // Transforms a string into a floating-point number.
  return Number.parseFloat(inputString);
};

const isEvenlyDivisible = (numericValue) => {
  // Checks if a number is perfectly divisible by two.
  return (numericValue % 2) === 0;
};

const isUnevenlyDivisible = (numericValue) => {
  /* Determines if a numeric value leaves a remainder when divided by two. */
  return (numericValue % 2) === 1;
};

// --- Array Prototype Extensions for enhanced functionality ---
Array.prototype.sortNumericAscending = function() {
  // Sorts array elements numerically in ascending order.
  return this.sort((valA, valB) => (valA - valB));
};

Array.prototype.sortNumericDescending = function() {
  /* Sorts array elements numerically from largest to smallest. */
  return this.sort((valA, valB) => (valB - valA));
};

Array.prototype.sortStringAscending = function() {
  // Sorts array elements alphabetically in ascending order.
  return this.sort();
};

Array.prototype.sortStringDescending = function() {
  /* Sorts array elements alphabetically in descending order. */
  return this.sort().reverse();
};

Array.prototype.filterOutElement = function(itemToRemove) {
  // Creates a new array excluding all occurrences of a specified item.
  return this.filter(currentElement => currentElement !== itemToRemove);
};

// --- Main processing logic for the problem ---
function processInputData(inputLines) {

  // Parse the initial dimensions from the first line of input.
  const firstLineNumbers = inputLines[0].split(' ').map(parseInteger);

  const initialHeight = firstLineNumbers[0]; // Represents the first dimension.
  const initialWidth = firstLineNumbers[1]; // Represents the second dimension.

  // Initialize the minimum difference found so far to an extremely large value.
  let minimumDifference = Infinity;

  // Outer loop: Iterates through two possible orientations (Height x Width or Width x Height).
  for (let orientationIndex = 0; orientationIndex < 2; orientationIndex++) {

    // Inner loop: Iterates through two different ways to split the remaining area.
    for (let splitTypeIndex = 0; splitTypeIndex < 2; splitTypeIndex++) {

      // Determine the current dimensions based on the orientation.
      const dimensionsTuple = (orientationIndex === 0) ? [initialWidth, initialHeight] : [initialHeight, initialWidth];

      // Calculate the first split dimension (approximately one-third).
      const firstSplitDimension = Math.round(dimensionsTuple[0] / 3);
      // Calculate the remaining dimension after the first split.
      const secondSplitDimension = dimensionsTuple[0] - firstSplitDimension;

      // Calculate the area of the first piece.
      const areaOne = firstSplitDimension * dimensionsTuple[1];

      // Determine the dimensions for the subsequent split based on the split type.
      const subDimensionsTuple = (splitTypeIndex === 0) ? [secondSplitDimension, dimensionsTuple[1]] : [dimensionsTuple[1], secondSplitDimension];

      // Calculate the second split dimension (approximately half of the sub-dimension).
      const subSplitDimension = Math.round(subDimensionsTuple[0] / 2);
      // Calculate the remaining dimension after the second split.
      const subRemainingDimension = subDimensionsTuple[0] - subSplitDimension;

      // Calculate the areas of the second and third pieces.
      const areaTwo = subSplitDimension * subDimensionsTuple[1];
      const areaThree = subRemainingDimension * subDimensionsTuple[1];

      // Sort the three calculated areas in descending order.
      const sortedAreas = [areaOne, areaTwo, areaThree].sortNumericDescending();

      // Update the minimum difference if the current configuration yields a smaller one.
      minimumDifference = Math.min(minimumDifference, (sortedAreas[0] - sortedAreas[2]));
    }
  }

  // Output the smallest difference found between the largest and smallest area.
  console.log(minimumDifference);
}

// Read input from standard input, process it, and then execute the main logic.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split('\n').map(lineContent => lineContent.trim()));