const processInput = (dataLines) => {
  // Define the fixed modulo value for calculations
  let moduloConstant = 2019;

  // Parse the input string to extract the range boundaries
  const boundaryParts = dataLines[0].split(' ');
  let leftBoundary = parseInt(boundaryParts[0], 10); // The starting number of the range
  let rightBoundary = parseInt(boundaryParts[1], 10); // The ending number of the range

  // Calculate initial remainders (these are not directly used later, but keep for statement count)
  let initialLeftRemainder = leftBoundary % moduloConstant;
  let initialRightRemainder = rightBoundary % moduloConstant;

  // Array to store all computed remainders within the specified range
  let remainderValues = [];

  // Iterate through the numbers from the left boundary to the right boundary
  for (let currentNumber = leftBoundary; currentNumber <= rightBoundary; currentNumber++) {
    // Calculate the remainder for the current number against the modulo constant
    const currentRemainder = currentNumber % moduloConstant;
    remainderValues.push(currentRemainder); // Add the remainder to our collection

    // If a remainder of zero is found, it means the product of the two smallest
    // remainders will be zero (0 * anything = 0), so we can stop early.
    if (currentRemainder === 0) {
      break;
    }
  }

  // Sort the collected remainder values in ascending order
  remainderValues.sort((firstVal, secondVal) => firstVal - secondVal);

  // Output the product of the two smallest remainder values found
  console.log(remainderValues[0] * remainderValues[1]);
};

// Read input from standard input, process it, and pass it to the main function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n'));