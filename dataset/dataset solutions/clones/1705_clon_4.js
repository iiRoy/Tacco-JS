const processInput = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let collectedData = [];
let maximumNodeIdentifier;

const combinationsRegister = {};

function calculateBinomialCoefficient(wholeSet, subSetSize) {
  if (subSetSize < 0 || subSetSize > wholeSet) return 0;
  if (subSetSize === 0 || subSetSize === wholeSet) return 1;
  if (subSetSize > wholeSet / 2) subSetSize = wholeSet - subSetSize;

  const lookupKey = `${wholeSet}-${subSetSize}`;
  if (combinationsRegister[lookupKey]) return combinationsRegister[lookupKey];

  let outcome = 1;
  for (let counter = 0; counter < subSetSize; counter++) {
    outcome = outcome * (wholeSet - counter) / (counter + 1);
  }
  combinationsRegister[lookupKey] = outcome;
  return outcome;
}

processInput.on('line', (incomingLine) => {
  collectedData.push(incomingLine);
});

processInput.on('close', () => {
  const [initialLine, ...subsequentLines] = collectedData;
  maximumNodeIdentifier = Number(initialLine);

  let cumulativeValue = calculateBinomialCoefficient(maximumNodeIdentifier + 2, 3);

  const deductedSum = subsequentLines.reduce((currentDeductionTotal, segmentData) => {
    if (!segmentData) {
      return currentDeductionTotal;
    }
    const numericTokens = segmentData.split(/ /);
    const quantityA = Number(numericTokens[0]);
    const quantityB = Number(numericTokens[1]);

    const lesserQuantity = Math.min(quantityA, quantityB);
    const greaterQuantity = Math.max(quantityA, quantityB);

    const deductionTerm = lesserQuantity * (maximumNodeIdentifier - greaterQuantity + 1);
    
    return currentDeductionTotal + deductionTerm;
  }, 0);

  console.log(cumulativeValue - deductedSum);
});