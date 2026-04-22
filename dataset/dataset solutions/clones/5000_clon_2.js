function prefixDigits(valueString, requiredLength) {
  // This utility function prepends '0' characters to a string
  // until it reaches the specified 'requiredLength', then truncates it
  // from the right if it exceeds the length.
  let paddingCharacters = ''; // Initialize an empty string to hold leading zeros

  // Loop to build the string of zeros
  for (let idx = 0; idx < requiredLength; idx++) {
    paddingCharacters = paddingCharacters + '0'; // Append a zero in each iteration
  }

  // Concatenate the generated zeros with the original string
  // and then slice from the end to ensure the final string has
  // exactly 'requiredLength' characters.
  return (paddingCharacters + valueString).slice(-requiredLength);
}

function analyzeBinaryCombinations(sourceData) {
  // Main function to process input data and find combinations
  // that satisfy a specific average condition.

  // Split the entire input block by newline characters to get individual lines.
  const inputLines = sourceData.split('\n');

  // Process the first line: split by space to get two numeric values.
  inputLines[0] = inputLines[0].split(' ');

  // Process the second line: split by space to get an array of numeric strings.
  inputLines[1] = inputLines[1].split(' ');

  // Parse the first value from the first line as the total number of elements.
  const numElements = parseInt(inputLines[0][0], 10);

  // Parse the second value from the first line as the target average.
  const targetMean = parseInt(inputLines[0][1], 10);

  // Store the array of element values from the second input line.
  const elementValues = inputLines[1];

  // Calculate the total number of possible combinations (2^numElements).
  // This represents all possible subsets of the elements.
  const maxCombinations = Math.pow(2, numElements);

  // Initialize a counter for subsets that meet the average criteria.
  let matchingCount = 0;

  // Iterate through all possible combinations from 1 to maxCombinations - 1.
  // Each integer 'combinationId' represents a unique subset when converted to binary.
  for (let combinationId = 1; combinationId < maxCombinations; combinationId++) {
    // Convert the current 'combinationId' to its binary string representation.
    // Ensure it's padded with leading zeros to match 'numElements' length.
    const currentBinaryString = prefixDigits((combinationId.toString(2)), numElements);

    // Initialize the sum for the current subset.
    let currentSubsetSum = 0;

    // Count the number of '1's in the binary string, which represents
    // the number of elements included in the current subset.
    const setBitQuantity = currentBinaryString.match(/1/g).length;

    // Iterate through each bit of the binary string.
    for (let positionIndex = 0; positionIndex < numElements; positionIndex++) {
      // If the bit at 'positionIndex' is '1', include the corresponding
      // element value in the 'currentSubsetSum'.
      if (currentBinaryString[positionIndex] === '1') {
        currentSubsetSum += parseInt(elementValues[positionIndex], 10);
      }
    }

    // Check if the average of the current subset's elements equals the 'targetMean'.
    // The average is calculated as 'currentSubsetSum / setBitQuantity'.
    if (targetMean === currentSubsetSum / setBitQuantity) {
      // If the condition is met, log the binary string representation of the subset.
      console.log(currentBinaryString);
      // Increment the counter for matching subsets.
      matchingCount++;
    }
  }

  // After checking all combinations, print the total count of matching subsets.
  console.log(matchingCount);
}

// Call the main processing function with data read from standard input.
analyzeBinaryCombinations(require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' }));