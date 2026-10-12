const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const lineSegments = fileContent.trim().split('\n');

const parseLineToNumbers = (lineStr) => lineStr.split(' ').map(Number);

const edgeDefinitions = lineSegments.map(parseLineToNumbers);

class GraphLink {
  constructor(targetIdentifier, linkWeight = 1) {
    this.targetIdentifier = targetIdentifier;
    this.linkWeight = linkWeight;
  }
}

class GraphNode {
  constructor() {
    this.connectedLinks = [];
  }
  attachLink(link) {
    this.connectedLinks.push(link);
  }
  hasOddConnections() {
    const connectionCount = this.connectedLinks.length;
    return (connectionCount % 2) === 1;
  }
}

class NetworkStructure {
  constructor() {
    this.resetNetwork();
  }
  resetNetwork() {
    this.nodeRegistry = new Map();
  }
  fetchNode(identifier) {
    if (!this.nodeRegistry.has(identifier)) {
      this.nodeRegistry.set(identifier, new GraphNode());
    }
    return this.nodeRegistry.get(identifier);
  }
  addNetworkLink(sourceIdentifier, link) {
    const sourceNode = this.fetchNode(sourceIdentifier);
    sourceNode.attachLink(link);
  }
  calculateOddDegreeNodes() {
    let oddCount = 0;
    for (const nodeEntry of this.nodeRegistry.values()) {
      if (nodeEntry.hasOddConnections()) {
        oddCount++;
      }
    }
    return oddCount;
  }
  isPatrolRouteFeasible() {
    const currentOddDegreeCount = this.calculateOddDegreeNodes();
    if (currentOddDegreeCount !== 2) {
      return false;
    }
    const nodeOne = this.fetchNode(1);
    const nodeTwo = this.fetchNode(2);
    return nodeOne.hasOddConnections() && nodeTwo.hasOddConnections();
  }
}

const TERMINATION_VALUE = 0;

function addUndirectedLink(network, id1, id2) {
  network.addNetworkLink(id1, new GraphLink(id2));
  network.addNetworkLink(id2, new GraphLink(id1));
}

function handleEndOfInput(network) {
  const patrolResult = network.isPatrolRouteFeasible() ? 'OK' : 'NG';
  console.log(patrolResult);
  network.resetNetwork();
}

const networkManager = new NetworkStructure();
edgeDefinitions.forEach((pair) => {
  const [nodeAId, nodeBId] = pair;
  if (nodeAId === TERMINATION_VALUE && nodeBId === TERMINATION_VALUE) {
    handleEndOfInput(networkManager);
    return;
  }
  addUndirectedLink(networkManager, nodeAId, nodeBId);
});
