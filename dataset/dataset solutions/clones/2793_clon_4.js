const inputHandler = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
let rawInputLines = [];
inputHandler.on('line', (line) => rawInputLines.push(line));
inputHandler.on('close', () => {
  const inputProcessor = createInputProcessor(rawInputLines);
  console.error("\n");
  const startTime = Date.now();
  solveProblem(inputProcessor);
  const endTime = Date.now() - startTime;
  debugLog("time : " + endTime + "ms");
  debugLog("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function createInputProcessor(lines) {
  let currentLineIndex = 0;
  const totalLines = lines.length;

  return {
    retrieveNext: () => {
      if (currentLineIndex >= totalLines) {
        throw new Error("No more input lines available.");
      }
      return lines[currentLineIndex++];
    },
    hasMore: () => currentLineIndex < totalLines
  };
}

function parseInteger(str) {
  return parseInt(str, 10);
}

function parseIntegerArray(str) {
  return str.split(" ").map(Number);
}

function outputLine(content) {
  console.log(content);
}

function debugLog(content) {
  console.error("debug:" + require("util").inspect(content, false, null));
}

function solveProblem(processor) {
  const firstLineData = parseIntegerArray(processor.retrieveNext());
  const nodeCount = firstLineData[0];
  const edgeCount = firstLineData[1];

  const forwardEdges = Array.from({ length: nodeCount }, () => []);
  const threeStepPredecessors = Array.from({ length: nodeCount }, () => new Set());

  for (let i = 0; i < edgeCount; i++) {
    const edgeData = parseIntegerArray(processor.retrieveNext());
    forwardEdges[edgeData[0] - 1].push(edgeData[1] - 1);
  }

  for (let startNode = 0; startNode < nodeCount; startNode++) {
    const traversalQueue = [[startNode, 0]];
    let queueHead = 0;

    while (queueHead < traversalQueue.length) {
      const [currentNode, currentDepth] = traversalQueue[queueHead++];

      if (currentDepth === 3) {
        threeStepPredecessors[currentNode].add(startNode);
        continue;
      }

      if (currentDepth < 3) {
        for (const neighbor of forwardEdges[currentNode]) {
          traversalQueue.push([neighbor, currentDepth + 1]);
        }
      }
    }
  }

  const pathQuery = parseIntegerArray(processor.retrieveNext());
  const startNodeIndex = pathQuery[0] - 1;
  const targetNodeIndex = pathQuery[1] - 1;

  const bfsQueue = [[targetNodeIndex, 0]];
  const visitedNodes = new Array(nodeCount).fill(false);
  visitedNodes[targetNodeIndex] = true;
  let minimumJumps = 0;

  let queueHead = 0;
  while (queueHead < bfsQueue.length) {
    const [currentNode, currentJumps] = bfsQueue[queueHead++];

    if (currentNode === startNodeIndex) {
      minimumJumps = currentJumps;
      break;
    }

    for (const predecessor of threeStepPredecessors[currentNode]) {
      if (!visitedNodes[predecessor]) {
        visitedNodes[predecessor] = true;
        bfsQueue.push([predecessor, currentJumps + 1]);
      }
    }
  }

  if (minimumJumps === 0) {
    outputLine(-1);
  } else {
    outputLine(minimumJumps);
  }
}
