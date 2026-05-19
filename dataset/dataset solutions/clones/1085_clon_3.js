function memoizeFunction(targetFunction) {
  const memoStore = {};
  return (...args) => {
    const cacheKey = args.join(',');
    const cachedResult = memoStore[cacheKey];

    const isResultCached = typeof cachedResult !== 'undefined';

    if (isResultCached) {
      return cachedResult;
    } else {
      const computedResult = targetFunction(...args);
      memoStore[cacheKey] = computedResult;
      return computedResult;
    }
  };
}

class TreeNode {
  constructor(nodeIdentifier, parentIdentifier, leftChildIdentifier, rightChildIdentifier) {
    this.nodeIdentifier = nodeIdentifier;
    this.parentIdentifier = parentIdentifier;
    this.leftChildIdentifier = leftChildIdentifier;
    this.rightChildIdentifier = rightChildIdentifier;
  }

  get isRoot() {
    return this.parentIdentifier === -1;
  }

  get isLeaf() {
    return this.leftChildIdentifier === -1 && this.rightChildIdentifier === -1;
  }

  get isInternal() {
    return !this.isRoot && !this.isLeaf;
  }

  get type() {
    if (this.isRoot) {
      return 'root';
    } else if (this.isLeaf) {
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
    this.calculateNodeDepth = memoizeFunction(this.calculateNodeDepth.bind(this));
    this.determineNodeHeight = memoizeFunction(this.determineNodeHeight.bind(this));
  }

  static get NodeType() {
    return TreeNode;
  }

  insertNode(nodeIdentifier, leftChildIdentifier, rightChildIdentifier) {
    const newNodeInstance = new TreeStructure.NodeType(nodeIdentifier, -1, leftChildIdentifier, rightChildIdentifier);
    this.nodeCollection[nodeIdentifier] = newNodeInstance;
  }

  establishRelationships() {
    const totalNodes = this.nodeCollection.length;

    // Initialize node details entries
    for (let idx = 0; idx < totalNodes; idx++) {
      this.nodeDetails[idx] = {
        node: null,
        sibling: -1,
        degree: 0
      };
    }

    // Set parent IDs and initial sibling info
    this.nodeCollection.forEach(currentNode => {
      if (!currentNode) return; // Skip empty slots if IDs are not contiguous

      if (currentNode.leftChildIdentifier !== -1) {
        const leftChild = this.nodeCollection[currentNode.leftChildIdentifier];
        if (leftChild) {
          leftChild.parentIdentifier = currentNode.nodeIdentifier;
          this.nodeDetails[currentNode.leftChildIdentifier].sibling = currentNode.rightChildIdentifier;
        }
      }
      if (currentNode.rightChildIdentifier !== -1) {
        const rightChild = this.nodeCollection[currentNode.rightChildIdentifier];
        if (rightChild) {
          rightChild.parentIdentifier = currentNode.nodeIdentifier;
          this.nodeDetails[currentNode.rightChildIdentifier].sibling = currentNode.leftChildIdentifier;
        }
      }
    });

    // Finalize node details with node reference and degree
    this.nodeCollection.forEach(currentNode => {
      if (!currentNode) return; // Skip empty slots

      const hasLeftChild = currentNode.leftChildIdentifier !== -1;
      const hasRightChild = currentNode.rightChildIdentifier !== -1;
      const currentDegree = (hasLeftChild ? 1 : 0) + (hasRightChild ? 1 : 0);

      const existingDetails = this.nodeDetails[currentNode.nodeIdentifier];
      this.nodeDetails[currentNode.nodeIdentifier] = {
        ...existingDetails,
        node: currentNode,
        degree: currentDegree
      };
    });
  }

  calculateNodeDepth(nodeIdentifier, currentDepth = 0) {
    const targetNode = this.retrieveNode(nodeIdentifier);
    if (!targetNode) return -1; // Should not happen with valid input

    const parentNodeId = targetNode.parentIdentifier;

    if (parentNodeId === -1) {
      return currentDepth;
    } else {
      return this.calculateNodeDepth(parentNodeId, currentDepth + 1);
    }
  }

  determineNodeHeight(nodeIdentifier, currentHeight = 0) {
    if (nodeIdentifier === -1) {
      return currentHeight - 1;
    }

    const targetNode = this.retrieveNode(nodeIdentifier);
    if (!targetNode) return currentHeight - 1; // Should not happen with valid input

    const leftChildHeight = this.determineNodeHeight(targetNode.leftChildIdentifier, currentHeight + 1);
    const rightChildHeight = this.determineNodeHeight(targetNode.rightChildIdentifier, currentHeight + 1);

    return Math.max(leftChildHeight, rightChildHeight);
  }

  retrieveNode(nodeIdentifier) {
    return this.nodeCollection[nodeIdentifier];
  }

  displayTreeInfo() {
    const formattedOutputLines = this.nodeDetails.map(detailEntry => {
      const node = detailEntry.node;
      if (!node) return ''; // Skip if node is null (e.g., sparse array)

      const parentId = node.parentIdentifier;
      const siblingId = detailEntry.sibling;
      const nodeDegree = detailEntry.degree;
      const nodeDepth = this.calculateNodeDepth(node.nodeIdentifier);
      const nodeHeight = this.determineNodeHeight(node.nodeIdentifier);
      const nodeType = node.type;

      return `node ${node.nodeIdentifier}: parent = ${parentId}, sibling = ${siblingId}, degree = ${nodeDegree}, depth = ${nodeDepth}, height = ${nodeHeight}, ${nodeType}`;
    }).filter(line => line !== ''); // Remove empty lines from sparse array handling

    console.log(formattedOutputLines.join('\n'));
  }
}

(function executeTreeProcessing() {
  const fileSystem = require('fs');
  const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
  const trimmedInput = rawInputContent.trim();
  const inputLines = trimmedInput.split('\n');

  const totalNodesCount = Number(inputLines.shift());

  const binaryTreeInstance = new TreeStructure();

  for (const currentLineString of inputLines) {
    const nodeData = currentLineString.split(' ').map(Number);
    const [nodeId, leftChildId, rightChildId] = nodeData;
    binaryTreeInstance.insertNode(nodeId, leftChildId, rightChildId);
  }

  binaryTreeInstance.establishRelationships();
  binaryTreeInstance.displayTreeInfo();
})();
