const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const processedLines = rawData.trim().split('\n');
const nodeCount = Number(processedLines.shift());
const adjacencyList = processedLines.map((s) => s.split(' ').map(Number));

class TreeNode {
  constructor(identifier) {
    this.identifier = identifier;
    this.childNodes = [];
    this.parentNode = null;
  }

  addChild(nodeToAdd) {
    nodeToAdd.parentNode = this;
    this.childNodes.push(nodeToAdd);
  }

  hasParentNode() {
    return !!this.parentNode;
  }

  hasChildNodes() {
    return this.childNodes.length > 0;
  }

  getNodeType() {
    if (!this.hasParentNode()) {
      return 'root';
    } else if (this.hasChildNodes()) {
      return 'internal node';
    } else {
      return 'leaf';
    }
  }

  computeDepth(currentDepth) {
    this.nodeDepth = currentDepth;
    const nextDepth = currentDepth + 1;
    for (const child of this.childNodes) {
      child.computeDepth(nextDepth);
    }
  }

  formatNodeInfo() {
    const parentIdentifier = this.hasParentNode() ? this.parentNode.identifier : -1;
    const childrenIdentifiers = this.childNodes.map(child => child.identifier).join(', ');
    const typeDescription = this.getNodeType();

    return `node ${this.identifier}: parent = ${parentIdentifier}, depth = ${this.nodeDepth}, ${typeDescription}, [${childrenIdentifiers}]`;
  }
}

class GraphStructure {
  constructor() {
    this.nodeRegistry = new Map();
  }

  retrieveNode(identifier) {
    if (!this.nodeRegistry.has(identifier)) {
      const newNode = new TreeNode(identifier);
      this.nodeRegistry.set(identifier, newNode);
    }
    return this.nodeRegistry.get(identifier);
  }

  findRootNode() {
    const allNodes = Array.from(this.nodeRegistry.values());
    const rootCandidates = allNodes.filter(node => !node.hasParentNode());
    // A valid tree should always have exactly one root
    return rootCandidates.length > 0 ? rootCandidates[0] : null;
  }

  calculateDepths() {
    const rootNode = this.findRootNode();
    if (rootNode) {
      rootNode.computeDepth(0);
    }
  }

  displayNodes() {
    for (let i = 0; i < this.nodeRegistry.size; i++) {
      const currentNode = this.nodeRegistry.get(i);
      console.log(currentNode.formatNodeInfo());
    }
  }
}

const graphInstance = new GraphStructure();

const processAdjacencyEntry = (entryData) => {
  const [parentNodeId, childCount, ...childNodeIds] = entryData;
  const currentParentNode = graphInstance.retrieveNode(parentNodeId);

  childNodeIds.forEach(childId => {
    const childNode = graphInstance.retrieveNode(childId);
    currentParentNode.addChild(childNode);
  });
};

adjacencyList.forEach(processAdjacencyEntry);

graphInstance.calculateDepths();
graphInstance.displayNodes();
