"use strict";

function InputReader(sourceStr, parseFunc) {
  this._sourceLines = sourceStr.split("\n");
  this._currentCol = 0;
  this._currentLine = 0;
  this._valueParser = parseFunc || Number;
}

InputReader.prototype.readNextNumber = function () {
  const currentLineContent = this._sourceLines[this._currentLine];
  if (!currentLineContent) {
    return;
  }

  const lineTokens = currentLineContent.trim().split(" ");
  const nextToken = lineTokens[this._currentCol];
  this._currentCol++;

  if (this._currentCol >= lineTokens.length) {
    this._currentCol = 0;
    this._currentLine++;
  }
  return this._valueParser(nextToken);
};

InputReader.prototype.readLineAsNumbers = function () {
  const currentLineContent = this._sourceLines[this._currentLine];
  if (!currentLineContent) {
    return;
  }
  this._currentCol = 0;
  this._currentLine++;
  return currentLineContent.split(" ").map(this._valueParser);
};

module.exports = InputReader;

function generateAllFactors(numberToFactor) {
  const factors = [];
  const sqrtOfNumber = Math.sqrt(numberToFactor);

  for (let k = 1; k <= sqrtOfNumber; k++) {
    if (numberToFactor % k === 0) {
      factors.push(k);
    }
  }

  const initialFactorCount = factors.length;
  if (initialFactorCount === 0) { // Handle case for numberToFactor = 0 or 1 if sqrt logic changes
      return factors;
  }
  const largestInitialFactor = factors[initialFactorCount - 1];

  for (let k = initialFactorCount - 1; k >= 0; k--) {
    const currentFactor = factors[k];
    const complementaryFactor = numberToFactor / currentFactor;

    if (complementaryFactor > largestInitialFactor) {
      factors.push(complementaryFactor);
    }
  }
  return factors;
}

function findMaxValidFactor(factorList, targetN, targetM) {
  let maxFoundFactor = 1;
  const threshold = targetM / targetN;

  for (let k = 0; k < factorList.length; k++) {
    const currentFactor = factorList[k];
    if (currentFactor <= threshold) {
      maxFoundFactor = currentFactor;
    } else {
      break;
    }
  }
  return maxFoundFactor;
}

function processInput(inputData) {
  const dataReader = new InputReader(inputData);

  const targetN = dataReader.readNextNumber();
  const targetM = dataReader.readNextNumber();

  const allFactors = generateAllFactors(targetM);

  const resultMaxFactor = findMaxValidFactor(allFactors, targetN, targetM);

  console.log(resultMaxFactor);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
