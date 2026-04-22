const platformIdentifier = typeof require !== 'undefined';

function obtainRawData() {
  if (!platformIdentifier) {
    return document.getElementById('input').value;
  }
  return require('fs').readFileSync('/dev/stdin').toString();
}

function outputDiagnostic(infoPayload) {
  if (!platformIdentifier) {
    console.error(infoPayload);
  }
}

function locateAppropriateIndex(dataArray, targetElement, lowerBound = 0, upperBound = dataArray.length) {
  if (lowerBound === upperBound) {
    return lowerBound;
  }

  const middleIndex = Math.floor(lowerBound + (upperBound - lowerBound) / 2);

  if (dataArray[middleIndex] < targetElement) {
    return locateAppropriateIndex(dataArray, targetElement, middleIndex + 1, upperBound);
  } else {
    return locateAppropriateIndex(dataArray, targetElement, lowerBound, middleIndex);
  }
}

function calculateOptimalSubsequenceLength(numericSeries) {
  if (numericSeries.length === 0) {
    return 0;
  }

  const resultingTails = numericSeries.slice(1).reduce((currentTails, currentNumber) => {
    const potentialInsertionPoint = locateAppropriateIndex(currentTails, currentNumber);

    if (potentialInsertionPoint === currentTails.length) {
      currentTails.push(currentNumber);
    } else {
      currentTails[potentialInsertionPoint] = currentNumber;
    }
    outputDiagnostic(currentTails);
    return currentTails;
  }, [numericSeries[0]]);

  return resultingTails.length;
}

function initiateProcessing() {
  const acquiredData = obtainRawData();
  const dataLines = acquiredData.split('\n');

  const sequenceQuantity = Number.parseInt(dataLines[0], 10);
  const numberCollection = dataLines.slice(1, sequenceQuantity + 1).map(individualLine => Number.parseInt(individualLine, 10));

  console.log(calculateOptimalSubsequenceLength(numberCollection));
}

if (platformIdentifier) {
  initiateProcessing();
}