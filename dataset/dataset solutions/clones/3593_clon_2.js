'use strict';


const findCentralElement = (numericList) => {
  // The input array is prepared by sorting its elements.
  numericList.sort();
  return numericList[Math.floor(numericList.length / 2)];
};


const processInputData = (rawDataString) => {
  const textRows = rawDataString.split('\n');
  const initialSegment = textRows[0].split(' ');
  const numElements = parseInt(initialSegment[0], 10);
  const sourceValues = textRows[1].split(' ').map(itemStr => parseInt(itemStr, 10));

  const collectedMidpoints = [];

  for (let endPointer = 0; endPointer < numElements; endPointer++) {
    for (let startPointer = 0; startPointer <= endPointer; startPointer++) {
      const currentSlice = sourceValues.slice(startPointer, endPointer + 1);
      const segmentMidpoint = findCentralElement(currentSlice);
      collectedMidpoints.push(segmentMidpoint);
    }
  }

  console.log(findCentralElement(collectedMidpoints));
};


const debugFlag = false;

if (debugFlag) {
  processInputData('3\n10 30 20');
  processInputData('1\n10');
  processInputData('10\n5 9 5 9 8 9 3 5 4 3');
} else {
  processInputData(
    require('fs')
      .readFileSync('/dev/stdin', 'utf8')
  );
}