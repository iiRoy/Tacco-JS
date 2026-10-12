const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const processedLines = rawData.trim().split('\n');
const nodeCount = Number(processedLines.shift());
const adjacencyListRaw = processedLines.map((lineStr) => lineStr.split(' ').map(Number));

class TaskQueue {
  constructor() {
    this.items = [];
  }
  add(item) {
    this.items.push(item);
  }
  remove() {
    return this.items.shift();
  }
  isEmpty() {
    return this.items.length === 0;
  }
}

class GraphNode {
  constructor(nodeIdentifier) {
    this.nodeIdentifier = nodeIdentifier;
    this.connectedNodes = new Set();
    this.nodeAttributes = new Map();
  }
  connectTo(targetNode) {
    this.connectedNodes.add(targetNode);
  }
  getAttribute(key) {
    return this.nodeAttributes.get(key);
  }
  setAttribute(key, value) {
    return this.nodeAttributes.set(key, value);
  }
  hasAttribute(key) {
    return this.nodeAttributes.has(key);
  }
  formatOutput() {
    const depthValue = this.getAttribute('depth');
    return `${this.nodeIdentifier} ${depthValue}`;
  }
}

class GraphProcessor {
  constructor() {
    this.nodeRegistry = new Map();
    this.processingQueue = new TaskQueue();
  }
  registerNode(nodeInstance) {
    this.nodeRegistry.set(nodeInstance.nodeIdentifier, nodeInstance);
  }
  isNodeRegistered(nodeId) {
    return this.nodeRegistry.has(nodeId);
  }
  retrieveNode(nodeId) {
    return this.nodeRegistry.get(nodeId);
  }

  ensureNodeExists(nodeId) {
    if (!this.isNodeRegistered(nodeId)) {
      const newNode = new GraphNode(nodeId);
      this.registerNode(newNode);
    }
    return this.retrieveNode(nodeId);
  }

  traverseBreadthFirst() {
    while (!this.processingQueue.isEmpty()) {
      const currentProcessingNode = this.processingQueue.remove();

      currentProcessingNode.connectedNodes.forEach(neighborNode => {
        if (!neighborNode.hasAttribute('depth')) {
          const newDepth = currentProcessingNode.getAttribute('depth') + 1;
          neighborNode.setAttribute('depth', newDepth);
          this.processingQueue.add(neighborNode);
        }
      });
    }
  }

  displayResults() {
    for (let i = 1; i <= this.nodeRegistry.size; i++) {
      const nodeToDisplay = this.retrieveNode(i);
      console.log(nodeToDisplay.formatOutput());
    }
  }
}

const graphInstance = new GraphProcessor();

adjacencyListRaw.forEach((entry) => {
  const [nodeId, numChildren, ...childIdentifiers] = entry;

  const parentNode = graphInstance.ensureNodeExists(nodeId);

  childIdentifiers.forEach(childId => {
    const childNode = graphInstance.ensureNodeExists(childId);
    parentNode.connectTo(childNode);
  });
});

const startingNode = graphInstance.retrieveNode(1);
startingNode.setAttribute('depth', 0);
graphInstance.processingQueue.add(startingNode);
graphInstance.traverseBreadthFirst();

graphInstance.displayResults();
