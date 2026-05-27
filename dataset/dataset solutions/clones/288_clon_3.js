const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const lineData = rawData.trim().split('\n');

function parseLineToNumbers(lineString) {
  return lineString.split(' ').map(Number);
}

const connectionPairs = lineData.map(parseLineToNumbers);

class Connection {
  constructor(targetId, linkStrength = 1) {
    this.targetId = targetId;
    this.linkStrength = linkStrength;
  }
}

class Vertex {
  constructor() {
    this.connectedLinks = [];
  }
  addConnection(connectionObject) {
    this.connectedLinks.push(connectionObject);
  }
  hasOddDegree() {
    return (this.connectedLinks.length % 2) !== 0;
  }
}

class Network {
  constructor() {
    this.resetNetwork();
  }
  resetNetwork() {
    this.vertexRegistry = new Map();
  }
  retrieveOrCreateVertex(nodeIdentifier) {
    if (!this.vertexRegistry.has(nodeIdentifier)) {
      this.vertexRegistry.set(nodeIdentifier, new Vertex());
    }
    return this.vertexRegistry.get(nodeIdentifier);
  }
  addConnection(startNodeId, connectionObject) {
    const currentVertex = this.retrieveOrCreateVertex(startNodeId);
    currentVertex.addConnection(connectionObject);
  }
  countOddDegreeVertices() {
    const allVertices = Array.from(this.vertexRegistry.values());
    const oddDegreeVertices = allVertices.filter(vtx => vtx.hasOddDegree());
    return oddDegreeVertices.length;
  }
  isPatrollable() {
    const oddDegreeVertexCount = networkInstance.countOddDegreeVertices(); // Using global instance as per original
    const totalVertexCount = this.vertexRegistry.size;

    const ZERO_ODD_DEGREES = 0;
    const TWO_ODD_DEGREES = 2;
    const NODE_ONE_ID = 1;
    const NODE_TWO_ID = 2;

    // Rule: If the total number of vertices is even, it's not patrollable.
    if (totalVertexCount % TWO_ODD_DEGREES === ZERO_ODD_DEGREES) {
      return false;
    }

    // Rule: If all vertices have even degrees, it's patrollable (Eulerian circuit).
    if (oddDegreeVertexCount === ZERO_ODD_DEGREES) {
      return true;
    }

    // Rule: If exactly two vertices have odd degrees, and they are nodes 1 and 2, it's patrollable (Eulerian path).
    const isSpecificTwoOdd = (
      oddDegreeVertexCount === TWO_ODD_DEGREES &&
      networkInstance.retrieveOrCreateVertex(NODE_ONE_ID).hasOddDegree() && // Using global instance as per original
      networkInstance.retrieveOrCreateVertex(NODE_TWO_ID).hasOddDegree()    // Using global instance as per original
    );

    if (isSpecificTwoOdd) {
      return true;
    }

    // All other cases are not patrollable.
    return false;
  }
}

function handleEndOfInput(currentNetwork) {
  const patrolStatus = currentNetwork.isPatrollable() ? 'OK' : 'NG';
  console.log(patrolStatus);
  currentNetwork.resetNetwork();
}

const networkInstance = new Network();

for (const [startNodeId, targetId] of connectionPairs) {
  const TERMINATION_VALUE = 0;

  if (startNodeId === TERMINATION_VALUE && targetId === TERMINATION_VALUE) {
    handleEndOfInput(networkInstance);
    continue;
  }

  const forwardConnection = new Connection(targetId);
  networkInstance.addConnection(startNodeId, forwardConnection);

  const backwardConnection = new Connection(startNodeId);
  networkInstance.addConnection(targetId, backwardConnection);
}
