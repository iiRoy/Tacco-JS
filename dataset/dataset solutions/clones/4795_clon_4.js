"use strict";
const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");
let dataSegments = sourceData.split(/ |\n/);
let segmentPointer = 0;

function fetchScalar(asString) {
  return asString ? dataSegments[segmentPointer++] : Number(dataSegments[segmentPointer++]);
}

function fetchVector(count, asString) {
  const extracted = dataSegments.slice(segmentPointer, segmentPointer + count);
  segmentPointer += count;
  return asString ? extracted : extracted.map(Number);
}

function fetchGrid(rows, columns, asString) {
  const grid = [];
  for (let r = 0; r < rows; r++) {
    const rowData = dataSegments.slice(segmentPointer, segmentPointer + columns);
    segmentPointer += columns;
    grid.push(asString ? rowData : rowData.map(Number));
  }
  return grid;
}

function createNestedArray(initialFill, ...dimensions) {
  const recurseBuild = (dims, currentDepth) => {
    if (currentDepth === dims.length - 1) {
      return Array(dims[currentDepth]).fill(initialFill);
    } else {
      return Array(dims[currentDepth]).fill().map(() => recurseBuild(dims, currentDepth + 1));
    }
  };
  return recurseBuild(dimensions, 0);
}

const calculationResult = performComputation();
if (calculationResult !== undefined) console.log(calculationResult);

function performComputation() {
  const numericInputs = fetchVector(7);

  const val0 = numericInputs[0];
  const val1 = numericInputs[1];
  const val3 = numericInputs[3];
  const val4 = numericInputs[4];

  const paritySum = (val0 % 2) + (val3 % 2) + (val4 % 2);

  let finalValue = val1 + val0 + val3 + val4 - paritySum;

  finalValue += (paritySum === 3) ? 3 : 0;
  finalValue += (paritySum === 2 && val0 !== 0 && val3 !== 0 && val4 !== 0) ? 1 : 0;

  return finalValue;
}
