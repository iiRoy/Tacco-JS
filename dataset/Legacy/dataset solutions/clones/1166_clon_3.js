let adjacencyList = [];
let totalVerticesCount;
let totalEdgesCount;

const parseNumbers = (str) => str.split(' ').map(Number);

const processInputData = (inputString) => {
  const rawInputLines = inputString.split('\n');
  const meaningfulLines = rawInputLines.filter(line => line.trim() !== '');

  if (meaningfulLines.length === 0) {
    return;
  }

  const [vertices, edges] = parseNumbers(meaningfulLines[0]);
  totalVerticesCount = vertices;
  totalEdgesCount = edges;

  for (let i = 0; i < totalVerticesCount; ++i) {
    adjacencyList[i] = [];
  }

  for (let i = 1; i < meaningfulLines.length; ++i) {
    const [u, v, c] = parseNumbers(meaningfulLines[i]);
    addFlowEdge(u, v, c);
  }
};

class FlowEdge {
  constructor(target, capacity, reverseIndex) {
    this.target = target;
    this.capacity = capacity;
    this.reverseIndex = reverseIndex;
  }
}

function addFlowEdge(sourceNode, targetNode, capacityValue) {
  const currentSourceAdjLength = adjacencyList[sourceNode].length;
  const currentTargetAdjLength = adjacencyList[targetNode].length;

  adjacencyList[sourceNode].push(new FlowEdge(targetNode, capacityValue, currentTargetAdjLength));
  adjacencyList[targetNode].push(new FlowEdge(sourceNode, 0, currentSourceAdjLength));
}

let visitedStatus;

function findAugmentingPath(currentNode, sinkNodeIdentifier, pathFlowLimit) {
  if (currentNode === sinkNodeIdentifier) {
    return pathFlowLimit;
  }

  visitedStatus[currentNode] = true;

  for (const edge of adjacencyList[currentNode]) {
    if (visitedStatus[edge.target] || edge.capacity <= 0) {
      continue;
    }

    const potentialFlow = Math.min(pathFlowLimit, edge.capacity);
    const flowFoundInPath = findAugmentingPath(edge.target, sinkNodeIdentifier, potentialFlow);

    if (flowFoundInPath > 0) {
      edge.capacity -= flowFoundInPath;
      adjacencyList[edge.target][edge.reverseIndex].capacity += flowFoundInPath;
      return flowFoundInPath;
    }
  }

  return 0;
}

function computeMaxFlow(sourceIdentifier, sinkIdentifier) {
  let accumulatedFlow = 0;
  const MAX_CAPACITY_VALUE = Number.POSITIVE_INFINITY;

  while (true) {
    visitedStatus = new Array(totalVerticesCount).fill(false);

    const flowIncrement = findAugmentingPath(sourceIdentifier, sinkIdentifier, MAX_CAPACITY_VALUE);

    if (flowIncrement === 0) {
      break;
    }

    accumulatedFlow += flowIncrement;
  }

  return accumulatedFlow;
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (inputBuffer) => {
  processInputData(inputBuffer);
  console.log(computeMaxFlow(0, totalVerticesCount - 1));
});
