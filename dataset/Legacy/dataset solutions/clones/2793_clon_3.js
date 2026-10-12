const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputProcessor;
const inputLines = [];

inputReader.on('line', (lineContent) => {
  inputLines.push(lineContent);
});

inputReader.on('close', () => {
  inputProcessor = initializeInputProcessor(inputLines);
  console.error("\n");
  const startTime = Date.now();
  executeMainLogic();
  const endTime = Date.now() - startTime;
  printDebug("time : " + endTime + "ms");
  printDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function deepCopy(sourceObject) {
  return JSON.parse(JSON.stringify(sourceObject));
}

function parseInteger(value) {
  return parseInt(value, 10);
}

function splitBySpace(value) {
  return value.split(" ");
}

function splitAndParseNumbers(value) {
  return value.split(" ").map(Number);
}

function splitByChar(value) {
  return value.split("");
}

function splitAndParseCharsAsNumbers(value) {
  return value.split("").map(Number);
}

function joinBySpace(arr) {
  return arr.join(" ");
}

function joinByNewline(arr) {
  return arr.join("\n");
}

function joinNoCharacter(arr) {
  return arr.join("");
}

function convertInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInteger(inputValue);
      case 2:
        return splitBySpace(inputValue);
      case 4:
        return splitAndParseNumbers(inputValue);
      case 6:
        return splitByChar(inputValue);
      case 7:
        return splitAndParseCharsAsNumbers(inputValue);
      case 8:
        return joinBySpace(inputValue);
      case 9:
        return joinByNewline(inputValue);
      case 0:
        return joinNoCharacter(inputValue);
      default:
        return inputValue;
    }
  } catch (error) {
    return inputValue;
  }
}

function readInt() {
  return convertInput(getNextLine(), 1);
}

function readStrArray() {
  return convertInput(getNextLine(), 2);
}

function readIntArray() {
  return convertInput(getNextLine(), 4);
}

function readCharArray() {
  return convertInput(getNextLine(), 6);
}

function getNextLine() {
  return inputProcessor.next();
}

function hasMoreLines() {
  return inputProcessor.hasMoreLines();
}

function initializeInputProcessor(linesArray) {
  const processor = {
    dataLines: linesArray,
    currentIndex: 0,
    totalLines: linesArray.length,
    hasMoreLines: function() {
      return (this.currentIndex < this.totalLines);
    },
    next: function() {
      if (!this.hasMoreLines()) {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      }
      const currentLine = this.dataLines[this.currentIndex];
      this.currentIndex++;
      return currentLine;
    }
  };
  return processor;
}

function printOutput(message) {
  console.log(message);
}

function printDebug(message) {
  console.error("debug:" + require("util").inspect(message, false, null));
}

function executeMainLogic() {
  const MAX_DFS_DEPTH = 3;

  const [nodeCount, edgeCount] = readIntArray();

  const graphNodes = new Array(nodeCount).fill(null).map(() => ({
    children: [],
    parents: new Set(),
    visited: false,
    distance: 0
  }));

  for (let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
    const [sourceNodeRaw, destNodeRaw] = readIntArray();
    const sourceNodeIndex = sourceNodeRaw - 1;
    const destinationNodeIndex = destNodeRaw - 1;
    graphNodes[sourceNodeIndex].children.push(destinationNodeIndex);
  }

  for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
    findParentsDFS(nodeIdx, nodeIdx, 0);
  }

  const [startNodeRaw, targetNodeRaw] = readIntArray();
  const startNodeIndex = startNodeRaw - 1;
  const targetNodeIndex = targetNodeRaw - 1;

  const bfsQueue = [targetNodeIndex];
  graphNodes[targetNodeIndex].visited = true;
  let shortestPathDistance = 0;

  while (bfsQueue.length > 0) {
    const currentNodeIndex = bfsQueue.shift();
    const currentDistance = graphNodes[currentNodeIndex].distance;

    if (currentNodeIndex === startNodeIndex) {
      shortestPathDistance = currentDistance;
      break;
    }

    const parentIndices = Array.from(graphNodes[currentNodeIndex].parents);

    for (const parentIdx of parentIndices) {
      if (!graphNodes[parentIdx].visited) {
        graphNodes[parentIdx].visited = true;
        graphNodes[parentIdx].distance = currentDistance + 1;
        bfsQueue.push(parentIdx);
      }
    }
  }

  if (shortestPathDistance === 0) {
    printOutput(-1);
  } else {
    printOutput(shortestPathDistance);
  }

  function findParentsDFS(dfsRootNode, currentNode, currentDepth) {
    if (currentDepth === MAX_DFS_DEPTH) {
      graphNodes[currentNode].parents.add(dfsRootNode);
      return;
    }

    const currentChildren = graphNodes[currentNode].children;

    for (const childNode of currentChildren) {
      findParentsDFS(dfsRootNode, childNode, currentDepth + 1);
    }
    return;
  }
}
