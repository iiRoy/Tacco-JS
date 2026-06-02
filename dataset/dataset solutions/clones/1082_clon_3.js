class TreeNode {
  constructor(nodeIdentifier, parentNodeRef, childNodeList = []) {
    this.nodeIdentifier = nodeIdentifier;
    this.parentNodeRef = parentNodeRef;
    this.childNodeList = childNodeList;
  }

  get nodeType() {
    const parentReference = this.parentNodeRef;
    const numberOfChildren = this.childNodeList.length;

    if (parentReference === null) {
      return 'root';
    } else if (numberOfChildren === 0) {
      return 'leaf';
    } else {
      return 'internal node';
    }
  }

  get nodeDepth() {
    let currentDepthValue = 0;
    let traversalNode = this;
    while (traversalNode.parentNodeRef !== null) {
      currentDepthValue++;
      traversalNode = traversalNode.parentNodeRef;
    }
    return currentDepthValue;
  }

  formatNodeDetails() {
    const parentIdValue = this.parentNodeRef !== null ? this.parentNodeRef.nodeIdentifier : -1;
    const childIdentifiersString = this.childNodeList.map(cn => cn.nodeIdentifier).join(', ');
    return `node ${this.nodeIdentifier}: parent = ${parentIdValue}, depth = ${this.nodeDepth}, ${this.nodeType}, [${childIdentifiersString}]`;
  }
}

class GraphStructure {
  constructor(initialCapacityHint) {
    this.nodeRegistry = [];
    // initialCapacityHint is not directly used for pre-allocation due to sparse array usage
  }

  registerChildren(parentIdentifier, directChildIdentifiers) {
    const parentNodeInstance = this.retrieveOrCreateNode(parentIdentifier);
    for (const currentChildId of directChildIdentifiers) {
      const childNodeInstance = this.retrieveOrCreateNode(currentChildId);
      childNodeInstance.parentNodeRef = parentNodeInstance;
      parentNodeInstance.childNodeList.push(childNodeInstance);
    }
  }

  retrieveOrCreateNode(identifier) {
    if (!this.nodeRegistry[identifier]) {
      this.nodeRegistry[identifier] = new TreeNode(identifier, null, []);
    }
    return this.nodeRegistry[identifier];
  }

  displayStructure() {
    const existingNodes = this.nodeRegistry.filter(Boolean);
    const sortedNodes = existingNodes.sort((a, b) => a.nodeIdentifier - b.nodeIdentifier);
    const formattedOutputLines = sortedNodes.map(node => node.formatNodeDetails());
    console.log(formattedOutputLines.join('\n'));
  }
}

(function executeTreeProcessing() {
  const fileSystemModule = require('fs');
  const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
  const trimmedContent = rawInputContent.trim();
  const inputLines = trimmedContent.split('\n');

  const totalNodesCount = Number(inputLines.shift());
  let graphInstance = new GraphStructure(totalNodesCount);

  for (const currentLineData of inputLines) {
    const parsedLineSegments = currentLineData.split(' ');
    const parentNodeId = Number(parsedLineSegments.shift());
    const childCount = Number(parsedLineSegments.shift()); // This variable is read but not used in logic
    const directChildIdentifiers = parsedLineSegments.map(Number);

    graphInstance.registerChildren(parentNodeId, directChildIdentifiers);
  }
  graphInstance.displayStructure();
})();
