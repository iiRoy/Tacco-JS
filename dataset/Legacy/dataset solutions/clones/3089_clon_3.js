"use strict";

class InputReader {
  constructor(sourceString, parseFn) {
    this._sourceLines = sourceString.split("\n");
    this._currentColumnIndex = 0;
    this._currentLineIndex = 0;
    this._parseFunction = parseFn || Number;
  }

  _getCurrentLineTokens() {
    const line = this._sourceLines[this._currentLineIndex];
    return line ? line.trim().split(" ") : null;
  }

  _isCurrentLineExhausted(tokens) {
    return tokens && tokens.length === this._currentColumnIndex;
  }

  readToken() {
    const currentTokens = this._getCurrentLineTokens();
    if (!currentTokens) {
      return undefined;
    }

    const tokenValue = currentTokens[this._currentColumnIndex];
    this._currentColumnIndex++;

    if (this._isCurrentLineExhausted(currentTokens)) {
      this._currentColumnIndex = 0;
      this._currentLineIndex++;
    }
    return this._parseFunction(tokenValue);
  }

  readLineTokens() {
    const line = this._sourceLines[this._currentLineIndex];
    if (!line) {
      return undefined;
    }

    this._currentColumnIndex = 0;
    this._currentLineIndex++;
    return line.split(" ").map(this._parseFunction);
  }
}

const MODULO_PRIME = 1000000007;

function precomputeFactorials(limit, modulo) {
  const factorials = [1, 1];
  for (let i = 2; i <= limit; i++) {
    factorials[i] = (factorials[i - 1] * i) % modulo;
  }
  return factorials;
}

function countZeroesInMask(maskString) {
  let zeroCount = 0;
  for (let i = 0; i < maskString.length; i++) {
    if (maskString[i] === "0") {
      zeroCount++;
    }
  }
  return zeroCount;
}

function computeCombinationsRecursive(currentRemainder, usedElementsMask, sortedValues, moduloFactorials, moduloValue) {
  if (currentRemainder < sortedValues[0]) {
    const remainingUnusedCount = countZeroesInMask(usedElementsMask);
    return (currentRemainder * moduloFactorials[remainingUnusedCount]) % moduloValue;
  }

  let firstLargerElementIndex = 0;
  while (firstLargerElementIndex < sortedValues.length && sortedValues[firstLargerElementIndex] < currentRemainder) {
    firstLargerElementIndex++;
  }

  let totalWays = 0;
  for (let i = 0; i < firstLargerElementIndex; i++) {
    if (usedElementsMask[i] === "0") {
      const nextMaskChars = Array.from(usedElementsMask);
      nextMaskChars[i] = "1";
      const nextUsedElementsMask = nextMaskChars.join("");

      const subResult = computeCombinationsRecursive(
        currentRemainder % sortedValues[i],
        nextUsedElementsMask,
        sortedValues,
        moduloFactorials,
        moduloValue
      );

      totalWays = (totalWays + subResult) % moduloValue;
    }
  }
  return totalWays;
}

function processChallenge(inputString) {
  const readerInstance = new InputReader(inputString);

  const elementCount = readerInstance.readToken();
  const targetSum = readerInstance.readToken();
  
  const sortedValues = [];
  for(let i = 0; i < elementCount; i++) {
    sortedValues.push(readerInstance.readToken());
  }

  sortedValues.sort((a, b) => a - b);

  const moduloFactorials = precomputeFactorials(elementCount, MODULO_PRIME);

  console.log(computeCombinationsRecursive(
    targetSum,
    "0".repeat(elementCount),
    sortedValues,
    moduloFactorials,
    MODULO_PRIME
  ));
}

processChallenge(require("fs").readFileSync("/dev/stdin", "utf8"));
