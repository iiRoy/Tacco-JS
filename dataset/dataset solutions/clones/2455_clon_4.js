"use strict";

class SourceReader {
  #initialLines;
  #linePointer = 0;
  #currentLineParts = [];

  constructor(rawData) {
    this.#initialLines = rawData.trim().split("\n");
  }

  #advanceLine() {
    this.#linePointer++;
    this.#currentLineParts = [];
  }

  extractNextNumericDatum() {
    if (this.#currentLineParts.length === 0) {
      if (this.#linePointer >= this.#initialLines.length) {
        throw new Error("Input consumption error: no more lines to process.");
      }
      this.#currentLineParts = this.#initialLines[this.#linePointer].split(" ").reverse();
    }

    const extractedValue = this.#currentLineParts.pop();
    if (this.#currentLineParts.length === 0) {
      this.#advanceLine();
    }
    return Number(extractedValue);
  }

  retrieveNumericLine() {
    if (this.#linePointer >= this.#initialLines.length) {
      throw new Error("Input consumption error: no more lines to process.");
    }
    const lineData = this.#initialLines[this.#linePointer].split(" ").map(Number);
    this.#advanceLine();
    return lineData;
  }
}

const buildNestingArray = (defaultValue, ...dimensions) => {
  const constructLayer = (remainingDimensions) => {
    if (remainingDimensions.length === 0) {
      return defaultValue;
    }
    const currentSize = remainingDimensions[0];
    const nextDimensions = remainingDimensions.slice(1);
    return Array.from({ length: currentSize }, () => constructLayer(nextDimensions));
  };
  return constructLayer(dimensions);
};

const ULTIMATE_BOUNDARY = Number.MAX_SAFE_INTEGER;

const processScenario = () => {
  const inputSource = new SourceReader(require("fs").readFileSync("/dev/stdin", "utf8"));

  const totalItems = inputSource.extractNextNumericDatum();
  const constraintValue = inputSource.extractNextNumericDatum();
  const elevationProfile = [0, ...inputSource.retrieveNumericLine()];

  let currentOptimalMatrix = buildNestingArray(ULTIMATE_BOUNDARY, 2, 2);
  currentOptimalMatrix[0][0] = elevationProfile[1];
  currentOptimalMatrix[1][1] = 0;

  for (let currentItemIndex = 1; currentItemIndex < totalItems; ++currentItemIndex) {
    const relevantDimension = Math.min(currentItemIndex, constraintValue) + 1;
    let nextOptimalMatrix = buildNestingArray(ULTIMATE_BOUNDARY, relevantDimension + 1, relevantDimension + 1);

    for (let primaryIndex = 0; primaryIndex < relevantDimension; ++primaryIndex) {
      for (let secondaryIndex = primaryIndex; secondaryIndex < relevantDimension; ++secondaryIndex) {
        const heightCalcTerm = Math.max(0, elevationProfile[currentItemIndex + 1] - elevationProfile[currentItemIndex - primaryIndex]);
        nextOptimalMatrix[secondaryIndex][0] = Math.min(
          nextOptimalMatrix[secondaryIndex][0],
          currentOptimalMatrix[secondaryIndex][primaryIndex] + heightCalcTerm
        );
      }

      if (primaryIndex < constraintValue) {
        for (let secondaryIndex = primaryIndex; secondaryIndex < relevantDimension; ++secondaryIndex) {
          nextOptimalMatrix[secondaryIndex + 1][primaryIndex + 1] = Math.min(
            nextOptimalMatrix[secondaryIndex + 1][primaryIndex + 1],
            currentOptimalMatrix[secondaryIndex][primaryIndex]
          );
        }
      }
    }
    currentOptimalMatrix = nextOptimalMatrix;
  }

  let finalMinimum = ULTIMATE_BOUNDARY;
  for (let resultIndex = 0; resultIndex <= constraintValue; ++resultIndex) {
    finalMinimum = Math.min(finalMinimum, currentOptimalMatrix[constraintValue][resultIndex]);
  }

  return finalMinimum;
};

console.log(processScenario());