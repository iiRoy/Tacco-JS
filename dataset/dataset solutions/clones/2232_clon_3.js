"use strict";

class InputReader {
  constructor(sourceString) {
    this._sourceLines = sourceString.trim().split("\n");
    this._currentLineIndex = 0;
  }

  static fromString(sourceString) {
    return new InputReader(sourceString);
  }

  _parseValue(valueString, asString) {
    return asString ? valueString : parseInt(valueString, 10);
  }

  readNumber(asString = false) {
    const currentLineContent = this._sourceLines[this._currentLineIndex];
    if (typeof currentLineContent === "string") {
      this._sourceLines[this._currentLineIndex] = currentLineContent.split(" ").reverse();
    }
    const extractedValue = this._sourceLines[this._currentLineIndex].pop();
    if (!this._sourceLines[this._currentLineIndex].length) {
      this._currentLineIndex++;
    }
    return this._parseValue(extractedValue, asString);
  }

  readNumbersLine(asStrings = false) {
    const lineContent = this._sourceLines[this._currentLineIndex++].split(" ");
    return asStrings ? lineContent : lineContent.map(val => this._parseValue(val, false));
  }

  readMatrix(numRows, asStrings = false) {
    const matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows).map(line => line.split(" "));
    return asStrings ? matrixRows : matrixRows.map(row => row.map(val => this._parseValue(val, false)));
  }

  readNumbersBlock(numLines, asStrings = false) {
    const blockLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
    return asStrings ? blockLines : blockLines.map(val => this._parseValue(val, false));
  }
}

const inputData = InputReader.fromString(require("fs").readFileSync("/dev/stdin", "utf8"));

function _buildMultiDimArrayEvalString(initialValue, dimensions) {
  let evalString = `Array(dimensions[${dimensions.length - 1}]).fill(0).map(x => { return ${initialValue}; })`;
  for (let i = dimensions.length - 2; i >= 0; i--) {
    evalString = `Array(dimensions[${i}]).fill(0).map(x => ${evalString})`;
  }
  return evalString;
}

function createMultiDimArray(initialValue, ...dimensions) {
  const evalString = _buildMultiDimArrayEvalString(initialValue, dimensions);
  return eval(evalString);
}

let adjacencyList, edgeBitmasks;

const resultValue = solveProblem();
if (resultValue !== undefined) console.log(resultValue);

function addEdgeToGraph(nodeA, nodeB, graph) {
  graph[nodeA].push(nodeB);
  graph[nodeB].push(nodeA);
}

function findEdgeIndex(nodeA, nodeB, edgeEndpointsA, edgeEndpointsB) {
  const minNode = Math.min(nodeA, nodeB);
  const maxNode = Math.max(nodeA, nodeB);
  for (let k = 0; k < edgeEndpointsA.length; k++) {
    if (edgeEndpointsA[k] === minNode && edgeEndpointsB[k] === maxNode) {
      return k;
    }
  }
  return -1;
}

function doubleDPValues(dpArray) {
  for (let i = 0; i < dpArray.length; i++) {
    dpArray[i] *= 2;
  }
}

function updateDPWithBitmask(currentDP, edgeMask, maxMask) {
  const nextDP = createMultiDimArray(0, maxMask);
  for (let i = 0; i < maxMask; i++) {
    nextDP[i | edgeMask] += currentDP[i];
    nextDP[i] += currentDP[i];
  }
  return nextDP;
}

function solveProblem() {
  const nodeCount = inputData.readNumber();
  const edgeEndpointsA = [], edgeEndpointsB = [];
  adjacencyList = createMultiDimArray("[]", nodeCount);
  edgeBitmasks = createMultiDimArray(0, nodeCount - 1);

  for (let idx = 0; idx < nodeCount - 1; idx++) {
    const node1 = inputData.readNumber() - 1;
    const node2 = inputData.readNumber() - 1;
    edgeEndpointsA[idx] = Math.min(node1, node2);
    edgeEndpointsB[idx] = Math.max(node1, node2);
    addEdgeToGraph(node1, node2, adjacencyList);
  }

  const queryCount = inputData.readNumber();
  for (let idx = 0; idx < queryCount; idx++) {
    const startNode = inputData.readNumber() - 1;
    const endNode = inputData.readNumber() - 1;
    const currentBitmask = 1 << idx;
    const pathNodes = findPathDFS(startNode, endNode, -1, []);

    for (let pathIdx = 1; pathIdx < pathNodes.length; pathIdx++) {
      const edgeNodeMin = Math.min(pathNodes[pathIdx - 1], pathNodes[pathIdx]);
      const edgeNodeMax = Math.max(pathNodes[pathIdx - 1], pathNodes[pathIdx]);

      const edgeIdx = findEdgeIndex(edgeNodeMin, edgeNodeMax, edgeEndpointsA, edgeEndpointsB);
      if (edgeIdx !== -1) {
        edgeBitmasks[edgeIdx] |= currentBitmask;
      }
    }
  }

  const maxBitmask = 1 << queryCount;
  let dynamicProgArray = createMultiDimArray(0, maxBitmask);
  dynamicProgArray[0] = 1;

  for (let idx = 0; idx < nodeCount - 1; idx++) {
    const currentEdgeBitmask = edgeBitmasks[idx];
    if (currentEdgeBitmask === 0) {
      doubleDPValues(dynamicProgArray);
    } else {
      dynamicProgArray = updateDPWithBitmask(dynamicProgArray, currentEdgeBitmask, maxBitmask);
    }
  }
  return dynamicProgArray[maxBitmask - 1];
}

function findPathDFS(currentNode, targetNode, parentNode, currentPath) {
  currentPath.push(currentNode);
  if (targetNode === currentNode) {
    return currentPath;
  }

  for (const neighborNode of adjacencyList[currentNode]) {
    if (neighborNode === parentNode) {
      continue;
    }
    const foundPath = findPathDFS(neighborNode, targetNode, currentNode, currentPath);
    if (foundPath) {
      return foundPath;
    }
  }
  currentPath.pop();
  return null;
}
