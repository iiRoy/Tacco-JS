function padWithZeros( inputString, desiredLength ){
  let paddingCharacters = ''; /* Initialize an empty string for padding */
  for (let idx = 0; idx < desiredLength; idx++) { /* Loop to append zeros */
    paddingCharacters += '0';
  }
  return (paddingCharacters + inputString).slice(-desiredLength); /* Prepend and slice to fit length */
}

function computeDistribution( inputArray ) {
  const arraySize = inputArray.length; // Get the number of elements in the array
  const totalCombinations = Math.pow(2, arraySize); // Calculate 2 to the power of arraySize
  let frequencyCounts = []; // Declare an array to store sum frequencies
  for (let loopIndexA = 0; loopIndexA < 2501; loopIndexA++) { // Initialize frequency counts to zero
    frequencyCounts[loopIndexA] = 0;
  }
  for (let combinationIndex = 0; combinationIndex < totalCombinations; combinationIndex++) { // Iterate through all possible subsets
    const binaryRepresentation = padWithZeros(combinationIndex.toString(2), arraySize); // Convert index to padded binary string
    let currentSum = 0; // Accumulator for the sum of the current subset
    for (let loopIndexB = 0; loopIndexB < arraySize; loopIndexB++) { // Iterate through binary digits
      currentSum += (binaryRepresentation[loopIndexB] === '1') ? inputArray[loopIndexB] : 0; // Add element if binary digit is '1'
    }
    frequencyCounts[currentSum]++; // Increment count for the calculated sum
  }
  return frequencyCounts; // Return the array of sum frequencies
}

function processInputData( rawData ){
  let totalResult = 0; // Final result accumulator
  const parsedLines = rawData.split('\n'); // Split input into lines
  parsedLines[0] = parsedLines[0].split(' '); // Split first line by spaces
  parsedLines[1] = parsedLines[1].split(' '); // Split second line by spaces

  const elementCount = parseInt(parsedLines[0][0]); // Parse N from the first line
  const targetValue = parseInt(parsedLines[0][1]); // Parse A from the first line
  const originalNumbers = parsedLines[1]; // Get the array of numbers from the second line

  let positiveNumbers, negativeNumbers, zeroCount; // Variables for categorizing numbers

  for (let transformIndex = 0; transformIndex < elementCount; transformIndex++) { // Adjust each number
    originalNumbers[transformIndex] = parseInt(originalNumbers[transformIndex]) - targetValue; // Subtract targetValue
  }
  
  positiveNumbers = originalNumbers.filter(function(numericValue){ return numericValue > 0; }); // Filter positive values
  negativeNumbers = originalNumbers.filter(function(numericValue){ return numericValue < 0; }); // Filter negative values
  zeroCount = originalNumbers.length - positiveNumbers.length - negativeNumbers.length; // Count zeros
  const zeroCombinations = Math.pow(2, zeroCount); // Calculate combinations involving zeros
  
  for (let negateIndex = 0; negateIndex < negativeNumbers.length; negateIndex++) { // Negate all negative numbers
    negativeNumbers[negateIndex] = -negativeNumbers[negateIndex];
  }
  
  const positiveDistribution = computeDistribution(positiveNumbers); // Compute distribution for positive values
  const negativeDistribution = computeDistribution(negativeNumbers); // Compute distribution for (negated) negative values
 
  for (let sumIndex = 1; sumIndex < 2501; sumIndex++) { // Calculate final sum based on distributions
      totalResult += positiveDistribution[sumIndex] * negativeDistribution[sumIndex];
  }
  console.log((totalResult + 1) * (zeroCombinations + 1) - 1); // Output the final calculated value
}

processInputData(require('fs').readFileSync('/dev/stdin', 'UTF-8')); // Read input from stdin and process