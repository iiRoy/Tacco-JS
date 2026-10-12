function padWithZeros(inputString, desiredLength) {
  // Initialize a string to hold the padding characters.
  let paddingChars = '';
  // Loop to build the string of zeros.
  for (let idx = 0; idx < desiredLength; idx++) {
    paddingChars = paddingChars + '0';
  }
  // Prepend zeros and then slice from the end to get the desired length.
  return (paddingChars + inputString).slice(-desiredLength);
}

function calculateFrequencyMap(inputNumbers) {
  // Get the size of the input array.
  const arraySize = inputNumbers.length;
  // Calculate the total number of combinations (2^N).
  const maxCombinations = Math.pow(2, arraySize);
  // Initialize an array to store frequency counts, up to a certain sum.
  const frequencyCounts = [];
  // Fill the frequency array with zeros initially.
  for (let loopVar = 0; loopVar < 2501; loopVar++) {
    frequencyCounts[loopVar] = 0;
  }

  // Iterate through all possible combinations.
  for (let combinationIndex = 0; combinationIndex < maxCombinations; combinationIndex++) {
    // Convert the combination index to a binary string and pad it.
    const binaryString = padWithZeros((combinationIndex.toString(2)), arraySize);
    let currentSum = 0; // Accumulator for the sum of selected numbers.

    // Iterate through each digit of the binary string.
    for (let digitIndex = 0; digitIndex < arraySize; digitIndex++) {
      // If the binary digit is '1', add the corresponding number from inputNumbers.
      if (binaryString[digitIndex] === '1') {
        currentSum += inputNumbers[digitIndex];
      }
    }
    // Increment the count for the calculated sum.
    frequencyCounts[currentSum]++;
  }
  // Return the array of sum frequencies.
  return frequencyCounts;
}

function processInputData(rawData) {
  let resultAccumulator = 0; // This variable will store the final count.
  // Split the raw input into individual lines.
  const inputLines = rawData.split('\n');

  // Process the first line: split by space.
  inputLines[0] = inputLines[0].split(' ');
  // Process the second line: split by space.
  inputLines[1] = inputLines[1].split(' ');

  // Parse N and A from the first line.
  const countN = parseInt(inputLines[0][0]);
  const targetValue = parseInt(inputLines[0][1]);
  // Get the array of numbers from the second line.
  const numberArray = inputLines[1];

  // Variables to hold filtered numbers.
  let positiveNumbers, negativeNumbers, zeroCount;

  // Adjust each number in the array by subtracting the target value.
  for (let arrayIndex = 0; arrayIndex < countN; arrayIndex++) {
    numberArray[arrayIndex] = parseInt(numberArray[arrayIndex]) - targetValue;
  }

  // Filter numbers into positive and negative groups.
  positiveNumbers = numberArray.filter(function(currentNum) { return currentNum > 0; });
  negativeNumbers = numberArray.filter(function(currentNum) { return currentNum < 0; });
  // Calculate the count of zeros.
  zeroCount = numberArray.length - positiveNumbers.length - negativeNumbers.length;

  // Calculate combinations involving zeros.
  const zeroCombinations = Math.pow(2, zeroCount);

  // Invert the sign of negative numbers for processing.
  for (let negIdx = 0; negIdx < negativeNumbers.length; negIdx++) {
    negativeNumbers[negIdx] = -negativeNumbers[negIdx];
  }

  // Calculate frequency maps for positive and (absolute) negative numbers.
  const posFreqMap = calculateFrequencyMap(positiveNumbers);
  const negFreqMap = calculateFrequencyMap(negativeNumbers);

  // Iterate through possible sums to find matching pairs.
  for (let sumIndex = 1; sumIndex < 2501; sumIndex++) {
    // Multiply frequencies and add to the accumulator.
    resultAccumulator += posFreqMap[sumIndex] * negFreqMap[sumIndex];
  }

  // Calculate the final result based on combinations and zero choices.
  console.log((resultAccumulator + 1) * (zeroCombinations + 1) - 1);
}

// Read input from standard input and pass it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
