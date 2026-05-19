"use strict";

function _getTokensFromLine(line) {
  return line.trim().split(" ");
}

function InputReader(sourceStr, parseFunc){
  this._sourceLines = sourceStr.split("\n");
  this._currentCol = 0;
  this._currentLine = 0;
  this._parseFn = parseFunc || Number;
}

InputReader.prototype.readNextToken = function(){
  let lineContent = this._sourceLines[this._currentLine];
  if (lineContent === undefined || lineContent === null) {
    return undefined;
  }

  let tokensOnCurrentLine = _getTokensFromLine(lineContent);
  let tokenToParse = tokensOnCurrentLine[this._currentCol];
  
  this._currentCol++;

  if (this._currentCol >= tokensOnCurrentLine.length) {
    this._currentCol = 0;
    this._currentLine++;
  }
  return this._parseFn(tokenToParse);
};

InputReader.prototype.readLineTokens = function(){
  let lineContent = this._sourceLines[this._currentLine];
  if (lineContent === undefined || lineContent === null) {
    return undefined;
  }
  this._currentCol = 0;
  this._currentLine++;
  return _getTokensFromLine(lineContent).map(this._parseFn);
};

const DEEP_COPY_VALUE = (val) => JSON.parse(JSON.stringify(val));

function initializeMultiDimArray(dimensions, initialVal){
  let currentDimensionValue = initialVal || 0;
  for(let i = dimensions.length - 1; i >= 0; i--){
    const currentDimSize = dimensions[i];
    currentDimensionValue = Array.from({ length: currentDimSize }, () => DEEP_COPY_VALUE(currentDimensionValue));
  }
  return currentDimensionValue;
}

function calculatePermutationFactor(startVal, endVal) {
  let cumulativeProduct = 1;
  let currentFactor = startVal + 1;
  while (currentFactor <= endVal) {
    cumulativeProduct *= currentFactor;
    currentFactor++;
  }
  return cumulativeProduct;
}

const MODULO_CONST = 1000000007;

function precomputeFactorials(limit, modulo) {
  const factorials = [1, 1];
  for (let i = 2; i <= limit; i++) {
    factorials[i] = (factorials[i - 1] * i) % modulo;
  }
  return factorials;
}

function processInputAndSolve(inputString) {
  const inputReaderInstance = new InputReader(inputString);

  const numElements = inputReaderInstance.readNextToken();
  const targetValue = inputReaderInstance.readNextToken();
  
  const elementValues = Array(numElements).fill(0).map(() => inputReaderInstance.readNextToken());

  elementValues.sort((a,b) => a - b);

  const factorialMod = precomputeFactorials(numElements, MODULO_CONST);

  const memoizationTable = initializeMultiDimArray([numElements + 1, targetValue + 1], -1);

  const applyModulo = (val) => (val % MODULO_CONST + MODULO_CONST) % MODULO_CONST;

  function computeResult(currentK, currentX) {
    if (memoizationTable[currentK][currentX] !== -1) {
      return memoizationTable[currentK][currentX];
    }

    let resultForCurrentState;
    const firstElementInSortedValues = elementValues[0];

    if (currentX < firstElementInSortedValues) {
      resultForCurrentState = applyModulo(currentX * factorialMod[currentK]);
    } else {
      let accumulatedSum = 0;
      let elementsConsideredCount = 0;
      
      for (; elementsConsideredCount < numElements; elementsConsideredCount++) {
        const currentS_val = elementValues[elementsConsideredCount];
        if (currentS_val > currentX) {
          break;
        }
        const recursiveCallResult = computeResult(currentK - 1, currentX % currentS_val);
        accumulatedSum = applyModulo(accumulatedSum + recursiveCallResult);
      }
      
      const permutationFactor = calculatePermutationFactor(elementsConsideredCount, currentK);
      resultForCurrentState = applyModulo(accumulatedSum * permutationFactor);
    }

    memoizationTable[currentK][currentX] = resultForCurrentState;
    return resultForCurrentState;
  }

  console.log(computeResult(numElements, targetValue));
}

processInputAndSolve(require("fs").readFileSync("/dev/stdin", "utf8"));
