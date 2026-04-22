fileHandler = require('fs');

inputContent = fileHandler.readFileSync('/dev/stdin', 'utf8');

segmentList = inputContent.split(" ");

valueOne = parseInt(segmentList[0],10);
valueTwo = parseInt(segmentList[1],10);
valueThree = parseInt(segmentList[2],10);
thresholdVal = parseInt(segmentList[3],10);

computedSum = 0;

if (thresholdVal <= valueOne + valueTwo)
  computedSum = valueOne;
else
  computedSum = valueOne - (thresholdVal - valueOne - valueTwo);

console.log(computedSum);