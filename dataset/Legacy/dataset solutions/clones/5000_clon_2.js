function padWithZeros(inputString, desiredLength) {
  // Initialize a string to accumulate leading zeros
  let zeroAccumulator = '';
  // Loop to build the string of zeros
  for (let idx = 0; idx < desiredLength; idx++) {
    zeroAccumulator = zeroAccumulator + '0';
  }
  // Concatenate zeros and the input string, then take the last 'desiredLength' characters
  return (zeroAccumulator + inputString).slice(-desiredLength);
}

function processInputData(rawData) {
  // Split the raw input into an array of lines
  let inputLines = rawData.split('\n');

  // Process the first line: split by space
  inputLines[0] = inputLines[0].split(' ');
  // Process the second line: split by space
  inputLines[1] = inputLines[1].split(' ');

  // Parse N (number of elements) from the first line
  const subsetSize = parseInt(inputLines[0][0]);
  // Parse A (target average) from the first line
  const targetAverage = parseInt(inputLines[0][1]);
  // Store the array of numbers from the second line
  const numberArray = inputLines[1];

  // Calculate M = 2^N, representing the total number of possible subsets (including empty)
  const totalCombinations = Math.pow(2, subsetSize);
  // Initialize a counter for valid subsets
  let validSubsetCount = 0;

  // Iterate from 1 to M-1 to generate all non-empty subsets
  for (let combinationIndex = 1; combinationIndex < totalCombinations; combinationIndex++) {
    // Convert the combination index to its binary representation and pad with leading zeros to length N
    const binaryRepresentation = padWithZeros((combinationIndex.toString(2)), subsetSize);

    // Initialize sum for the current subset
    let currentSum = 0;
    // Count the number of '1's in the binary representation (which is the number of elements in the subset)
    const oneCount = binaryRepresentation.match(/1/g).length;

    // Iterate through the binary representation to calculate the sum of elements in the current subset
    for (let digitIndex = 0; digitIndex < subsetSize; digitIndex++) {
      // If the current binary digit is '1', add the corresponding number from numberArray to currentSum
      if (binaryRepresentation[digitIndex] === '1') {
        currentSum += parseInt(numberArray[digitIndex]);
      }
    }

    // Check if the average of the current subset equals the target average
    if (targetAverage === currentSum / oneCount) {
      // If it matches, print the binary representation of the subset
      console.log(binaryRepresentation);
      // Increment the counter for valid subsets
      validSubsetCount++;
    }
  }
  // After checking all combinations, print the total count of valid subsets
  console.log(validSubsetCount);
}

// Read input from standard input and pass it to the main processing function
processInputData(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
