const analyzeGeometry = (inputLine) => {
  const [dimWidth, dimHeight, positionX, positionY] = inputLine.split(" ").map(val => parseInt(val, 10));

  const partitionA = dimHeight * Math.min(positionX, dimWidth - positionX);
  const partitionB = dimWidth * Math.min(positionY, dimHeight - positionY);

  const maxOfSmallerPartitions = Math.max(partitionA, partitionB);
  const areaOfHalfRectangle = (dimWidth * dimHeight) / 2;

  let outcomeArea;
  let indicatorValue;

  if (partitionA === 0 && partitionB === 0) {
    outcomeArea = areaOfHalfRectangle;
    indicatorValue = 0;
  } else {
    outcomeArea = maxOfSmallerPartitions;
    indicatorValue = ((partitionA === partitionB && partitionA !== 0) || (maxOfSmallerPartitions === areaOfHalfRectangle)) ? 1 : 0;
  }

  return `${outcomeArea} ${indicatorValue}`;
};

const executeCalculations = (dataRows) => {
  return analyzeGeometry(dataRows[0]);
};

console.log(executeCalculations(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n")));