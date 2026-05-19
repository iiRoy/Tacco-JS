"use strict";
const InputReaderFactory = (function() {
  function createReader(sourceString) {
    return new InputReader(sourceString);
  }

  function InputReader(sourceString) {
    this._sourceLines = sourceString.trim().split("\n");
    this._currentLineIndex = 0;
  }

  InputReader.prototype.readNextValue = function(asString) {
    let currentLineSegment = this._sourceLines[this._currentLineIndex];
    let extractedValue;

    if (typeof currentLineSegment === "string") {
      currentLineSegment = currentLineSegment.split(" ").reverse();
      this._sourceLines[this._currentLineIndex] = currentLineSegment;
    }

    extractedValue = currentLineSegment.pop();

    if (!currentLineSegment.length) {
      this._currentLineIndex++;
    }

    return asString ? extractedValue : +extractedValue;
  };

  InputReader.prototype.readLineValues = function(asStrings) {
    const lineContent = this._sourceLines[this._currentLineIndex++];
    const values = lineContent.split(" ");
    return asStrings ? values : values.map(val => +val);
  };

  InputReader.prototype.readMatrix = function(numRows, asStrings) {
    const startIndex = this._currentLineIndex;
    const endIndex = this._currentLineIndex + numRows;
    this._currentLineIndex = endIndex;

    const rawRows = this._sourceLines.slice(startIndex, endIndex);
    const processedRows = rawRows.map(rowStr => rowStr.split(" "));

    return asStrings ? processedRows : processedRows.map(row => row.map(val => +val));
  };

  InputReader.prototype.readRawLines = function(numLines, asStrings) {
    const startIndex = this._currentLineIndex;
    const endIndex = this._currentLineIndex + numLines;
    this._currentLineIndex = endIndex;

    const lines = this._sourceLines.slice(startIndex, endIndex);
    return asStrings ? lines : lines.map(line => +line);
  };

  return createReader;
})();

function createMultiDimArray(initialValue, ...dimensions) {
  const recursiveArrayBuilder = (dims) => {
    if (dims.length === 0) {
      return initialValue;
    }
    const currentDimensionSize = dims[0];
    const remainingDimensions = dims.slice(1);
    return Array(currentDimensionSize).fill(null).map(() => recursiveArrayBuilder(remainingDimensions));
  };
  return recursiveArrayBuilder(dimensions);
}

const inputReader = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(solveProblem());

function solveProblem() {
  const numItems = inputReader.readNextValue();
  const capacityLimit = inputReader.readNextValue();
  const itemData = inputReader.readMatrix(numItems);

  const dpTableSize = capacityLimit + 3001;
  const dynamicProgrammingTable = createMultiDimArray(0, dpTableSize);

  const updateMaximumValue = (currentStoredValue, potentialNewValue) => {
    return Math.max(currentStoredValue, potentialNewValue);
  };

  for (let itemIndex = 0; itemIndex < numItems; itemIndex++) {
    const currentItem = itemData[itemIndex];
    const itemWeight = currentItem[0];
    const itemValue = currentItem[1];

    for (let currentCapacity = capacityLimit; currentCapacity >= 0; currentCapacity--) {
      const targetCapacityAfterAddingItem = currentCapacity + itemWeight;

      if (targetCapacityAfterAddingItem < dpTableSize) {
        const valueIfItemIsIncluded = dynamicProgrammingTable[currentCapacity] + itemValue;
        const existingValueAtTargetCapacity = dynamicProgrammingTable[targetCapacityAfterAddingItem];

        dynamicProgrammingTable[targetCapacityAfterAddingItem] = updateMaximumValue(
          existingValueAtTargetCapacity,
          valueIfItemIsIncluded
        );
      }
    }
  }

  return Math.max(...dynamicProgrammingTable);
}
