const fileSystem = require('fs');
const fileContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

const contentLines = fileContent.trim().split('\n');
const parsedEdges = contentLines.map(line => line.split(' ').map(Number));

class GraphConnection {
  constructor(destinationVertexId, connectionWeight = 1) {
    this.destinationVertexId = destinationVertexId;
    this.connectionWeight = connectionWeight;
  }
}

class GraphVertex {
  constructor() {
    this.outgoingConnections = [];
  }
  addOutgoingConnection(connection) {
    this.outgoingConnections.push(connection);
  }
  hasOddDegreeCount() {
    return (this.outgoingConnections.length % 2) === 1;
  }
}

class GraphStructure {
  constructor() {
    this.initializeStructure();
  }
  initializeStructure() {
    this.vertexRegistry = new Map();
  }
  retrieveOrCreateVertex(vertexIdentifier) {
    if (!this.vertexRegistry.has(vertexIdentifier)) {
      this.vertexRegistry.set(vertexIdentifier, new GraphVertex());
    }
    return this.vertexRegistry.get(vertexIdentifier);
  }
  establishConnection(startVertexId, connection) {
    const currentVertex = this.retrieveOrCreateVertex(startVertexId);
    currentVertex.addOutgoingConnection(connection);
  }
  calculateOddDegreeVertexCount() {
    let oddDegreeCounter = 0;
    for (const vertex of this.vertexRegistry.values()) {
      if (vertex.hasOddDegreeCount()) {
        oddDegreeCounter++;
      }
    }
    return oddDegreeCounter;
  }
  checkEulerianPathPossibility() {
    const totalOddDegreeVertices = this.calculateOddDegreeVertexCount();

    // Ensure vertices 1 and 2 exist in the registry for degree check,
    // even if they have no connections (degree 0, which is even).
    const vertexOne = this.retrieveOrCreateVertex(1);
    const vertexTwo = this.retrieveOrCreateVertex(2);

    if (totalOddDegreeVertices === 0) {
      return false;
    } else if (totalOddDegreeVertices === 2) {
      const isVertexOneOdd = vertexOne.hasOddDegreeCount();
      const isVertexTwoOdd = vertexTwo.hasOddDegreeCount();
      return isVertexOneOdd && isVertexTwoOdd;
    }
    return false;
  }
}

const currentGraph = new GraphStructure();

// Helper function for processing the end-of-graph marker
const handleGraphTermination = (graphInstance) => {
  const patrolResult = graphInstance.checkEulerianPathPossibility() ? 'OK' : 'NG';
  console.log(patrolResult);
  graphInstance.initializeStructure(); // Reset for next graph
};

for (const edgePair of parsedEdges) {
  const [startVertexId, endVertexId] = edgePair;

  if (startVertexId === 0 && endVertexId === 0) {
    handleGraphTermination(currentGraph);
    continue;
  }

  // Add connections for both directions to represent an undirected graph
  currentGraph.establishConnection(startVertexId, new GraphConnection(endVertexId));
  currentGraph.establishConnection(endVertexId, new GraphConnection(startVertexId));
}
