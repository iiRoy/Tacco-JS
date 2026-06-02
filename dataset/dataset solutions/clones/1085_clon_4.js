function createMemoizer(funcToMemoize) {
  const resultCache = new Map();
  return (...inputArgs) => {
    const key = inputArgs[0];
    if (resultCache.has(key)) {
      return resultCache.get(key);
    }
    const computedResult = funcToMemoize(...inputArgs);
    resultCache.set(key, computedResult);
    return computedResult;
  };
}

function makeTreeNode(identifier, parentRef, leftRef, rightRef) {
  return {
    identifier: identifier,
    parentRef: parentRef,
    leftRef: leftRef,
    rightRef: rightRef,
  };
}

function determineNodeType(nodeObj, parentIdVal, leftIdVal, rightIdVal) {
  if (parentIdVal === -1) return 'root';
  if (leftIdVal === -1 && rightIdVal === -1) return 'leaf';
  return 'internal node';
}

class TreeStructure {
  constructor() {
    this.nodeRegistry = new Map();
    this.auxiliaryData = new Map();

    this.calculateNodeDepth = createMemoizer(this.computeDepthIterative.bind(this));
    this.determineNodeHeight = createMemoizer(this.computeHeightRecursive.bind(this));
  }

  static createNode(id, parentId, leftId, rightId) {
    return makeTreeNode(id, parentId, leftId, rightId);
  }

  insertNode(nodeIdentifier, leftChildId, rightChildId) {
    this.nodeRegistry.set(nodeIdentifier, TreeStructure.createNode(nodeIdentifier, -1, leftChildId, rightChildId));
  }

  establishConnections() {
    for (const nodeIdentifier of this.nodeRegistry.keys()) {
      this.auxiliaryData.set(nodeIdentifier, { siblingId: -1, degreeCount: 0 });
    }

    for (const node of this.nodeRegistry.values()) {
      if (node.leftRef !== -1) {
        const leftChild = this.nodeRegistry.get(node.leftRef);
        if (leftChild) {
          leftChild.parentRef = node.identifier;
          const aux = this.auxiliaryData.get(node.leftRef);
          if (aux) aux.siblingId = node.rightRef;
        }
      }
      if (node.rightRef !== -1) {
        const rightChild = this.nodeRegistry.get(node.rightRef);
        if (rightChild) {
          rightChild.parentRef = node.identifier;
          const aux = this.auxiliaryData.get(node.rightRef);
          if (aux) aux.siblingId = node.leftRef;
        }
      }
    }

    for (const node of this.nodeRegistry.values()) {
      const aux = this.auxiliaryData.get(node.identifier);
      if (aux) {
        aux.degreeCount = (node.leftRef !== -1 ? 1 : 0) + (node.rightRef !== -1 ? 1 : 0);
      }
    }
  }

  computeDepthIterative(nodeIdentifier) {
    let currentDepth = 0;
    let currentNode = this.nodeRegistry.get(nodeIdentifier);
    if (!currentNode) return -1;

    while (currentNode.parentRef !== -1) {
      currentDepth++;
      currentNode = this.nodeRegistry.get(currentNode.parentRef);
    }
    return currentDepth;
  }

  computeHeightRecursive(nodeIdentifier, currentLevel = 0) {
    if (nodeIdentifier === -1) {
      return currentLevel - 1;
    }
    const currentNode = this.nodeRegistry.get(nodeIdentifier);
    if (!currentNode) return currentLevel - 1;

    const leftSubtreeHeight = this.determineNodeHeight(currentNode.leftRef, currentLevel + 1);
    const rightSubtreeHeight = this.determineNodeHeight(currentNode.rightRef, currentLevel + 1);

    return Math.max(leftSubtreeHeight, rightSubtreeHeight);
  }

  retrieveNode(nodeIdentifier) {
    return this.nodeRegistry.get(nodeIdentifier);
  }

  displayTreeInfo() {
    const outputLines = [];
    const sortedNodeIdentifiers = Array.from(this.nodeRegistry.keys()).sort((a, b) => a - b);

    for (const identifier of sortedNodeIdentifiers) {
      const node = this.nodeRegistry.get(identifier);
      const aux = this.auxiliaryData.get(identifier);

      const parentId = node.parentRef;
      const siblingId = aux ? aux.siblingId : -1;
      const degree = aux ? aux.degreeCount : 0;

      const depth = this.calculateNodeDepth(identifier);
      const height = this.determineNodeHeight(identifier);
      const nodeType = determineNodeType(node, parentId, node.leftRef, node.rightRef);

      outputLines.push(
        `node ${identifier}: parent = ${parentId}, sibling = ${siblingId}, degree = ${degree}, depth = ${depth}, height = ${height}, ${nodeType}`
      );
    }
    console.log(outputLines.join('\n'));
  }
}

(function executeMainLogic(){
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const totalNodes = Number(inputLines.shift());

  let treeInstance = new TreeStructure();

  inputLines.map(lineContent => lineContent.split(' ').map(Number)).forEach(function(numericParts) {
    treeInstance.insertNode(...numericParts);
  });
  treeInstance.establishConnections();
  treeInstance.displayTreeInfo();
})();
