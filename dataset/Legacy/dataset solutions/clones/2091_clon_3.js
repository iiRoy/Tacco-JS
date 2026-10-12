const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
let inputProcessor;
const inputLines = [];

inputReader.on('line', (line) => { inputLines.push(line); });
inputReader.on('close', () => {
  inputProcessor = initializeInputProcessor(inputLines);
  console.error('\n');
  const startTime = Date.now();
  solveProblem();
  const endTime = Date.now() - startTime;
  printDebug('time : ' + endTime + 'ms');
  printDebug('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

function deepClone(obj) {
  return (obj instanceof Set) ? new Set(Array.from(obj)) : JSON.parse(JSON.stringify(obj));
}

function readInt() { return convertInput(getNextToken(), 1); }
function readStrArray() { return convertInput(getNextToken(), 2); }
function readIntArray() { return convertInput(getNextToken(), 4); }
function readCharArray() { return convertInput(getNextToken(), 6); }

function getNextToken() { return inputProcessor.getNext(); }
function hasMoreTokens() { return inputProcessor.hasMore(); }

function initializeInputProcessor(linesArray) {
  return {
    dataList: linesArray,
    currentIndex: 0,
    maxIndex: linesArray.length,
    hasMore: function() { return (this.currentIndex < this.maxIndex); },
    getNext: function() {
      if (this.hasMore()) {
        return this.dataList[this.currentIndex++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

function printOutput(message) { console.log(message); }
function printDebug(message) { console.error('debug:' + require('util').inspect(message, false, null)); }

function convertInput(input, conversionType) {
  try {
    switch (conversionType) {
      case 1: return parseInt(input);
      case 2: return input.split(' ');
      case 4: return input.split(' ').map(Number);
      case 6: return input.split('');
      case 7: return input.split('').map(Number);
      case 8: return input.join(' ');
      case 9: return input.join('\n');
      case 0: return input.join('');
      default: return input;
    }
  } catch (e) {
    return input;
  }
}

function createGraphNode() {
  return {
    nodeDepth: null,
    isVisited: false,
    adjacencies: [],
    assignedValue: -1
  };
}

function performBfsTraversal(startNodeIndex, graphNodes, totalNodes) {
  const bfsQueue = new Array(totalNodes + 5);
  let queueFront = 0;
  let queueRear = 1;

  bfsQueue[0] = startNodeIndex;
  graphNodes[startNodeIndex].isVisited = true;
  graphNodes[startNodeIndex].nodeDepth = 1;

  let oddDepthNodesCount = 0;
  let evenDepthNodesCount = 0;

  while (queueFront !== queueRear) {
    const currentNodeIndex = bfsQueue[queueFront++];
    const currentDepth = graphNodes[currentNodeIndex].nodeDepth;

    if (currentDepth % 2 === 1) {
      oddDepthNodesCount++;
    } else {
      evenDepthNodesCount++;
    }

    const currentChildren = graphNodes[currentNodeIndex].adjacencies;
    for (let j = 0; j < currentChildren.length; j++) {
      const childNodeIndex = currentChildren[j];
      const childNode = graphNodes[childNodeIndex];

      if (!childNode.isVisited) {
        childNode.isVisited = true;
        childNode.nodeDepth = currentDepth + 1;
        bfsQueue[queueRear++] = childNodeIndex;
      }
    }
  }
  return { odd: oddDepthNodesCount, even: evenDepthNodesCount };
}

function tryAssignValue(node, valueRef, maxN) {
  if (valueRef.current <= maxN) {
    node.assignedValue = valueRef.current;
    valueRef.current += 3;
    return true;
  }
  return false;
}

function solveProblem() {
  const nodeCount = readInt();
  const graphNodes = new Array(nodeCount);
  const finalValues = new Array(nodeCount);

  for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
    graphNodes[nodeIdx] = createGraphNode();
  }

  for (let edgeIdx = 0; edgeIdx < nodeCount - 1; edgeIdx++) {
    const edgeData = readIntArray();
    const nodeA = edgeData[0] - 1;
    const nodeB = edgeData[1] - 1;
    graphNodes[nodeA].adjacencies.push(nodeB);
    graphNodes[nodeB].adjacencies.push(nodeA);
  }

  const { odd: oddDepthNodesCount, even: evenDepthNodesCount } = performBfsTraversal(0, graphNodes, nodeCount);

  const valOffset1 = { current: 1 };
  const valOffset2 = { current: 2 };
  const valOffset3 = { current: 3 };

  const threshold = nodeCount / 3;

  if (oddDepthNodesCount > threshold && evenDepthNodesCount > threshold) {
    for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
      const currentNode = graphNodes[nodeIdx];
      if (currentNode.nodeDepth % 2 === 1) {
        tryAssignValue(currentNode, valOffset1, nodeCount);
      } else {
        tryAssignValue(currentNode, valOffset2, nodeCount);
      }
    }
  } else {
    const targetDepthParity = (oddDepthNodesCount < evenDepthNodesCount) ? 1 : 0;
    for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
      const currentNode = graphNodes[nodeIdx];
      const isOddDepth = (currentNode.nodeDepth % 2 === 1);
      if ((targetDepthParity === 1 && isOddDepth) || (targetDepthParity === 0 && !isOddDepth)) {
        tryAssignValue(currentNode, valOffset3, nodeCount);
      }
    }
  }

  for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
    const currentNode = graphNodes[nodeIdx];
    if (currentNode.assignedValue === -1) {
      if (!tryAssignValue(currentNode, valOffset1, nodeCount)) {
        if (!tryAssignValue(currentNode, valOffset2, nodeCount)) {
          tryAssignValue(currentNode, valOffset3, nodeCount);
        }
      }
    }
    finalValues[nodeIdx] = currentNode.assignedValue;
  }

  printOutput(convertInput(finalValues, 8));
}
