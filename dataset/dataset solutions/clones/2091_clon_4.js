class DataHandler {
  constructor(dataLines) {
    this.allLines = dataLines;
    this.currentDataLine = 0;
    this.lineParts = [];
    this.partIndex = 0;
  }

  _ensureParts() {
    if (this.partIndex >= this.lineParts.length) {
      if (this.currentDataLine >= this.allLines.length) {
        throw new Error('No more information available.');
      }
      this.lineParts = this.allLines[this.currentDataLine++].split(' ');
      this.partIndex = 0;
    }
  }

  grabInteger() {
    this._ensureParts();
    return parseInt(this.lineParts[this.partIndex++], 10);
  }

  grabIntegerArray() {
    this._ensureParts();
    const activeLine = this.allLines[this.currentDataLine - 1];
    this.partIndex = this.lineParts.length;
    return activeLine.split(' ').map(str => parseInt(str, 10));
  }
}

function renderOutput(dataCollection) {
  console.log(dataCollection.join(' '));
}

function processGraphData(initialInputLines) {
  const handler = new DataHandler(initialInputLines);
  const totalElements = handler.grabInteger();

  // Graph representation and node attributes
  const adjacencyMatrix = new Map(); // Map<nodeId, Set<neighborId>>
  const elementLevels = new Map(); // Map<nodeId, level>
  const assignedFinalValues = new Map(); // Map<nodeId, assignedValue>

  for (let idx = 0; idx < totalElements; ++idx) {
    adjacencyMatrix.set(idx, new Set());
    assignedFinalValues.set(idx, -1); // Placeholder for unassigned
  }

  // Populate graph connections
  for (let idx = 0; idx < totalElements - 1; ++idx) {
    const [alphaNode, betaNode] = handler.grabIntegerArray().map(val => val - 1);
    adjacencyMatrix.get(alphaNode).add(betaNode);
    adjacencyMatrix.get(betaNode).add(alphaNode);
  }

  // Breadth-First Search to establish levels
  const levelQueue = [0]; // Begin BFS from node 0
  const previouslyVisited = new Set([0]);
  elementLevels.set(0, 1); // Root node is at level 1

  let pointer = 0;
  while (pointer < levelQueue.length) {
    const currentElement = levelQueue[pointer++];
    const currentElementLevel = elementLevels.get(currentElement);

    for (const connectedElement of adjacencyMatrix.get(currentElement)) {
      if (!previouslyVisited.has(connectedElement)) {
        previouslyVisited.add(connectedElement);
        elementLevels.set(connectedElement, currentElementLevel + 1);
        levelQueue.push(connectedElement);
      }
    }
  }

  // Count elements by level parity
  let oddLevelNodes = 0;
  let evenLevelNodes = 0;
  for (const level of elementLevels.values()) {
    if (level % 2 === 1) {
      oddLevelNodes++;
    } else {
      evenLevelNodes++;
    }
  }

  // Value assignment logic
  let seriesOne = 1;
  let seriesTwo = 2;
  let seriesThree = 3;

  if (oddLevelNodes > (totalElements / 3) && evenLevelNodes > (totalElements / 3)) {
    for (let idx = 0; idx < totalElements; ++idx) {
      const nodeDepth = elementLevels.get(idx);
      if (nodeDepth % 2 === 1) { // Odd level
        if (seriesOne <= totalElements) {
          assignedFinalValues.set(idx, seriesOne);
          seriesOne += 3;
        }
      } else { // Even level
        if (seriesTwo <= totalElements) {
          assignedFinalValues.set(idx, seriesTwo);
          seriesTwo += 3;
        }
      }
    }
  } else {
    // Determine which parity of levels gets initial 'seriesThree' assignments
    const targetParityForSeriesThree = (oddLevelNodes < evenLevelNodes) ? 1 : 0; // 1 for odd, 0 for even
    for (let idx = 0; idx < totalElements; ++idx) {
      const nodeDepth = elementLevels.get(idx);
      if (nodeDepth % 2 === targetParityForSeriesThree) {
        assignedFinalValues.set(idx, seriesThree);
        seriesThree += 3;
      }
    }
  }

  // Fill in any remaining unassigned values
  for (let idx = 0; idx < totalElements; ++idx) {
    if (assignedFinalValues.get(idx) === -1) {
      if (seriesOne <= totalElements) {
        assignedFinalValues.set(idx, seriesOne);
        seriesOne += 3;
      } else if (seriesTwo <= totalElements) {
        assignedFinalValues.set(idx, seriesTwo);
        seriesTwo += 3;
      } else if (seriesThree <= totalElements) {
        assignedFinalValues.set(idx, seriesThree);
        seriesThree += 3;
      }
    }
  }

  // Compile results for display
  const finalResultArray = Array.from({ length: totalElements }, (_, elementIdx) => assignedFinalValues.get(elementIdx));
  renderOutput(finalResultArray);
}

// System interaction boilerplate (Type IV clone)
let bufferedInput = [];
const systemIO = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

systemIO.on('line', (incomingLine) => {
  bufferedInput.push(incomingLine);
});

systemIO.on('close', () => {
  const executionStartMoment = Date.now();
  processGraphData(bufferedInput);
  const executionEndMoment = Date.now();

  console.error('\n');
  console.error('debug-timing: ' + (executionEndMoment - executionStartMoment) + 'ms');
  console.error('debug-memory: ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});