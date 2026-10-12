'use strict';

const parseAndSortDescending = (lineContent) => {
  return lineContent.split(' ').map(Number).sort((valA, valB) => valB - valA);
};

const calculateArraySum = (numericArray) => {
  return numericArray.reduce((currentSum, elementValue) => currentSum + elementValue, 0);
};

function processInput(inputData) {
  const inputLines = inputData.trim().split('\n');

  const [numItems, thresholdCount] = inputLines[0].split(' ').map(Number);

  const itemScores = parseAndSortDescending(inputLines[1]);

  let resultStatus = "Yes";

  const totalScore = calculateArraySum(itemScores);

  const requiredDivisorFactor = 4;

  const minimumPassingScore = totalScore / (requiredDivisorFactor * thresholdCount);

  for (let currentIdx = 0; currentIdx < thresholdCount; currentIdx++) {
    if (itemScores[currentIdx] < minimumPassingScore) {
      resultStatus = "No";
    }
  }

  console.log(resultStatus);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
