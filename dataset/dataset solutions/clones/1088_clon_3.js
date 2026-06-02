function createMemoizer(targetFunction) {
  const memoStorage = {};
  return (...invocationArgs) => {
    const argsKey = String(invocationArgs);
    if (Object.prototype.hasOwnProperty.call(memoStorage, argsKey)) {
      return memoStorage[argsKey];
    } else {
      const result = targetFunction(...invocationArgs);
      memoStorage[argsKey] = result;
      return result;
    }
  };
}

class BinaryTreeNode {
  constructor(nodeIdentifier, parentIdentifier, leftChildIdentifier, rightChildIdentifier) {
    this.nodeIdentifier = nodeIdentifier;
    this.parentIdentifier = parentIdentifier;
    this.leftChildIdentifier = leftChildIdentifier;
    this.rightChildIdentifier = rightChildIdentifier;
  }

  _determineNodeType() {
    if (this.parentIdentifier === -1) {
      return 'root';
    }
    if (this.leftChildIdentifier === -1 && this.rightChildIdentifier === -1) {
      return 'leaf';
    }
    return 'internal node';
  }

  get nodeType() {
    return this._determineNodeType();
  }
}

class TreeProcessor {
  constructor() {
    this.nodeCollection = [];
    this.detailedNodeInfo = [];
    const boundComputeDepth = this.computeNodeDepth.bind(this);
    this.computeNodeDepth = createMemoizer(boundComputeDepth);
  }

  static get TreeNodeClass() {
    return BinaryTreeNode;
  }

  registerNode(nodeIdentifier, leftChildIdentifier, rightChildIdentifier) {
    const newNode = new TreeProcessor.TreeNodeClass(nodeIdentifier, -1, leftChildIdentifier, rightChildIdentifier);
    this.nodeCollection[nodeIdentifier] = newNode;
  }

  establishTreeLinks() {
    for (let i = 0; i < this.nodeCollection.length; i++) {
      this.detailedNodeInfo[i] = { node: null, sibling: -1, degree: 0 };
    }

    this.nodeCollection.forEach(currentNode => {
      // The original code implicitly assumes 'currentNode' is not undefined here.
      // If 'nodeCollection' is sparse, this forEach will naturally skip undefined entries.
      // Accessing properties of 'this.nodeCollection[id]' without a check
      // would cause a TypeError if the node at 'id' is undefined, replicating original behavior.

      if (currentNode.leftChildIdentifier !== -1) {
        this.nodeCollection[currentNode.leftChildIdentifier].parentIdentifier = currentNode.nodeIdentifier;
        this.detailedNodeInfo[currentNode.leftChildIdentifier].sibling = currentNode.rightChildIdentifier;
      }
      if (currentNode.rightChildIdentifier !== -1) {
        this.nodeCollection[currentNode.rightChildIdentifier].parentIdentifier = currentNode.nodeIdentifier;
        this.detailedNodeInfo[currentNode.rightChildIdentifier].sibling = currentNode.leftChildIdentifier;
      }
    });

    this.nodeCollection.forEach(currentNode => {
      // The original code implicitly assumes 'currentNode' is not undefined here.
      const currentInfoRecord = this.detailedNodeInfo[currentNode.nodeIdentifier];
      currentInfoRecord.node = currentNode;
      currentInfoRecord.degree = this._calculateNodeDegree(currentNode);
    });
  }

  _calculateNodeDegree(node) {
    let degreeCount = 0;
    if (node.leftChildIdentifier !== -1) {
      degreeCount++;
    }
    if (node.rightChildIdentifier !== -1) {
      degreeCount++;
    }
    return degreeCount;
  }

  computeNodeDepth(nodeIdentifier, currentLevel = 0) {
    const targetNode = this.retrieveNodeById(nodeIdentifier);
    const immediateParentId = targetNode.parentIdentifier;
    if (immediateParentId === -1) {
      return currentLevel;
    } else {
      return this.computeNodeDepth(immediateParentId, currentLevel + 1);
    }
  }

  computeNodeHeight(nodeIdentifier, currentLevel = 0) {
    if (nodeIdentifier === -1) {
      return currentLevel - 1;
    }
    const currentNode = this.retrieveNodeById(nodeIdentifier);
    const leftChildId = currentNode.leftChildIdentifier;
    const rightChildId = currentNode.rightChildIdentifier;

    const heightFromLeft = this.computeNodeHeight(leftChildId, currentLevel + 1);
    const heightFromRight = this.computeNodeHeight(rightChildId, currentLevel + 1);

    return Math.max(heightFromLeft, heightFromRight);
  }

  retrieveNodeById(nodeIdentifier) {
    return this.nodeCollection[nodeIdentifier];
  }

  outputTreeStructure() {
    const formattedOutputLines = this.detailedNodeInfo.map(nodeRecord => {
      // The original code implicitly assumes 'nodeRecord.node' is valid for entries
      // that correspond to actual nodes. If 'nodeCollection' is sparse and an index 'i'
      // has no node, 'detailedNodeInfo[i].node' will be null, and accessing properties
      // like 'nodeRecord.node.nodeIdentifier' would cause a TypeError,
      // replicating the original's potential crash behavior.
      const nodeId = nodeRecord.node.nodeIdentifier;
      const parentId = nodeRecord.node.parentIdentifier;
      const siblingId = nodeRecord.sibling;
      const degreeValue = nodeRecord.degree;
      const depthValue = this.computeNodeDepth(nodeId);
      const heightValue = this.computeNodeHeight(nodeId);
      const nodeKind = nodeRecord.node.nodeType;

      return `node: ${nodeId}: parent = ${parentId}, sibling = ${siblingId}, degree = ${degreeValue}, depth = ${depthValue}, height = ${heightValue}, ${nodeKind}`;
    });
    console.log(formattedOutputLines.join('\n'));
  }
}

(function initializeTreeProcessing() {
  const fileSystemModule = require('fs');
  const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
  const inputDataLines = rawInputContent.trim().split('\n');

  const totalNodeCount = Number(inputDataLines.shift());

  const treeInstance = new TreeProcessor();

  inputDataLines.forEach(lineContent => {
    const [nodeId, leftNodeRef, rightNodeRef] = lineContent.split(' ').map(Number);
    treeInstance.registerNode(nodeId, leftNodeRef, rightNodeRef);
  });

  treeInstance.establishTreeLinks();
  treeInstance.outputTreeStructure();
})();
