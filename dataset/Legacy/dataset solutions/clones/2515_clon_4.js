const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

let rawInputLines = [];
inputReader.on('line', (line) => rawInputLines.push(line));
inputReader.on('close', () => {
  const inputProcessor = setupInputProcessor(rawInputLines);
  console.error("\n");
  const startTime = Date.now();
  processGraph(inputProcessor);
  const endTime = Date.now() - startTime;
  logDebug("time : " + endTime + "ms");
  logDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function setupInputProcessor(lines) {
  let currentLineIndex = 0;
  const totalLines = lines.length;

  return {
    hasMoreLines: () => currentLineIndex < totalLines,
    getNextLine: () => {
      if (!this.hasMoreLines()) {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      }
      return lines[currentLineIndex++];
    }
  };
}

function outputResult(data) {
  console.log(data);
}

function logDebug(message) {
  console.error("debug:" + require("util").inspect(message, false, null));
}

const dataConverter = {
  toInteger: (str) => parseInt(str, 10),
  toStringArray: (str) => str.split(" "),
  toIntegerArray: (str) => str.split(" ").map(Number),
  toCharacterArray: (str) => str.split(""),
  joinWithSpace: (arr) => arr.join(" "),
  joinWithNewline: (arr) => arr.join("\n"),
  joinWithoutSeparator: (arr) => arr.join("")
};

function readInteger(inputProc) { return dataConverter.toInteger(inputProc.getNextLine()); }
function readStringArray(inputProc) { return dataConverter.toStringArray(inputProc.getNextLine()); }
function readIntegerArray(inputProc) { return dataConverter.toIntegerArray(inputProc.getNextLine()); }
function readCharacterArray(inputProc) { return dataConverter.toCharacterArray(inputProc.getNextLine()); }

function processGraph(inputProc) {
  const nodeCount = readInteger(inputProc);

  const adjacencies = Array.from({ length: nodeCount }, () => []);

  for (let i = 0; i < nodeCount; i++) {
    const currentRowChars = readCharacterArray(inputProc);
    for (let j = 0; j < nodeCount; j++) {
      if (i !== j && currentRowChars[j] === "1") {
        adjacencies[i].push(j);
      }
    }
  }

  let nodeDistances = new Array(nodeCount).fill(-1);
  let nodeVisited = new Array(nodeCount).fill(false);

  const farthestFromStart = exploreGraph(0, nodeCount, adjacencies, nodeDistances, nodeVisited);

  nodeDistances.fill(-1);
  nodeVisited.fill(false);

  exploreGraph(farthestFromStart, nodeCount, adjacencies, nodeDistances, nodeVisited);

  let finalResult = 0;
  let conflictDetected = false;

  for (let i = 0; i < nodeCount; i++) {
    finalResult = Math.max(finalResult, nodeDistances[i]);

    for (let j = i + 1; j < nodeCount; j++) {
      if (nodeDistances[i] === nodeDistances[j] && (adjacencies[i].includes(j) || adjacencies[j].includes(i))) {
        conflictDetected = true;
        break;
      }
    }
    if (conflictDetected) {
      break;
    }
  }

  if (conflictDetected) {
    outputResult(-1);
  } else {
    outputResult(finalResult);
  }

  function exploreGraph(startNodeIdentifier, totalNodes, graphAdjacencies, distancesArray, visitedArray) {
    const traversalQueue = [];
    let queueHead = 0;

    distancesArray[startNodeIdentifier] = 1;
    visitedArray[startNodeIdentifier] = true;
    traversalQueue.push(startNodeIdentifier);

    let maximumDistance = 0;
    let farthestNodeFound = startNodeIdentifier;

    while (queueHead < traversalQueue.length) {
      const currentNode = traversalQueue[queueHead++];
      const currentNeighbors = graphAdjacencies[currentNode];

      for (let neighborIndex = 0; neighborIndex < currentNeighbors.length; neighborIndex++) {
        const neighborNode = currentNeighbors[neighborIndex];
        if (!visitedArray[neighborNode]) {
          visitedArray[neighborNode] = true;
          distancesArray[neighborNode] = distancesArray[currentNode] + 1;
          traversalQueue.push(neighborNode);

          if (distancesArray[neighborNode] > maximumDistance) {
            maximumDistance = distancesArray[neighborNode];
            farthestNodeFound = neighborNode;
          }
        }
      }
    }
    return farthestNodeFound;
  }
}
