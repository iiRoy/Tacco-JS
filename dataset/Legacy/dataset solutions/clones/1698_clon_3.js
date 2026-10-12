const findLargestElementIndex = (dataArray) => {
  let currentMaximum = -1n;
  let maximumIndex = -1;

  for (const [loopCounter, elementValue] of dataArray.entries()) {
    if (elementValue > currentMaximum) {
      currentMaximum = elementValue;
      maximumIndex = loopCounter;
    }
  }
  return maximumIndex;
};

const processInputData = (rawDataString) => {
  const trimmedInput = rawDataString.trim();
  const inputLines = trimmedInput.split('\n');

  const numberStrings = inputLines[1].split(' ');

  const numericValues = numberStrings.map(valueString => BigInt(valueString));
  numericValues.sort((a, b) => b - a);

  let resultArray = [];
  const initialElement = numericValues.shift();
  resultArray.push(initialElement);

  let totalSum = 0n;

  while (numericValues.length > 0) {
    const currentNumber = numericValues.shift();

    const insertionIndex = findLargestElementIndex(resultArray);
    const valueToAdd = resultArray[insertionIndex];
    totalSum += valueToAdd;

    resultArray.splice(insertionIndex, 0, currentNumber, currentNumber);
  }

  console.log(String(totalSum));
};

process.env.MYTEST ? test() : processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
