const parseNumericString = (strValue) => Number(strValue);

const parseSpaceSeparatedNumbers = (lineContent) => lineContent.split(/\s/).map(parseNumericString);

const fileData = require('fs').readFileSync('/dev/stdin', 'utf8');
const allInputLines = fileData.split(/\n/);

const firstLineContent = allInputLines[0];
const remainingEdgeLines = allInputLines.slice(1);

const totalNodes = parseNumericString(firstLineContent);

const initialFactorOne = totalNodes;
const initialFactorTwo = totalNodes + 1;
const initialFactorThree = totalNodes + 2;
const productOfInitialFactors = initialFactorOne * initialFactorTwo * initialFactorThree;
let cumulativeSum = productOfInitialFactors / 6;

for (const currentEdgeLine of remainingEdgeLines) {
  let [nodeIdentifierA, nodeIdentifierB] = parseSpaceSeparatedNumbers(currentEdgeLine);

  if (nodeIdentifierA > nodeIdentifierB) {
    const tempSwapHolder = nodeIdentifierA;
    nodeIdentifierA = nodeIdentifierB;
    nodeIdentifierB = tempSwapHolder;
  }

  const rightSideMultiplier = totalNodes - nodeIdentifierB + 1;
  const currentDeductionAmount = nodeIdentifierA * rightSideMultiplier;
  cumulativeSum -= currentDeductionAmount;
}

console.log(cumulativeSum);
