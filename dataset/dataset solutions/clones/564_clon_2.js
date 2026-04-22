function determineMaxAggregate(inputValues, segmentLength) {
  const aggregateList = []; // Array to store computed sums
  for (let outerIndex = 0; outerIndex < inputValues.length - segmentLength; outerIndex++) {
    let windowCounter = segmentLength;
    let currentTotal = 0.0; // Initialize sum for current window
    if (outerIndex === 0) {
      while (windowCounter > 0) {
        currentTotal += inputValues[outerIndex + windowCounter];
        windowCounter--;
      }
    } else {
      // Optimized calculation for subsequent windows
      currentTotal = aggregateList[outerIndex - 1] - inputValues[outerIndex - 1] + inputValues[outerIndex + segmentLength];
    }
    aggregateList.push(currentTotal);
  }

  // Sort the list of sums in descending order
  aggregateList.sort(function(valA, valB) {
    return valB - valA;
  });

  console.log(aggregateList[0]); // Output the largest sum
}


const fileContent = require('node:fs').readFileSync('/dev/fd/0', 'utf-8');
const contentRows = (fileContent.trim()).split('\n');

let datasetBuffer;
let segmentSize;

for (let rowIndex = 0; rowIndex < contentRows.length; rowIndex++) {
  const currentLineValues = contentRows[rowIndex].split(' ').map(parseFloat);

  if (currentLineValues.length === 2 || rowIndex === contentRows.length - 1) {
    if (rowIndex !== 0) {
      determineMaxAggregate(datasetBuffer, segmentSize);
    }
    datasetBuffer = []; // Reset dataset for new input
    segmentSize = Number(currentLineValues[1]);
  } else {
    datasetBuffer.push(currentLineValues[0]);
  }

  if (contentRows[rowIndex] === '0 0') {
    break;
  }
}