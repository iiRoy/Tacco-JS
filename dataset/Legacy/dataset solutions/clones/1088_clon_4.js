const createMemoizer = (operationFunction) => {
  const resultCache = new Map();
  return (...inputArguments) => {
    const keyRepresentation = JSON.stringify(inputArguments);
    if (resultCache.has(keyRepresentation)) {
      return resultCache.get(keyRepresentation);
    }
    const computedOutcome = operationFunction(...inputArguments);
    resultCache.set(keyRepresentation, computedOutcome);
    return computedOutcome;
  };
};

class TreeStructure {
  constructor() {
    this.nodeRegistry = new Map();
    this.depthMemo = createMemoizer(this.calculateDepth.bind(this));
  }

  static createNodeRecord(identifier, leftChildId, rightChildId) {
    return {
      identifier: identifier,
      parentIdentifier: -1,
      leftChildIdentifier: leftChildId,
      rightChildIdentifier: rightChildId,
      siblingIdentifier: -1,
      nodeDegree: 0,
      kind: ''
    };
  }

  registerNode(identifier, leftChildId, rightChildId) {
    this.nodeRegistry.set(identifier, TreeStructure.createNodeRecord(identifier, leftChildId, rightChildId));
  }

  establishConnections() {
    for (const currentRecord of this.nodeRegistry.values()) {
      let currentDegree = 0;

      if (currentRecord.leftChildIdentifier !== -1) {
        const leftChildRecord = this.nodeRegistry.get(currentRecord.leftChildIdentifier);
        if (leftChildRecord) {
          leftChildRecord.parentIdentifier = currentRecord.identifier;
          leftChildRecord.siblingIdentifier = currentRecord.rightChildIdentifier;
        }
        currentDegree++;
      }

      if (currentRecord.rightChildIdentifier !== -1) {
        const rightChildRecord = this.nodeRegistry.get(currentRecord.rightChildIdentifier);
        if (rightChildRecord) {
          rightChildRecord.parentIdentifier = currentRecord.identifier;
          rightChildRecord.siblingIdentifier = currentRecord.leftChildIdentifier;
        }
        currentDegree++;
      }
      currentRecord.nodeDegree = currentDegree;

      if (currentRecord.parentIdentifier === -1) {
        currentRecord.kind = 'root';
      } else if (currentRecord.leftChildIdentifier === -1 && currentRecord.rightChildIdentifier === -1) {
        currentRecord.kind = 'leaf';
      } else {
        currentRecord.kind = 'internal node';
      }
    }
  }

  calculateDepth(nodeIdentifier) {
    let currentDepth = 0;
    let currentId = nodeIdentifier;
    while (true) {
      const node = this.nodeRegistry.get(currentId);
      if (!node || node.parentIdentifier === -1) {
        break;
      }
      currentId = node.parentIdentifier;
      currentDepth++;
    }
    return currentDepth;
  }

  determineHeight(nodeIdentifier, currentLevel = 0) {
    if (nodeIdentifier === -1) {
      return currentLevel - 1;
    }
    const node = this.nodeRegistry.get(nodeIdentifier);
    if (!node) return currentLevel - 1;

    const leftHeight = this.determineHeight(node.leftChildIdentifier, currentLevel + 1);
    const rightHeight = this.determineHeight(node.rightChildIdentifier, currentLevel + 1);
    return Math.max(leftHeight, rightHeight);
  }

  retrieveNode(identifier) {
    return this.nodeRegistry.get(identifier);
  }

  displayTreeInfo() {
    const outputLines = [];
    for (const [nodeId, nodeData] of this.nodeRegistry.entries()) {
      const currentDepth = this.depthMemo(nodeId);
      const currentHeight = this.determineHeight(nodeId);
      outputLines.push(
        `node: ${nodeData.identifier}: parent = ${nodeData.parentIdentifier}, sibling = ${nodeData.siblingIdentifier}, degree = ${nodeData.nodeDegree}, depth = ${currentDepth}, height = ${currentHeight}, ${nodeData.kind}`
      );
    }
    console.log(outputLines.join('\n'));
  }
}

(function processInput() {
  const inputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
  const dataLines = inputData.split('\n');
  const nodeCount = Number(dataLines.shift());

  const treeInstance = new TreeStructure();

  dataLines.forEach(lineContent => {
    const [idVal, leftVal, rightVal] = lineContent.split(' ').map(Number);
    treeInstance.registerNode(idVal, leftVal, rightVal);
  });

  treeInstance.establishConnections();
  treeInstance.displayTreeInfo();
})();
