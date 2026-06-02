function processInputPairs(inputDataArray) {
  const PAIR_STEP = 2;
  let pairIndex = 0;

  const outputSortedPair = (valA, valB) => {
    const smaller = Math.min(valA, valB);
    const larger = Math.max(valA, valB);
    console.log(`${smaller} ${larger}`);
  };

  while (pairIndex < inputDataArray.length - 1) {
    const currentVal1 = inputDataArray[pairIndex];
    const currentVal2 = inputDataArray[pairIndex + 1];

    if (currentVal1 === 0 && currentVal2 === 0) {
      break;
    }

    outputSortedPair(currentVal1, currentVal2);
    pairIndex += PAIR_STEP;
  }
}

const collectedNumbers = [];
const DECIMAL_RADIX = 10;

const lineReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const parseInputLine = (lineContent) => {
  const splitValues = lineContent.split(' ');
  const firstNum = parseInt(splitValues[0], DECIMAL_RADIX);
  const secondNum = parseInt(splitValues[1], DECIMAL_RADIX);
  return { first: firstNum, second: secondNum };
};

lineReader.on('line', (currentLineText) => {
  const { first: firstValue, second: secondValue } = parseInputLine(currentLineText);

  collectedNumbers.push(firstValue);
  collectedNumbers.push(secondValue);

  if (firstValue === 0 && secondValue === 0) {
    processInputPairs(collectedNumbers);
  }
});
