"use strict";
const FILE_SYSTEM_MODULE = require("fs");
const INPUT_FILE_PATH = "/dev/stdin";
const rawInputData = FILE_SYSTEM_MODULE.readFileSync(INPUT_FILE_PATH, "utf8");
let tokenBuffer = rawInputData.split(/ |\n/);
let tokenIndex = 0;

function readInt() {
  const value = tokenBuffer[tokenIndex++];
  return parseInt(value, 10);
}

function readString() {
  return tokenBuffer[tokenIndex++];
}

function readBigInt() {
  const value = tokenBuffer[tokenIndex++];
  return BigInt(value);
}

function readInts(count, mapToNumber = true) {
  const sliceStart = tokenIndex;
  const sliceEnd = tokenIndex + count;
  const values = tokenBuffer.slice(sliceStart, sliceEnd);
  tokenIndex = sliceEnd;
  return mapToNumber ? values.map(Number) : values;
}

function readSortedInts(count, descendingOrder = false) {
  const numbers = readInts(count);
  return descendingOrder ? numbers.sort((valA, valB) => valB - valA) : numbers.sort((valA, valB) => valA - valB);
}

function readMatrix(height, width, mapToNumber = true) {
  const matrixData = [];
  for (let rowIdx = 0; rowIdx < height; rowIdx++) {
    matrixData.push(readInts(width, mapToNumber));
  }
  return matrixData;
}

function createMultiDimArray(initialValue) {
  const functionArguments = arguments;
  let argumentCount = functionArguments.length;
  let evalString = "Array(functionArguments[" + --argumentCount + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--argumentCount) {
    evalString = "Array(functionArguments[" + argumentCount + "]).fill().map(x=>" + evalString + ")";
  }
  return eval(evalString);
}

class DisjointSet {
  constructor(capacity) {
    const arraySize = capacity + 1;
    this.parentOrSize = Array(arraySize).fill(-1);
  }

  findRoot(elementIndex) {
    const currentParent = this.parentOrSize[elementIndex];
    if (currentParent < 0) {
      return elementIndex;
    }
    const rootNode = this.findRoot(currentParent);
    this.parentOrSize[elementIndex] = rootNode; // Path compression
    return rootNode;
  }

  areConnected(elementX, elementY) {
    return this.findRoot(elementX) === this.findRoot(elementY);
  }

  unionSets(elementX, elementY) {
    const parentArray = this.parentOrSize;
    let rootX = this.findRoot(elementX);
    let rootY = this.findRoot(elementY);

    if (rootX === rootY) {
      return false; // Already in the same set
    }

    // Union by size/rank heuristic
    if (parentArray[rootY] < parentArray[rootX]) {
      // rootY's set is larger (more negative size), attach rootX's set to rootY
      parentArray[rootY] += parentArray[rootX];
      parentArray[rootX] = rootY;
    } else {
      // rootX's set is larger or equal, attach rootY's set to rootX
      parentArray[rootX] += parentArray[rootY];
      parentArray[rootY] = rootX;
    }
    return true;
  }

  getSetSize(elementIndex) {
    const rootOfElement = this.findRoot(elementIndex);
    return -this.parentOrSize[rootOfElement];
  }
}

const programOutput = executeMainLogic();
if (programOutput !== undefined) {
  console.log(String(programOutput));
}

function executeMainLogic() {
  const numberOfElements = readInt();
  const numberOfOperations = readInt();
  const disjointSetInstance = new DisjointSet(numberOfElements);

  for (let operationIndex = 0; operationIndex < numberOfOperations; operationIndex++) {
    const connectionPair = readInts(2);
    const elementA = connectionPair[0];
    const elementB = connectionPair[1];
    disjointSetInstance.unionSets(elementA, elementB);
  }

  const parentArrayState = disjointSetInstance.parentOrSize;
  const minimumValueInArray = Math.min(...parentArrayState);
  return -minimumValueInArray;
}
