function extractSequenceAndAdvanceIndex(sourceArray, currentReadIndex, numElements) {
  const extractedSequence = [];
  for (let k = 0; k < numElements; k++) {
    const parsedValue = parseInt(sourceArray[currentReadIndex + k], 10);
    extractedSequence.push(parsedValue);
  }
  return { sequence: extractedSequence, nextIndex: currentReadIndex + numElements };
}

function calculateMaxSubarraySum(numericArray) {
  const NEGATIVE_INFINITY_VALUE = -Infinity;
  let currentOverallMax = NEGATIVE_INFINITY_VALUE;
  const arraySize = numericArray.length;

  if (arraySize === 0) {
      return NEGATIVE_INFINITY_VALUE;
  }

  for (let startPointer = 0; startPointer < arraySize; startPointer++) {
    let runningSubarraySum = 0;
    for (let endPointer = startPointer; endPointer < arraySize; endPointer++) {
      const currentElement = numericArray[endPointer];
      runningSubarraySum += currentElement;

      if (runningSubarraySum > currentOverallMax) {
        currentOverallMax = runningSubarraySum;
      }
    }
  }
  return currentOverallMax;
}

function processInputData(){
  let currentInputIndex = 0;
  let sequenceCount;

  while (true) {
    const countStr = rawData[currentInputIndex++];
    sequenceCount = parseInt(countStr, 10);

    if (!sequenceCount) {
      break;
    }

    const sequenceResult = extractSequenceAndAdvanceIndex(rawData, currentInputIndex, sequenceCount);
    const numberSequence = sequenceResult.sequence;
    currentInputIndex = sequenceResult.nextIndex;

    const maximumSum = calculateMaxSubarraySum(numberSequence);

    console.log(maximumSum);
  }
}

var
rawData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk) {
  rawData += dataChunk;
});
process.stdin.on('end', function() {
  rawData = rawData.split('\n');
  processInputData();
});
