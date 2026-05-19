"use strict";
const inputFilePath = "/dev/stdin";
const rawData = require("fs").readFileSync(inputFilePath, "utf8");
const tokenStream = rawData.split(/ |\n/);
let tokenIndex = 0;

function readInt() {
  return +tokenStream[tokenIndex++];
}

function readString() {
  return tokenStream[tokenIndex++];
}

function readBigInt() {
  return BigInt(tokenStream[tokenIndex++]);
}

function readInts(count) {
  const values = tokenStream.slice(tokenIndex, tokenIndex + count);
  tokenIndex += count;
  return values.map(Number);
}

function readSortedInts(count, descending = false) {
  const values = tokenStream.slice(tokenIndex, tokenIndex + count).map(Number);
  tokenIndex += count;
  const sortComparator = descending ? (a, b) => b - a : (a, b) => a - b;
  return values.sort(sortComparator);
}

function readMatrix(height, width, asStrings = false) {
  const matrixRows = [];
  for (let rowIdx = 0; rowIdx < height; rowIdx++) {
    const rowSlice = tokenStream.slice(tokenIndex, tokenIndex + width);
    tokenIndex += width;
    matrixRows.push(asStrings ? rowSlice : rowSlice.map(Number));
  }
  return matrixRows;
}

function createMultiDimArray(initialValue) {
  const args = arguments;
  let argLength = args.length;
  let arrayCreationString = "Array(args[" + --argLength + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--argLength) {
    arrayCreationString = "Array(args[" + argLength + "]).fill().map(x=>" + arrayCreationString + ")";
  }
  return eval(arrayCreationString);
}

class DisjointSet {
  constructor(size) {
    this.parentOrSize = new Array(size + 1).fill(-1);
  }

  findRoot(node) {
    if (this.parentOrSize[node] < 0) {
      return node;
    }
    const rootOfParent = this.findRoot(this.parentOrSize[node]);
    this.parentOrSize[node] = rootOfParent;
    return rootOfParent;
  }

  areConnected(nodeX, nodeY) {
    return this.findRoot(nodeX) === this.findRoot(nodeY);
  }

  unionSets(nodeX, nodeY) {
    let rootX = this.findRoot(nodeX);
    let rootY = this.findRoot(nodeY);

    if (rootX === rootY) {
      return false;
    }

    if (this.parentOrSize[rootY] < this.parentOrSize[rootX]) {
      this.parentOrSize[rootY] += this.parentOrSize[rootX];
      this.parentOrSize[rootX] = rootY;
    } else {
      this.parentOrSize[rootX] += this.parentOrSize[rootY];
      this.parentOrSize[rootY] = rootX;
    }
    return true;
  }

  getSetSize(node) {
    return -this.parentOrSize[this.findRoot(node)];
  }
}

function executeProgram() {
  const [nodeCount, queryCount] = readInts(2);
  const disjointSetInstance = new DisjointSet(nodeCount);
  const resultsBuffer = [];

  for (let queryIdx = 0; queryIdx < queryCount; queryIdx++) {
    const [queryType, nodeA, nodeB] = readInts(3);

    if (queryType === 1) {
      const areNodesConnected = disjointSetInstance.areConnected(nodeA, nodeB);
      resultsBuffer.push(areNodesConnected ? 1 : 0);
    } else {
      disjointSetInstance.unionSets(nodeA, nodeB);
    }
  }
  return resultsBuffer.join("\n");
}

const programOutput = executeProgram();
if (programOutput !== undefined) {
  console.log(String(programOutput));
}
