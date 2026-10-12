const rawInputData = require('fs')
  .readFileSync('/dev/stdin', 'utf8')
  .trim()
  .split(/\s+/);

const pairCount = Number(rawInputData[0]);
const numericValues = rawInputData.slice(1).map(Number);

const firstSet = [];
const secondSet = [];

numericValues.forEach((value, index) => {
  if (index % 2 === 0) {
    firstSet.push(value);
  } else {
    secondSet.push(value);
  }
});

const numericOrder = (val1, val2) => val1 - val2;
firstSet.sort(numericOrder);
secondSet.sort(numericOrder);

const medianResolver = {
  true: (dataArr, len) => {
    const lowerIndex = (len / 2) - 1;
    const upperIndex = len / 2;
    return dataArr[lowerIndex] + dataArr[upperIndex];
  },
  false: (dataArr, len) => {
    const centralIndex = Math.floor(len / 2);
    return dataArr[centralIndex];
  }
};

const isLengthEven = pairCount % 2 === 0;

const maximumMedian = medianResolver[isLengthEven](secondSet, pairCount);
const minimumMedian = medianResolver[isLengthEven](firstSet, pairCount);

console.log(maximumMedian - minimumMedian + 1);
