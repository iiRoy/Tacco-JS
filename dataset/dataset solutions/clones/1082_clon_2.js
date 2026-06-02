class TreeNode {
  constructor(identifier, parentNode, childNodes) {
    this.identifier = identifier;
    this.parentNode = parentNode;
    this.childNodes = childNodes;
  }

  get nodeType() {
    if (this.parentNode === null) return 'root';
    if (this.childNodes.length === 0) return 'leaf';
    return 'internal node';
  }

  get depthLevel() {
    const calculateNodeDepth = (currentNode, currentDepth) => {
      return currentNode.parentNode === null ? currentDepth : calculateNodeDepth(currentNode.parentNode, currentDepth + 1);
    };
    return calculateNodeDepth(this, 0);
  }

  toDisplayString() {
    return `node ${this.identifier}: parent = ${this.parentNode !== null ? this.parentNode.identifier : -1}, depth = ${this.depthLevel}, ${this.nodeType}, [${this.childNodes.map(child => child.identifier).join(', ')}]`;
  }
}

class Forest {
  constructor(nodeCount) {
    this.allNodes = [];
  }

  addChildRelations(parentId, childIdentifiers) {
    let parentNodeRef = this.locateNode(parentId);
    childIdentifiers.forEach((childId) => {
      let childNodeRef = this.locateNode(childId);
      childNodeRef.parentNode = parentNodeRef;
      childNodeRef.identifier = childId;
      parentNodeRef.childNodes.push(childNodeRef);
    });
  }

  locateNode(nodeId) { return this.allNodes[nodeId] || (this.allNodes[nodeId] = new TreeNode(nodeId, null, []));}

  displayNodes() {
    console.log(this.allNodes.sort((nodeA, nodeB) => nodeA.identifier - nodeB.identifier).map(singleNode => singleNode.toDisplayString()).join('\n'));
  }
}

(function executeMainLogic() {
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const totalNodes = Number(inputLines.shift());
  let nodeForest = new Forest(totalNodes);
  let currentId, childCount, currentChildrenIds;
  inputLines.map(lineContent => lineContent.split(' ')).forEach(function(parsedLineData) {
    currentId = Number(parsedLineData.shift());
    childCount = Number(parsedLineData.shift());
    currentChildrenIds = parsedLineData.map(Number);
    nodeForest.addChildRelations(currentId, currentChildrenIds);
  });
  nodeForest.displayNodes();
})();
