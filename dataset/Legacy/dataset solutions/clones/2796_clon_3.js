const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputHandler;
const inputLines = [];

inputReader.on('line', function(lineContent) {
  inputLines.push(lineContent);
});

inputReader.on('close', function() {
  inputHandler = initializeInputHandler(inputLines);
  console.error("\n");
  const startTime = Date.now();
  executeGraphTraversal();
  const elapsedTime = Date.now() - startTime;
  printDebug("time : " + elapsedTime + "ms");
  printDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function deepCopyObject(originalObject) {
  return JSON.parse(JSON.stringify(originalObject));
}

const ONE_BASED_INDEX_OFFSET = 1;

function getNextInputLine() {
  return inputHandler.next();
}

function hasMoreInput() {
  return inputHandler.hasNext();
}

function readInteger() {
  return convertInput(getNextInputLine(), 1);
}

function readStringArray() {
  return convertInput(getNextInputLine(), 2);
}

function readIntegerArray() {
  return convertInput(getNextInputLine(), 4);
}

function readCharacterArray() {
  return convertInput(getNextInputLine(), 6);
}

function initializeInputHandler(linesArray) {
  const handlerObject = {
    lineList: linesArray,
    currentIndex: 0,
    maxLines: linesArray.length,
    hasNext: function() {
      return (this.currentIndex < this.maxLines);
    },
    next: function() {
      if (!this.hasNext()) {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      }
      const currentInput = this.lineList[this.currentIndex];
      this.currentIndex++;
      return currentInput;
    }
  };
  return handlerObject;
}

function printOutput(data) {
  console.log(data);
}

function printDebug(data) {
  console.error("debug:" + require("util").inspect(data, false, null));
}

const CONVERSION_TYPES = {
  PARSE_INT: 1,
  SPLIT_SPACE: 2,
  SPLIT_SPACE_AND_PARSE_INT: 4,
  SPLIT_CHAR: 6,
  SPLIT_CHAR_AND_PARSE_INT: 7,
  JOIN_SPACE: 8,
  JOIN_NEWLINE: 9,
  JOIN_NO_CHAR: 0
};

function convertInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case CONVERSION_TYPES.PARSE_INT:
        return parseInt(inputValue);
      case CONVERSION_TYPES.SPLIT_SPACE:
        return inputValue.split(" ");
      case CONVERSION_TYPES.SPLIT_SPACE_AND_PARSE_INT:
        return inputValue.split(" ").map(Number);
      case CONVERSION_TYPES.SPLIT_CHAR:
        return inputValue.split("");
      case CONVERSION_TYPES.SPLIT_CHAR_AND_PARSE_INT:
        return inputValue.split("").map(Number);
      case CONVERSION_TYPES.JOIN_SPACE:
        return inputValue.join(" ");
      case CONVERSION_TYPES.JOIN_NEWLINE:
        return inputValue.join("\n");
      case CONVERSION_TYPES.JOIN_NO_CHAR:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (error) {
    return inputValue;
  }
}

const DFS_MAX_DEPTH = 3;
const BFS_QUEUE_CAPACITY = 100007;

function createAdjacencyListNode() {
  return {
    children: []
  };
}

function createProcessedNode() {
  return {
    parentSet: new Set(),
    isAccessed: false,
    pathDepth: 0
  };
}

function executeGraphTraversal() {
  const graphDimensions = readIntegerArray();
  const nodeCount = graphDimensions[0];
  const edgeCount = graphDimensions[1];

  const adjacencyList = Array.from({
    length: nodeCount
  }, createAdjacencyListNode);
  const processedNodes = Array.from({
    length: nodeCount
  }, createProcessedNode);

  for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
    const edgePair = readIntegerArray();
    const fromNode = edgePair[0] - ONE_BASED_INDEX_OFFSET;
    const toNode = edgePair[1] - ONE_BASED_INDEX_OFFSET;
    adjacencyList[fromNode].children.push(toNode);
  }

  for (let nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++) {
    explorePaths(nodeIndex, nodeIndex, 0);
  }

  const startTargetPair = readIntegerArray();
  const sourceNode = startTargetPair[0] - ONE_BASED_INDEX_OFFSET;
  const targetNode = startTargetPair[1] - ONE_BASED_INDEX_OFFSET;

  let queueFront = 0;
  let queueRear = 0;
  const bfsQueue = new Array(BFS_QUEUE_CAPACITY);

  bfsQueue[queueRear] = targetNode;
  queueRear++;
  processedNodes[targetNode].isAccessed = true;

  let shortestPathLength = -1;

  while (queueFront !== queueRear) {
    const currentNode = bfsQueue[queueFront];
    queueFront++;

    if (currentNode === sourceNode) {
      shortestPathLength = processedNodes[currentNode].pathDepth;
      break;
    }

    const currentParents = Array.from(processedNodes[currentNode].parentSet);
    for (let parentIndex = 0; parentIndex < currentParents.length; parentIndex++) {
      const parentNode = currentParents[parentIndex];
      if (!processedNodes[parentNode].isAccessed) {
        processedNodes[parentNode].isAccessed = true;
        processedNodes[parentNode].pathDepth = processedNodes[currentNode].pathDepth + 1;
        bfsQueue[queueRear] = parentNode;
        queueRear++;
      }
    }
  }

  printOutput(shortestPathLength);

  function explorePaths(initialRoot, currentDfsNode, currentPathDepth) {
    if (currentPathDepth === DFS_MAX_DEPTH) {
      processedNodes[currentDfsNode].parentSet.add(initialRoot);
      return;
    }

    const currentChildren = adjacencyList[currentDfsNode].children;
    for (let childIndex = 0; childIndex < currentChildren.length; childIndex++) {
      const nextChildNode = currentChildren[childIndex];
      explorePaths(initialRoot, nextChildNode, currentPathDepth + 1);
    }
    return;
  }
}
