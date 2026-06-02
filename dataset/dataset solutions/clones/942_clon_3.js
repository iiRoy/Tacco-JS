const fileSystem = require('fs');
const standardInputPath = '/dev/stdin';
const rawInputContent = fileSystem.readFileSync(standardInputPath, 'utf8');

const trimmedInput = rawInputContent.trim();
const inputLines = trimmedInput.split('\n');
const totalNodeCount = Number(inputLines.shift());
const adjacencyData = inputLines.map((line) => line.split(' ').map(Number));

class GraphNode {
  constructor(identifier) {
    this.nodeIdentifier = identifier;
    this.timingData = {};
    this.parentNodes = [];
    this.childNodes = [];
    this.adjacentNodes = null;
  }

  addChildNode(childGraphNode) {
    childGraphNode.parentNodes.push(this);
    this.childNodes.push(childGraphNode);
  }

  hasTimingData() {
    return this.timingData.startTime !== undefined;
  }

  assignTimingMetrics(currentTimestamp) {
    this.timingData.startTime = currentTimestamp;

    if (this.adjacentNodes === null) {
      const combinedNeighbors = this.parentNodes.concat(this.childNodes);
      this.adjacentNodes = combinedNeighbors.sort((nodeA, nodeB) => nodeA.nodeIdentifier - nodeB.nodeIdentifier);
    }

    for (const neighborNode of this.adjacentNodes) {
      if (!neighborNode.hasTimingData()) {
        currentTimestamp = neighborNode.assignTimingMetrics(currentTimestamp + 1);
      }
    }
    this.timingData.endTime = currentTimestamp + 1;
    return this.timingData.endTime;
  }

  formatNodeOutput() {
    return `${this.nodeIdentifier} ${this.timingData.startTime} ${this.timingData.endTime}`;
  }
}

class GraphStructure {
  constructor() {
    this.nodeRegistry = new Map();
  }

  retrieveNode(identifier) {
    let targetNode = this.nodeRegistry.get(identifier);
    if (targetNode === undefined) {
      targetNode = new GraphNode(identifier);
      this.nodeRegistry.set(identifier, targetNode);
    }
    return targetNode;
  }

  displayResults() {
    for (let i = 1; i <= this.nodeRegistry.size; i++) {
      const nodeToDisplay = this.nodeRegistry.get(i);
      console.log(nodeToDisplay.formatNodeOutput());
    }
  }
}

const graphInstance = new GraphStructure();

const processAdjacencyEntry = (entryLine) => {
  const [parentNodeId, , ...childNodeIds] = entryLine;
  const currentParentNode = graphInstance.retrieveNode(parentNodeId);
  for (const childId of childNodeIds) {
    const currentChildNode = graphInstance.retrieveNode(childId);
    currentParentNode.addChildNode(currentChildNode);
  }
};

for (const entry of adjacencyData) {
  processAdjacencyEntry(entry);
}

const startingNode = graphInstance.retrieveNode(1);
startingNode.assignTimingMetrics(1);
graphInstance.displayResults();
