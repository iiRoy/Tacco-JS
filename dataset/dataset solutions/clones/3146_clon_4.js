function getParts(numeral, divider) {
  let currentNumeral = numeral;
  let quotientResult = 0;
  while (currentNumeral >= divider) {
    currentNumeral -= divider;
    quotientResult++;
  }
  return [quotientResult, currentNumeral];
}

function customXOR(valueA, valueB) {
  const scalingFactor = 10000000;
  const [quotientA, remainderA] = getParts(valueA, scalingFactor);
  const [quotientB, remainderB] = getParts(valueB, scalingFactor);
  return ((quotientA ^ quotientB) * scalingFactor) + (remainderA ^ remainderB);
}

const calculateUnified = (countVal, isCountEvenFlag) => {
  const adjustment = isCountEvenFlag ? 2 : 1;
  return (countVal <= adjustment) ? 0 : (((countVal - adjustment) / 2) % 2);
};

const operationDispatch = {
  // A even, count even
  '00': (a, b, c, u) => (c / 2) % 2,
  // A even, count odd
  '01': (a, b, c, u) => customXOR(b, u),
  // A odd, count even
  '10': (a, b, c, u) => customXOR(customXOR(a, b), u),
  // A odd, count odd
  '11': (a, b, c, u) => customXOR(a, u)
};

function processNumericalInputs(firstOperand, secondOperand) {
  const totalElements = secondOperand - firstOperand + 1;
  const isFirstEven = (firstOperand % 2 === 0);
  const isTotalEven = (totalElements % 2 === 0);

  const unifiedResult = calculateUnified(totalElements, isTotalEven);

  const dispatchKey = (isFirstEven ? '0' : '1') + (isTotalEven ? '0' : '1');
  const finalOutput = operationDispatch[dispatchKey](firstOperand, secondOperand, totalElements, unifiedResult);
  
  console.log(finalOutput);
}

function processFileContent(fileData) {
  const [firstLineContent] = fileData.split('\n');
  const [numOne, numTwo] = firstLineContent.split(' ').map(Number);
  processNumericalInputs(numOne, numTwo);
}

processFileContent(require('fs').readFileSync('/dev/stdin', 'utf8'));
