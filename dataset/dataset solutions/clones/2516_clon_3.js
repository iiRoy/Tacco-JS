const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
let inputHandler;
const inputLines = [];

inputReader.on('line', (line) => { inputLines.push(line); });
inputReader.on('close', () => {
  inputHandler = createInputHandler(inputLines);
  console.error("\n");
  const startTime = Date.now();
  executeMainLogic();
  const endTime = Date.now() - startTime;
  printDebugError("time : " + endTime + "ms");
  printDebugError("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function deepCopyObject(sourceObj) {
  return JSON.parse(JSON.stringify(sourceObj));
}

function parseInteger(inputStr) { return parseInt(inputStr); }
function splitBySpace(inputStr) { return inputStr.split(" "); }
function splitBySpaceAndParseInt(inputStr) { return inputStr.split(" ").map(Number); }
function splitByChar(inputStr) { return inputStr.split(""); }
function splitByCharAndParseInt(inputStr) { return inputStr.split("").map(Number); }
function joinBySpace(arr) { return arr.join(" "); }
function joinByNewline(arr) { return arr.join("\n"); }
function joinNoChar(arr) { return arr.join(""); }

function convertInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1: return parseInteger(inputValue);
      case 2: return splitBySpace(inputValue);
      case 4: return splitBySpaceAndParseInt(inputValue);
      case 6: return splitByChar(inputValue);
      case 7: return splitByCharAndParseInt(inputValue);
      case 8: return joinBySpace(inputValue);
      case 9: return joinByNewline(inputValue);
      case 0: return joinNoChar(inputValue);
      default: return inputValue;
    }
  } catch (e) {
    return inputValue;
  }
}

function readInteger() { return convertInput(getNextInputLine(), 1); }
function readStringArray() { return convertInput(getNextInputLine(), 2); }
function readIntArray() { return convertInput(getNextInputLine(), 4); }
function readCharacterArray() { return convertInput(getNextInputLine(), 6); }
function getNextInputLine() { return inputHandler.next(); }
function hasMoreInput() { return inputHandler.hasMoreInput(); }

class InputHandler {
  constructor(lines) {
    this.dataLines = lines;
    this.currentIndex = 0;
    this.maxLines = lines.length;
  }

  hasMoreInput() {
    return (this.currentIndex < this.maxLines);
  }

  next() {
    if (!this.hasMoreInput()) {
      throw "ArrayIndexOutOfBoundsException ‚There is no more input";
    }
    return this.dataLines[this.currentIndex++];
  }
}

function createInputHandler(lines) {
    return new InputHandler(lines);
}

function printOutput(message) { console.log(message); }
function printDebugError(message) { console.error("debug:" + require("util").inspect(message, false, null)); }

class GraphNode {
  constructor() {
    this.neighbors = [];
    this.visited = false;
    this.depth = 1;
  }
}

function performBFSAndCalculateMaxDepth(graphNodes, startNodeIndex) {
  let currentMaxDepth = 1;
  const bfsQueue = [startNodeIndex];
  graphNodes[startNodeIndex].visited = true;

  while (bfsQueue.length > 0) {
    const currentNodeIndex = bfsQueue.shift();
    const currentChildren = graphNodes[currentNodeIndex].neighbors;
    const currentDepth = graphNodes[currentNodeIndex].depth;

    for (let k = 0; k < currentChildren.length; k++) {
      const childNodeIndex = currentChildren[k];
      if (!graphNodes[childNodeIndex].visited) {
        graphNodes[childNodeIndex].visited = true;
        graphNodes[childNodeIndex].depth = currentDepth + 1;
        currentMaxDepth = Math.max(currentMaxDepth, currentDepth + 1);
        bfsQueue.push(childNodeIndex);
      }
    }
  }
  return currentMaxDepth;
}

function checkCrossLevelConnections(graphNodes, nodeCount) {
  let problemDetected = false;
  for (let nodeIdxA = 0; nodeIdxA < nodeCount - 1; nodeIdxA++) {
    for (let nodeIdxB = nodeIdxA + 1; nodeIdxB < nodeCount; nodeIdxB++) {
      const nodeA = graphNodes[nodeIdxA];
      const nodeB = graphNodes[nodeIdxB];

      const areDepthsEqual = (nodeA.depth === nodeB.depth);
      const areConnected = (nodeA.neighbors.includes(nodeIdxB) || nodeB.neighbors.includes(nodeIdxA));

      if (areDepthsEqual && areConnected) {
        printDebugError({ i: nodeIdxA, j: nodeIdxB });
        problemDetected = true;
        break;
      }
    }
  }
  return problemDetected;
}

function executeMainLogic() {
  const nodeCount = readInteger();
  const graphNodes = new Array(nodeCount);

  for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
    graphNodes[nodeIdx] = new GraphNode();
  }

  for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
    const adjacencyRow = readCharacterArray();
    for (let neighborIdx = 0; neighborIdx < nodeCount; neighborIdx++) {
      if (nodeIdx !== neighborIdx && adjacencyRow[neighborIdx] === "1") {
        graphNodes[nodeIdx].neighbors.push(neighborIdx);
      }
    }
  }

  let maxDepthResult = -1;
  let startNodeFound = false;
  let initialBFSStartNode = -1;

  for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
    if (graphNodes[nodeIdx].neighbors.length === 1) {
      startNodeFound = true;
      initialBFSStartNode = nodeIdx;
      maxDepthResult = performBFSAndCalculateMaxDepth(graphNodes, initialBFSStartNode);
      break;
    }
  }

  if (!startNodeFound) {
    printOutput(maxDepthResult);
    return;
  }

  const problemInConnections = checkCrossLevelConnections(graphNodes, nodeCount);
  if (problemInConnections) {
    maxDepthResult = -1;
  }

  printOutput(maxDepthResult);
}
