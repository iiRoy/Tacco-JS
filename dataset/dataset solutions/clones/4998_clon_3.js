function padWithZeros(numberString, desiredLength) {
  return numberString.padStart(desiredLength, '0');
}

function calculateDistribution(inputArray) {
  const arrayLength = inputArray.length;
  const totalCombinations = Math.pow(2, arrayLength);

  const distributionCounts = new Array(2501).fill(0);

  for (let combinationIndex = 0; combinationIndex < totalCombinations; combinationIndex++) {
    const binaryRepresentation = padWithZeros((combinationIndex.toString(2)), arrayLength);

    const currentSubsetSum = Array.from(binaryRepresentation).reduce((accumulator, char, idx) => {
      return accumulator + (char === '1' ? inputArray[idx] : 0);
    }, 0);

    distributionCounts[currentSubsetSum]++;
  }
  return distributionCounts;
}

function processInputData(input) {
  let sumOfProducts = 0;
  const inputLines = input.split('\n');

  const [arraySizeStr, targetValueStr] = inputLines[0].split(' ');
  const arraySize = parseInt(arraySizeStr);
  const targetValue = parseInt(targetValueStr);

  const initialNumbers = inputLines[1].split(' ');
  const processedNumbers = initialNumbers.map(numStr => parseInt(numStr) - targetValue);

  const positiveNumbers = processedNumbers.filter(currentNum => currentNum > 0);
  const negativeNumbers = processedNumbers.filter(currentNum => currentNum < 0);

  const zeroCount = processedNumbers.length - positiveNumbers.length - negativeNumbers.length;
  const zeroCombinations = Math.pow(2, zeroCount);

  const negatedNegativeNumbers = negativeNumbers.map(num => -num);

  const positiveDistribution = calculateDistribution(positiveNumbers);
  const negativeDistribution = calculateDistribution(negatedNegativeNumbers);

  for (let distIdx = 1; distIdx < 2501; distIdx++) {
    sumOfProducts += positiveDistribution[distIdx] * negativeDistribution[distIdx];
  }

  const adjustedSumOfProducts = sumOfProducts + 1;
  const adjustedZeroCombinations = zeroCombinations + 1;
  const finalResult = (adjustedSumOfProducts * adjustedZeroCombinations) - 1;

  console.log(finalResult);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
