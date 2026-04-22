function ExecuteProgram() {
  const firstLineData = nextIntArray();
  const totalNodes = firstLineData[0];
  const directFriendCount = firstLineData[1];
  const directFoeCount = firstLineData[2];

  const graphComponents = createComponentStructure(totalNodes);
  
  const nodeRelationshipStore = new Map();
  for (let currentElement = 0; currentElement < totalNodes; currentElement++) {
    nodeRelationshipStore.set(currentElement, {
      positiveLinks: new Set(),
      negativeLinks: new Set()
    });
  }

  Array.from({ length: directFriendCount }).forEach(() => {
    const edgeInfo = nextIntArray();
    const nodeA = edgeInfo[0] - 1;
    const nodeB = edgeInfo[1] - 1;
    
    graphComponents.mergeGroups(nodeA, nodeB);
    nodeRelationshipStore.get(nodeA).positiveLinks.add(nodeB);
    nodeRelationshipStore.get(nodeB).positiveLinks.add(nodeA);
  });

  Array.from({ length: directFoeCount }).forEach(() => {
    const edgeInfo = nextIntArray();
    const nodeA = edgeInfo[0] - 1;
    const nodeB = edgeInfo[1] - 1;
    
    nodeRelationshipStore.get(nodeA).negativeLinks.add(nodeB);
    nodeRelationshipStore.get(nodeB).negativeLinks.add(nodeA);
  });

  const finalCounts = Array.from({ length: totalNodes }, (_, currentElement) => {
    let potentialFriends = graphComponents.getGroupSize(currentElement);
    
    potentialFriends--; // Subtract self

    potentialFriends -= nodeRelationshipStore.get(currentElement).positiveLinks.size;

    nodeRelationshipStore.get(currentElement).negativeLinks.forEach(foeNode => {
      if (graphComponents.shareCommonGroup(currentElement, foeNode)) {
        potentialFriends--;
      }
    });
    return potentialFriends;
  });
  
  myout(myconv(finalCounts, 8));
}

function createComponentStructure(countOfNodes) {
  const nodeToGroupMap = new Map();
  const groupSizeMap = new Map();
  
  for (let i = 0; i < countOfNodes; i++) {
    nodeToGroupMap.set(i, i);
    groupSizeMap.set(i, 1);
  }

  const structure = {
    findGroupIdentifier: function(nodeIndex) {
      let currentRoot = nodeIndex;
      while (nodeToGroupMap.get(currentRoot) !== currentRoot) {
        currentRoot = nodeToGroupMap.get(currentRoot);
      }
      let pathNode = nodeIndex;
      while (nodeToGroupMap.get(pathNode) !== currentRoot) {
        const nextNode = nodeToGroupMap.get(pathNode);
        nodeToGroupMap.set(pathNode, currentRoot);
        pathNode = nextNode;
      }
      return currentRoot;
    },

    shareCommonGroup: function(nodeOne, nodeTwo) {
      return this.findGroupIdentifier(nodeOne) === this.findGroupIdentifier(nodeTwo);
    },

    mergeGroups: function(nodeOne, nodeTwo) {
      let rootOne = this.findGroupIdentifier(nodeOne);
      let rootTwo = this.findGroupIdentifier(nodeTwo);

      if (rootOne !== rootTwo) {
        const sizeOne = groupSizeMap.get(rootOne);
        const sizeTwo = groupSizeMap.get(rootTwo);

        if (sizeOne < sizeTwo) {
          nodeToGroupMap.set(rootOne, rootTwo);
          groupSizeMap.set(rootTwo, sizeOne + sizeTwo);
          groupSizeMap.delete(rootOne);
        } else {
          nodeToGroupMap.set(rootTwo, rootOne);
          groupSizeMap.set(rootOne, sizeOne + sizeTwo);
          groupSizeMap.delete(rootTwo);
        }
      }
    },

    getGroupSize: function(nodeIndex) {
      const root = this.findGroupIdentifier(nodeIndex);
      return groupSizeMap.get(root);
    }
  };
  return structure;
}