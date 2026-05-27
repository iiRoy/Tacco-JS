const cfg = { input: '/dev/stdin', newline: '\n' };

const assert = require('assert');

const inputLines = require('fs').readFileSync(cfg.input, 'ascii')
  .trim()
  .split(cfg.newline);

const numNodes = Number(inputLines.shift());

const nodeDataMap = {};
const adjacencyWeights = {};

function createGraphNode(nodeIdentifier) {
  return {
    'id': nodeIdentifier,
    'd': Number.POSITIVE_INFINITY,
    'pi': null,
    'heapindex': null
  };
}

function storeEdgeWeight(weightMap, sourceId, targetId, weightVal) {
  weightMap[sourceId] = weightMap[sourceId] || {};
  weightMap[sourceId][targetId] = weightVal;
}

for (const currentLine of inputLines) {
  const parsedLine = currentLine.split(' ').map(Number);
  const currentSourceId = parsedLine[0];

  nodeDataMap[currentSourceId] = createGraphNode(currentSourceId);

  for (let edgeDataIndex = 2; edgeDataIndex < parsedLine.length; edgeDataIndex += 2) {
    storeEdgeWeight(adjacencyWeights, currentSourceId, parsedLine[edgeDataIndex], parsedLine[edgeDataIndex + 1]);
  }
}

for (const nodeIdStr in nodeDataMap) {
  if (nodeDataMap[nodeIdStr].id === 0) {
    nodeDataMap[nodeIdStr].d = 0;
    break;
  }
}

const minPriorityQueue = new Array(numNodes + 1);
let queueCurrentSize = 0;

for (let i = 0; i <= numNodes; i++) {
  minPriorityQueue[i] = null;
}

function swapHeapElements(heapArray, indexA, indexB) {
  const tempNodeRef = heapArray[indexA];
  heapArray[indexA] = heapArray[indexB];
  heapArray[indexB] = tempNodeRef;
  heapArray[indexA].heapindex = indexA;
  heapArray[indexB].heapindex = indexB;
}

function heapifyDown(heapArray, idx) {
  const leftChildIdx = idx << 1;
  const rightChildIdx = (idx << 1) + 1;
  let smallestChildIdx = idx;

  if (leftChildIdx <= queueCurrentSize && heapArray[leftChildIdx].d < heapArray[smallestChildIdx].d) {
    smallestChildIdx = leftChildIdx;
  }
  if (rightChildIdx <= queueCurrentSize && heapArray[rightChildIdx].d < heapArray[smallestChildIdx].d) {
    smallestChildIdx = rightChildIdx;
  }

  if (smallestChildIdx !== idx) {
    swapHeapElements(heapArray, idx, smallestChildIdx);
    heapifyDown(heapArray, smallestChildIdx);
  }
}

function extractMinimum(heapArray) {
  assert(queueCurrentSize >= 1, 'Heap underflow: Cannot extract from an empty heap.');

  const minNode = heapArray[1];
  minNode.heapindex = null;

  heapArray[1] = heapArray[queueCurrentSize];
  heapArray[1].heapindex = 1;
  heapArray[queueCurrentSize] = null;
  queueCurrentSize--;

  heapifyDown(heapArray, 1);
  return minNode;
}

function decreaseKeyAndBubbleUp(heapArray, idx, nodeToInsert) {
  assert(nodeToInsert.d <= heapArray[idx].d, 'New key is larger than current key, cannot decrease.');

  heapArray[idx] = nodeToInsert;
  heapArray[idx].heapindex = idx;

  let currentIdx = idx;
  while (currentIdx > 1) {
    const parentIdx = currentIdx >> 1;
    if (heapArray[parentIdx].d <= heapArray[currentIdx].d) {
      break;
    }
    swapHeapElements(heapArray, currentIdx, parentIdx);
    currentIdx = parentIdx;
  }
}

const INFINITE_NODE_TEMPLATE = {
  'id': null,
  'd': Number.POSITIVE_INFINITY,
  'pi': null,
  'heapindex': null
};

function insertIntoMinHeap(heapArray, nodeToInsert) {
  queueCurrentSize++;
  heapArray[queueCurrentSize] = INFINITE_NODE_TEMPLATE;
  decreaseKeyAndBubbleUp(heapArray, queueCurrentSize, nodeToInsert);
}

function updateEdgeRelaxation(sourceNode, targetNode, allWeights) {
  const edgeWeight = allWeights[sourceNode.id][targetNode.id];
  if (targetNode.d > sourceNode.d + edgeWeight) {
    targetNode.d = sourceNode.d + edgeWeight;
    targetNode.pi = sourceNode;
    if (targetNode.heapindex !== null) {
      decreaseKeyAndBubbleUp(minPriorityQueue, targetNode.heapindex, targetNode);
    }
  }
}

function runDijkstra(allWeights) {
  const finalizedNodes = [];
  const activeQueue = minPriorityQueue;

  Object.values(nodeDataMap).forEach(node => insertIntoMinHeap(activeQueue, node));

  while (queueCurrentSize > 0) {
    const extractedNode = extractMinimum(activeQueue);
    finalizedNodes.push(extractedNode);

    if (allWeights[extractedNode.id]) {
      for (const neighborIdStr in allWeights[extractedNode.id]) {
        const neighborNode = nodeDataMap[neighborIdStr];
        updateEdgeRelaxation(extractedNode, neighborNode, allWeights);
      }
    }
  }
}

runDijkstra(adjacencyWeights);

for (const nodeIdStr in nodeDataMap) {
  console.log("%s %d", nodeIdStr, nodeDataMap[nodeIdStr].d);
}
