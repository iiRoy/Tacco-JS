const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const dataLines = rawData.split('\n');
const firstLineData = dataLines[0];
const secondLineData = dataLines[1];

const [countN, countM] = firstLineData.split(' ').map(Number);

const inputNumbers = secondLineData.split(' ').map(Number);

const sortedNumbers = inputNumbers.sort((a, b) => a - b);

const diffsList = [];
const diffsCount = countM - 1;
for (let idx = 0; idx < diffsCount; idx++) {
  diffsList.push(sortedNumbers[idx + 1] - sortedNumbers[idx]);
}

const sortedDiffs = diffsList.sort((a, b) => a - b);

const sliceStartIndex = countM - countN;
const largestDiffsSubset = sortedDiffs.slice(sliceStartIndex);

let finalResult;

const calculateSum = (arr) => arr.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

if (largestDiffsSubset.length > 0) {
  const largestDiffsSum = calculateSum(largestDiffsSubset);

  const maxVal = Math.max(...inputNumbers);
  const minVal = Math.min(...inputNumbers);

  finalResult = maxVal - minVal - largestDiffsSum;
} else {
  finalResult = 0;
}

const displayResult = () => {
  if (countN >= countM) {
    console.log(0);
  } else {
    console.log(finalResult);
  }
};

displayResult();
