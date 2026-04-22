var storedLines = [];
var dataStreamHandler;

function setupInputProcessor(contentLines) {
  return {
    sourceData: contentLines,
    currentPosition: 0,
    totalEntries: contentLines.length,
    hasMoreEntries: function() {
      return (this.currentPosition < this.totalEntries);
    },
    fetchNextEntry: function() {
      if (this.hasMoreEntries()) {
        return this.sourceData[this.currentPosition++];
      } else {
        throw new Error('No further input entries are available.');
      }
    }
  };
}

function transformInputSegment(segment, conversionType) {
  if (conversionType === 4) {
    const parts = segment.split(' ');
    const numericParts = [];
    for (let i = 0; i < parts.length; i++) {
      let currentNum = 0;
      let isNegative = false;
      let charIndex = 0;
      if (parts[i].length > 0 && parts[i][0] === '-') {
        isNegative = true;
        charIndex = 1;
      }
      for (; charIndex < parts[i].length; charIndex++) {
        currentNum = currentNum * 10 + (parts[i].charCodeAt(charIndex) - 48);
      }
      numericParts.push(isNegative ? -currentNum : currentNum);
    }
    return numericParts;
  }
  // This function is only expected to be called with conversionType 4 based on original code usage.
  return segment;
}

function retrieveNumericSequence() {
  return transformInputSegment(dataStreamHandler.fetchNextEntry(), 4);
}

function publishOutput(message) {
  console.log(message);
}

function executeCalculationFlow() {
  const numericData = retrieveNumericSequence();

  const [
    firstPieceCount,
    secondPieceCount,
    thirdPieceCount,
    fourthPieceCount,
    fifthPieceCount,
    sixthPieceCount,
    seventhPieceCount
  ] = numericData;

  const calculateEvenPart = (val) => (val >> 1) << 1;
  const calculateAdjustedEvenPart = (val) => ((val - 1) >> 1) << 1;

  let optionOneSum = 0;
  optionOneSum += calculateEvenPart(firstPieceCount);
  optionOneSum += calculateEvenPart(fourthPieceCount);
  optionOneSum += calculateEvenPart(fifthPieceCount);

  let optionTwoSum = 0;
  optionTwoSum += calculateAdjustedEvenPart(firstPieceCount);
  optionTwoSum += calculateAdjustedEvenPart(fourthPieceCount);
  optionTwoSum += calculateAdjustedEvenPart(fifthPieceCount);
  optionTwoSum += 3;

  let primaryResult;
  if (optionOneSum > optionTwoSum) {
    primaryResult = optionOneSum;
  } else {
    primaryResult = optionTwoSum;
  }

  const finalResult = primaryResult + secondPieceCount;

  publishOutput(finalResult);
}

// The boilerplate's `read.on('close')` function would need to be modified to call:
// `dataStreamHandler = setupInputProcessor(storedLines);`
// and then `executeCalculationFlow();`
// And `read.on('line')` would need to be modified to:
// `read.on('line', function(input){storedLines.push(input);});`
executeCalculationFlow();