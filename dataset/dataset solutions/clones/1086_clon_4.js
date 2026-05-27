function createNodeRecord(identifier, leftChildRef, rightChildRef) {
  return {
    identifier: identifier,
    parentRef: -1,
    leftChildRef: leftChildRef,
    rightChildRef: rightChildRef,
    siblingRef: -1,
    degreeCount: 0,
    level: 0,
    span: 0
  };
}

function determineNodeType(nodeRecord) {
  if (nodeRecord.parentRef === -1) {
    return 'root';
  }
  if (nodeRecord.leftChildRef === -1 && nodeRecord.rightChildRef === -1) {
    return 'leaf';
  }
  return 'internal node';
}

class TreeStructure {
  constructor() {
    this.nodeRegistry = new Map();
    this.rootIdentifier = -1;
  }

  insertNode(identifier, leftChild, rightChild) {
    const newNode = createNodeRecord(identifier, leftChild, rightChild);
    this.nodeRegistry.set(identifier, newNode);
  }

  establishRelationships() {
    for (const record of this.nodeRegistry.values()) {
      if (record.leftChildRef !== -1) {
        const leftChild = this.nodeRegistry.get(record.leftChildRef);
        if (leftChild) leftChild.parentRef = record.identifier;
      }
      if (record.rightChildRef !== -1) {
        const rightChild = this.nodeRegistry.get(record.rightChildRef);
        if (rightChild) rightChild.parentRef = record.identifier;
      }
    }

    for (const record of this.nodeRegistry.values()) {
      if (record.parentRef === -1) {
        this.rootIdentifier = record.identifier;
      }

      record.degreeCount = (record.leftChildRef !== -1 ? 1 : 0) + (record.rightChildRef !== -1 ? 1 : 0);

      if (record.leftChildRef !== -1) {
        const leftChild = this.nodeRegistry.get(record.leftChildRef);
        if (leftChild) leftChild.siblingRef = record.rightChildRef;
      }
      if (record.rightChildRef !== -1) {
        const rightChild = this.nodeRegistry.get(record.rightChildRef);
        if (rightChild) rightChild.siblingRef = record.leftChildRef;
      }
    }
  }

  computeAllMetrics() {
    if (this.rootIdentifier === -1 && this.nodeRegistry.size > 0) {
        if (this.nodeRegistry.size === 1) {
            this.rootIdentifier = this.nodeRegistry.keys().next().value;
        } else {
            for (const [id, node] of this.nodeRegistry.entries()) {
                if (node.parentRef === -1) {
                    this.rootIdentifier = id;
                    break;
                }
            }
        }
    }

    if (this.rootIdentifier !== -1) {
      const traversalQueue = [{ id: this.rootIdentifier, currentLevel: 0 }];
      const visitedNodes = new Set();

      while (traversalQueue.length > 0) {
        const { id, currentLevel } = traversalQueue.shift();
        if (visitedNodes.has(id)) continue;
        visitedNodes.add(id);

        const node = this.nodeRegistry.get(id);
        if (node) {
          node.level = currentLevel;

          if (node.leftChildRef !== -1) {
            traversalQueue.push({ id: node.leftChildRef, currentLevel: currentLevel + 1 });
          }
          if (node.rightChildRef !== -1) {
            traversalQueue.push({ id: node.rightChildRef, currentLevel: currentLevel + 1 });
          }
        }
      }
    }

    const calculateNodeSpan = (nodeId) => {
      if (nodeId === -1) {
        return -1;
      }
      const node = this.nodeRegistry.get(nodeId);
      if (!node) {
        return -1;
      }

      if (node.leftChildRef === -1 && node.rightChildRef === -1) {
          node.span = 0;
          return 0;
      }
      if (node.span !== 0) {
          return node.span;
      }

      const leftSubtreeSpan = calculateNodeSpan(node.leftChildRef);
      const rightSubtreeSpan = calculateNodeSpan(node.rightChildRef);

      node.span = 1 + Math.max(leftSubtreeSpan, rightSubtreeSpan);
      return node.span;
    };

    for (const record of this.nodeRegistry.values()) {
        calculateNodeSpan(record.identifier);
    }
  }

  retrieveNodeRecord(identifier) {
    return this.nodeRegistry.get(identifier);
  }

  displayStructureDetails() {
    const outputLines = [];
    const sortedIdentifiers = Array.from(this.nodeRegistry.keys()).sort((a, b) => a - b);

    for (const identifier of sortedIdentifiers) {
      const record = this.nodeRegistry.get(identifier);
      if (record) {
        const nodeType = determineNodeType(record);
        outputLines.push(
          `node: ${record.identifier}: parent = ${record.parentRef}, sibling = ${record.siblingRef}, degree = ${record.degreeCount}, depth = ${record.level}, height = ${record.span}, ${nodeType}`
        );
      }
    }
    console.log(outputLines.join('\n'));
  }
}

(function processInputData() {
  const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
  const contentLines = fileContent.split('\n');
  const totalNodes = Number(contentLines.shift());

  const treeStructure = new TreeStructure();

  for (const lineEntry of contentLines) {
    const [nodeId, leftChildId, rightChildId] = lineEntry.split(' ').map(Number);
    treeStructure.insertNode(nodeId, leftChildId, rightChildId);
  }

  treeStructure.establishRelationships();
  treeStructure.computeAllMetrics();
  treeStructure.displayStructureDetails();
})();
