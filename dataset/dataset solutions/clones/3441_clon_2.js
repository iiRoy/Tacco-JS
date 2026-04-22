const parseNumber = (inputString) => {
  /* This utility function takes a string and converts it to a base-10 integer. */
  return parseInt(inputString, 10);
};


const convertStringsToNumbers = (stringArray) => {
  // We use the map method to apply the parseNumber function to each element.
  return stringArray.map((singleString) => parseNumber(singleString));
};


const getAbsoluteValue = (numericValue) => {
  // Ternary operator checks if the value is positive, otherwise negates it.
  return numericValue > 0 ? numericValue : -numericValue;
};


function findMinimum() {
  // Collect all passed arguments into an array-like structure
  const allArguments = arguments;
  // Initialize the minimum with the first argument
  let currentMinimum = allArguments[0];
  // Iterate through the rest of the arguments to find a smaller value
  for (let argumentIndex = 1; argumentIndex < allArguments.length; argumentIndex++) {
    if (allArguments[argumentIndex] < currentMinimum) {
      currentMinimum = allArguments[argumentIndex]; // Update if a new minimum is found
    }
  }
  return currentMinimum; // Return the smallest value
}


function findMaximum() {
  // Capture all function arguments into a collection
  const allArguments = arguments;
  // Begin with the first argument as the assumed maximum
  let currentMaximum = allArguments[0];
  // Loop through the remaining arguments starting from the second one
  for (let argumentIndex = 1; argumentIndex < allArguments.length; argumentIndex++) {
    if (allArguments[argumentIndex] > currentMaximum) {
      currentMaximum = allArguments[argumentIndex]; // Update if a larger value is discovered
    }
  }
  return currentMaximum; // Provide the largest value found
}


// Kickstart the primary processing routine by reading from standard input
executeMainLogic(require("fs").readFileSync("/dev/stdin", "utf8"));


// Main function to orchestrate the data processing
function executeMainLogic(inputContent) {

  // Split the entire input content by newline characters to get an array of lines
  const inputLines = inputContent.split('\n');

  // Parse the first line to get two integer values (n and k)
  const limitsPair = convertStringsToNumbers(inputLines[0].split(' '));
  const totalElements = limitsPair[0]; // Represents 'n' from the problem description
  const targetThreshold = limitsPair[1]; // Represents 'k' from the problem description

  // Parse the second line to get an array of numbers
  let originalNumbers = convertStringsToNumbers(inputLines[1].split(' '));

  // Calculate prefix sums for the original numbers array
  const cumulativeSums = [originalNumbers[0]];
  for (let i = 1; i < totalElements; i++) {
    cumulativeSums[i] = cumulativeSums[i - 1] + originalNumbers[i];
  }
  // Initialize a 'dummy' prefix sum at index -1 for easier calculation of sub-array sums
  cumulativeSums[-1] = 0;

  // Generate all possible sub-array sums
  const segmentSums = [];
  for (let outerIndex = 0; outerIndex < totalElements; outerIndex++) {
    for (let innerIndex = outerIndex; innerIndex < totalElements; innerIndex++) {
      // The sum of a sub-array from outerIndex to innerIndex is cumulativeSums[innerIndex] - cumulativeSums[outerIndex - 1]
      segmentSums.push(cumulativeSums[innerIndex] - cumulativeSums[outerIndex - 1]);
    }
  }

  // Reassign the originalNumbers variable to hold the newly computed segment sums
  originalNumbers = segmentSums;

  // Prepare arrays to store indices based on bit components
  const bitComponentIndices = [];
  const bitMasks = [];
  const numberOfSegments = originalNumbers.length; // Store the length for efficiency

  // Iterate through bit positions (0 to 29, representing up to 2^29)
  for (let bitPosition = 0; bitPosition < 30; bitPosition++) {
    bitComponentIndices[bitPosition] = []; // Initialize an empty array for current bit position
    bitMasks[bitPosition] = 1 << bitPosition; // Calculate the bit mask (e.g., 1, 2, 4, 8...)

    // Check each segment sum for the presence of the current bit
    for (let segmentIndex = 0; segmentIndex < numberOfSegments; segmentIndex++) {
      if ((bitMasks[bitPosition] & originalNumbers[segmentIndex])) {
        bitComponentIndices[bitPosition].push(segmentIndex); // Store the index if the bit is set
      }
    }
  }

  /*
  console.log('Cumulative Sums:', cumulativeSums); // Debugging line for cumulative sums
  console.log('Segment Sums:', originalNumbers); // Debugging line for segment sums
  console.log('Bit Component Indices:', bitComponentIndices); // Debugging line for bit component indices
  */

  // Variable to store the final computed maximum XOR sum
  let computedAnswer = 0;

  // Iterate from the most significant bit downwards (29 to 0)
  for (let currentBit = 29; currentBit > -1; currentBit--) {
    // If the number of elements having this bit set is greater than or equal to k
    if (bitComponentIndices[currentBit].length >= targetThreshold) {
      // console.log(`Considering bit: ${currentBit}`); // Debugging line for current bit
      computedAnswer += bitMasks[currentBit]; // Add the value of this bit to the result

      // Filter the indices for all lower bits, keeping only those that were also present in the current bit's group
      for (let lowerBit = currentBit - 1; lowerBit > -1; lowerBit--) {
        bitComponentIndices[lowerBit] = bitComponentIndices[lowerBit].filter((elementIndex) =>
          bitComponentIndices[currentBit].includes(elementIndex)
        );
      }
    }
  }
  // Output the final calculated answer to the console
  console.log(computedAnswer);
}