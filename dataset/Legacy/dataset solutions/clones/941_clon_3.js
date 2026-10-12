const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const processedLines = fileContent.trim().split('\n');
const totalNodesCount = Number(processedLines.shift());
const adjacencyMatrixData = processedLines.map((lineStr) => lineStr.split(' ').map(Number));

class ClockTracker {
  constructor(initialTick = 0) {
    this.currentTick = initialTick;
  }
  advanceAndGet() {
    this.currentTick = this.currentTick + 1;
    return this.currentTick;
  }
}
const globalClock = new ClockTracker();

class GraphVertex {
  constructor(vertexIdentifier) {
    this.vertexIdentifier = vertexIdentifier;
    this.adjacentVertices = [];
    this.discoveryTime = undefined;
    this.finishTime = undefined;
  }

  connectTo(targetVertex) {
    this.adjacentVertices.push(targetVertex);
  }

  hasBeenProcessed() {
    return this.discoveryTime !== undefined;
  }

  depthFirstSearchVisit() {
    const currentDiscoveryTime = globalClock.advanceAndGet();
    this.discoveryTime = currentDiscoveryTime;

    // Sort children by ID for consistent traversal order
    this.adjacentVertices.sort((vA, vB) => {
      if (vA.vertexIdentifier > vB.vertexIdentifier) {
        return 1;
      }
      if (vA.vertexIdentifier < vB.vertexIdentifier) {
        return -1;
      }
      return 0;
    });

    for (const childVertex of this.adjacentVertices) {
      if (!childVertex.hasBeenProcessed()) {
        childVertex.depthFirstSearchVisit();
      }
    }

    const currentFinishTime = globalClock.advanceAndGet();
    this.finishTime = currentFinishTime;
  }

  getFormattedTimes() {
    return [this.vertexIdentifier, this.discoveryTime, this.finishTime].join(' ');
  }
}

class GraphProcessor {
  constructor() {
    this.vertexRegistry = new Map();
  }

  retrieveOrCreateVertex(vertexId) {
    if (!this.vertexRegistry.has(vertexId)) {
      this.vertexRegistry.set(vertexId, new GraphVertex(vertexId));
    }
    return this.vertexRegistry.get(vertexId);
  }

  performDFSForAll() {
    // Iterate through all possible node IDs from 1 to totalNodesCount
    for (let i = 1; i <= this.vertexRegistry.size; i++) {
      const currentVertex = this.vertexRegistry.get(i);
      // Only visit if the node exists and hasn't been processed yet
      if (currentVertex && !currentVertex.hasBeenProcessed()) {
        currentVertex.depthFirstSearchVisit();
      }
    }
  }

  displayVertexTimes() {
    for (let i = 1; i <= this.vertexRegistry.size; i++) {
      const vertexToPrint = this.vertexRegistry.get(i);
      console.log(vertexToPrint.getFormattedTimes());
    }
  }
}

const mainGraph = new GraphProcessor();

adjacencyMatrixData.forEach((lineEntry) => {
  const [sourceId, numChildren, ...targetIds] = lineEntry;
  const sourceVertex = mainGraph.retrieveOrCreateVertex(sourceId);

  for (const targetId of targetIds) {
    const targetVertex = mainGraph.retrieveOrCreateVertex(targetId);
    sourceVertex.connectTo(targetVertex);
  }
});

mainGraph.performDFSForAll();
mainGraph.displayVertexTimes();
