const appConfig = { input: '/dev/stdin', newline: '\n' };

const fileContent = require('fs').readFileSync(appConfig.input, 'ascii');
const trimmedContent = fileContent.trim();
const rawInputLines = trimmedContent.split(appConfig.newline);

const totalNodeCount = Number(rawInputLines.shift());

const graphNodes = {};
const adjacencyMatrix = {};

const INITIAL_MAX_DISTANCE = Number.POSITIVE_INFINITY;

function addWeightedEdge(matrix, sourceNodeId, targetNodeId, weightValue) {
  if (!matrix.hasOwnProperty(sourceNodeId)) {
    matrix[sourceNodeId] = {};
  }
  matrix[sourceNodeId][targetNodeId] = weightValue;
}

const parseNumbers = (lineStr) => lineStr.split(' ').map(Number);

for (let lineIndex = 0; lineIndex < rawInputLines.length; lineIndex++) {
  const nodeDataArray = parseNumbers(rawInputLines[lineIndex]);
  const currentNodeId = nodeDataArray[0];

  graphNodes[currentNodeId] = {
    id: currentNodeId,
    distance: INITIAL_MAX_DISTANCE,
    predecessor: null
  };

  for (let edgeDataIndex = 2; edgeDataIndex < nodeDataArray.length; edgeDataIndex += 2) {
    const targetNodeId = nodeDataArray[edgeDataIndex];
    const edgeWeight = nodeDataArray[edgeDataIndex + 1];
    addWeightedEdge(adjacencyMatrix, currentNodeId, targetNodeId, edgeWeight);
  }
}

const sourceNode = Object.values(graphNodes).find(node => node.id === 0);
if (sourceNode) {
  sourceNode.distance = 0;
}

function updateDistanceIfShorter(sourceNode, neighborNode, weightsMap) {
  if (weightsMap[sourceNode.id] && weightsMap[sourceNode.id][neighborNode.id] !== undefined) {
    const edgeWeight = weightsMap[sourceNode.id][neighborNode.id];
    const newCalculatedDistance = sourceNode.distance + edgeWeight;

    if (neighborNode.distance > newCalculatedDistance) {
      neighborNode.distance = newCalculatedDistance;
      neighborNode.predecessor = sourceNode;
    }
  }
}

function extractMinNode(queue) {
  if (queue.length === 0) {
    return null;
  }

  let minDistance = INITIAL_MAX_DISTANCE;
  let minIndex = -1;

  for (let i = 0; i < queue.length; i++) {
    if (queue[i].distance < minDistance) {
      minDistance = queue[i].distance;
      minIndex = i;
    }
  }

  if (minIndex !== -1) {
    const minNode = queue[minIndex];
    queue.splice(minIndex, 1);
    return minNode;
  }
  return null;
}

function computeShortestPathsDijkstra(weightsMap) {
  const settledNodes = [];
  let priorityQueue = Object.values(graphNodes);

  while (priorityQueue.length !== 0) {
    const extractedNode = extractMinNode(priorityQueue);

    if (!extractedNode) {
        break;
    }

    settledNodes.push(extractedNode);

    if (weightsMap[extractedNode.id]) {
      for (const neighborIdStr in weightsMap[extractedNode.id]) {
        const neighborNodeId = Number(neighborIdStr);
        const neighborNode = graphNodes[neighborNodeId];
        updateDistanceIfShorter(extractedNode, neighborNode, weightsMap);
      }
    }
  }
}

computeShortestPathsDijkstra(adjacencyMatrix);

for (const nodeIdKey in graphNodes) {
  const node = graphNodes[nodeIdKey];
  console.log("%s %d", node.id, node.distance);
}
