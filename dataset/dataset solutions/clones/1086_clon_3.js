function cacheFunction(originalFunc) {
  const cacheStore = {};
  return (...args) => {
    const cacheKey = args.toString(); // Simple key for primitive args
    const cachedResult = cacheStore[cacheKey];

    if (typeof cachedResult === 'undefined') {
      const computedResult = originalFunc(...args);
      cacheStore[cacheKey] = computedResult;
      return computedResult;
    } else {
      return cachedResult;
    }
  };
}

class TreeNode {
  constructor(nodeId, parentIdentifier, leftChildId, rightChildId) {
    this.nodeId = nodeId;
    this.parentIdentifier = parentIdentifier;
    this.leftChildId = leftChildId;
    this.rightChildId = rightChildId;
  }

  isRootNode() {
    return this.parentIdentifier === -1;
  }

  isLeafNode() {
    return this.leftChildId === -1 && this.rightChildId === -1;
  }

  get nodeType() {
    if (this.isRootNode()) {
      return 'root';
    } else if (this.isLeafNode()) {
      return 'leaf';
    } else {
      return 'internal node';
    }
  }
}

class TreeStructure {
  constructor() {
    this.nodeCollection = [];
    this.nodeDetails = [];
    this.getDepth = cacheFunction(this.getDepth.bind(this));
  }

  static get Node() {
    return TreeNode;
  }

  addNode(nodeId, leftChildId, rightChildId) {
    const newNodeInstance = new TreeStructure.Node(nodeId, -1, leftChildId, rightChildId);
    this.nodeCollection[nodeId] = newNodeInstance;
  }

  initializeNodeDetails() {
    for (let i = 0; i < this.nodeCollection.length; i++) {
      this.nodeDetails[i] = {
        node: null,
        sibling: -1,
        degree: 0
      };
    }
  }

  establishConnections() {
    this.nodeCollection.forEach(currentNode => {
      if (currentNode.leftChildId !== -1) {
        const leftChildNode = this.nodeCollection[currentNode.leftChildId];
        leftChildNode.parentIdentifier = currentNode.nodeId;
        this.nodeDetails[currentNode.leftChildId].sibling = currentNode.rightChildId;
      }
      if (currentNode.rightChildId !== -1) {
        const rightChildNode = this.nodeCollection[currentNode.rightChildId];
        rightChildNode.parentIdentifier = currentNode.nodeId;
        this.nodeDetails[currentNode.rightChildId].sibling = currentNode.leftChildId;
      }
    });
  }

  calculateDegrees() {
    this.nodeCollection.forEach(currentNode => {
      const hasLeftChild = currentNode.leftChildId !== -1;
      const hasRightChild = currentNode.rightChildId !== -1;
      const currentDegree = (hasLeftChild ? 1 : 0) + (hasRightChild ? 1 : 0);

      const existingDetails = this.nodeDetails[currentNode.nodeId];
      this.nodeDetails[currentNode.nodeId] = {
        sibling: existingDetails.sibling,
        node: currentNode,
        degree: currentDegree
      };
    });
  }

  connectTreeNodes() {
    this.initializeNodeDetails();
    this.establishConnections();
    this.calculateDegrees();
  }

  getDepth(nodeId, currentLevel = 0) {
    const targetNode = this.findNode(nodeId);
    if (!targetNode) {
      return -1; // Or throw an error, depending on desired behavior for non-existent nodes
    }
    const parentIdentifier = targetNode.parentIdentifier;
    return parentIdentifier === -1 ? currentLevel : this.getDepth(parentIdentifier, currentLevel + 1);
  }

  getHeight(nodeId, currentLevel = 0) {
    if (nodeId === -1) {
      return currentLevel - 1;
    }
    const currentNode = this.findNode(nodeId);
    const leftIdentifier = currentNode.leftChildId;
    const rightIdentifier = currentNode.rightChildId;

    const leftHeight = this.getHeight(leftIdentifier, currentLevel + 1);
    const rightHeight = this.getHeight(rightIdentifier, currentLevel + 1);

    return Math.max(leftHeight, rightHeight);
  }

  findNode(nodeId) {
    return this.nodeCollection[nodeId];
  }

  _formatNodeOutput(detailEntry) {
    const node = detailEntry.node;
    const depthValue = this.getDepth(node.nodeId);
    const heightValue = this.getHeight(node.nodeId);
    const nodeTypeValue = node.nodeType;

    return `node: ${node.nodeId}: parent = ${node.parentIdentifier}, sibling = ${detailEntry.sibling}, degree = ${detailEntry.degree}, depth = ${depthValue}, height = ${heightValue}, ${nodeTypeValue}`;
  }

  displayTreeInfo() {
    const formattedOutputLines = this.nodeDetails.map(detailEntry =>
      this._formatNodeOutput(detailEntry)
    );
    console.log(formattedOutputLines.join('\n'));
  }
}

(function mainExecution() {
  const fileSystemModule = require('fs');
  const fileContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
  const inputLines = fileContent.trim().split('\n');

  const nodeCount = Number(inputLines.shift());

  let binaryTreeInstance = new TreeStructure();

  for (const lineStr of inputLines) {
    const nodeData = lineStr.split(' ').map(Number);
    binaryTreeInstance.addNode(...nodeData);
  }

  binaryTreeInstance.connectTreeNodes();
  binaryTreeInstance.displayTreeInfo();
})();
