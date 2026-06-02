"use strict";

function InputProcessor(rawData, parser) {
  this._sourceLines = rawData.split("\n");
  this._currentColumnIndex = 0;
  this._currentLineIndex = 0;
  this._parseFunction = parser || Number;
}

InputProcessor.prototype.getNextValue = function() {
  let currentLineText = this._sourceLines[this._currentLineIndex];
  if (!currentLineText) {
    return;
  }
  let lineTokens = currentLineText.trim().split(" ");
  let tokenValue = lineTokens[this._currentColumnIndex];
  this._currentColumnIndex++;
  if (lineTokens.length === this._currentColumnIndex) {
    this._currentColumnIndex = 0;
    this._currentLineIndex++;
  }
  return this._parseFunction(tokenValue);
};

InputProcessor.prototype.getLineValues = function() {
  let activeLineText = this._sourceLines[this._currentLineIndex];
  if (!activeLineText) {
    return;
  }
  this._currentColumnIndex = 0;
  this._currentLineIndex++;
  return activeLineText.split(" ").map(this._parseFunction);
};


function processData(inputString) {
  const dataReader = new InputProcessor(inputString);

  const totalElements = dataReader.getNextValue();
  const targetValue = dataReader.getNextValue();
  
  const sortedNumbers = [];
  for (let idx = 0; idx < totalElements; idx++) {
    sortedNumbers.push(dataReader.getNextValue());
  }

  sortedNumbers.sort((valA, valB) => valA - valB);

  const factorialCache = [1, 1];
  for (let idx = 2; idx <= totalElements; idx++) {
    factorialCache[idx] = (factorialCache[idx - 1] * idx) % 1000000007;
  }

  if (sortedNumbers[0] === 1) {
    console.log(0);
  } else {
    console.log(computeResult(targetValue, totalElements));
  }

  function computeResult(currentRemainder, remainingCount) {
    if (currentRemainder < sortedNumbers[0]) {
      return currentRemainder * factorialCache[remainingCount];
    }

    let searchIndex = 0;
    while (sortedNumbers[searchIndex] < currentRemainder) {
      searchIndex++;
    }

    let accumulatedResult = 0;
    for (let loopCounter = 0; loopCounter < searchIndex; loopCounter++) {
      accumulatedResult += computeResult(currentRemainder % sortedNumbers[loopCounter], remainingCount - 1);
      accumulatedResult = accumulatedResult % 1000000007;
    }
    return accumulatedResult % 1000000007;
  }
}


processData(require("fs").readFileSync("/dev/stdin", "utf8"));
