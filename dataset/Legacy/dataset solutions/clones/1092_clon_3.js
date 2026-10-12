class TreeStructureManager {
  constructor(totalNodeCount) {
    this.nodeRegistry = Array.from({ length: totalNodeCount }, () => ({
      id: -1,
      parentId: -1,
      leftId: -1,
      rightId: -1
    }));
  }

  get getPrimaryRoot() {
    for (const record of this.nodeRegistry) {
      if (record.parentId === -1) {
        return record;
      }
    }
    return undefined;
  }

  locateNode(nodeIdentifier) {
    const foundRecord = this.nodeRegistry[nodeIdentifier];
    return foundRecord || {};
  }

  registerNode(nodeId, leftChildId, rightChildId) {
    const targetNode = this.nodeRegistry[nodeId];
    targetNode.id = nodeId;
    targetNode.leftId = leftChildId;
    targetNode.rightId = rightChildId;

    const updateChildParentReference = (childIdentifier, currentParentIdentifier) => {
      if (childIdentifier !== -1) {
        this.locateNode(childIdentifier).parentId = currentParentIdentifier;
      }
    };

    updateChildParentReference(leftChildId, nodeId);
    updateChildParentReference(rightChildId, nodeId);
  }

  _printNodeIdentifier(identifier) {
    process.stdout.write(` ${identifier}`);
  }

  performPreorderTraversal(currentIdentifier = this.getPrimaryRoot.id) {
    if (currentIdentifier === -1) {
      return;
    }
    const currentRecord = this.locateNode(currentIdentifier);
    this._printNodeIdentifier(currentIdentifier);
    this.performPreorderTraversal(currentRecord.leftId);
    this.performPreorderTraversal(currentRecord.rightId);
  }

  performInorderTraversal(currentIdentifier = this.getPrimaryRoot.id) {
    if (currentIdentifier === -1) {
      return;
    }
    const currentRecord = this.locateNode(currentIdentifier);
    this.performInorderTraversal(currentRecord.leftId);
    this._printNodeIdentifier(currentIdentifier);
    this.performInorderTraversal(currentRecord.rightId);
  }

  performPostorderTraversal(currentIdentifier = this.getPrimaryRoot.id) {
    if (currentIdentifier === -1) {
      return;
    }
    const currentRecord = this.locateNode(currentIdentifier);
    this.performPostorderTraversal(currentRecord.leftId);
    this.performPostorderTraversal(currentRecord.rightId);
    this._printNodeIdentifier(currentIdentifier);
  }
}

(function executeApplicationLogic() {
  const fileSystemModule = require('fs');
  const standardInputPath = '/dev/stdin';
  const fileContentBuffer = fileSystemModule.readFileSync(standardInputPath, 'utf8');
  const trimmedContent = fileContentBuffer.trim();
  const rawInputLines = trimmedContent.split('\n');

  const nodeCountString = rawInputLines.shift();
  const totalNodeCount = Number(nodeCountString);

  let managedTree = new TreeStructureManager(totalNodeCount);

  for (const singleLine of rawInputLines) {
    const parsedNodeDetails = singleLine.split(' ').map(Number);
    managedTree.registerNode(...parsedNodeDetails);
  }

  const outputTraversalResults = (headerMessage, traversalMethod) => {
    console.log(headerMessage);
    traversalMethod.call(managedTree);
  };

  outputTraversalResults('Preorder', managedTree.performPreorderTraversal);
  outputTraversalResults('\nInorder', managedTree.performInorderTraversal);
  outputTraversalResults('\nPostorder', managedTree.performPostorderTraversal);
  console.log();
})();
