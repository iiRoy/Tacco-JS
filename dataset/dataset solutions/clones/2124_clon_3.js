function processInputData(rawData) {
    const parseLineNumbers = (lineString) => lineString.split(" ").map(val => parseInt(val, 10));

    const firstLineData = parseLineNumbers(rawData[0]);
    const nodeCount = firstLineData[0];
    const friendshipCount = firstLineData[1];
    const blockCount = firstLineData[2];
    
    const disjointSet = new DisjointSet(nodeCount);
    
    const connectionStatusMap = {};

    const markAsNotPotentialFriend = (firstNode, secondNode) => {
        if (!connectionStatusMap[firstNode]) {
            connectionStatusMap[firstNode] = {};
        }
        if (!connectionStatusMap[secondNode]) {
            connectionStatusMap[secondNode] = {};
        }
        connectionStatusMap[firstNode][secondNode] = false;
        connectionStatusMap[secondNode][firstNode] = false;
    };

    for (let i = 0; i < friendshipCount; i++) {
        const currentFriendshipLine = rawData[i + 1];
        const [nodeA, nodeB] = parseLineNumbers(currentFriendshipLine).map(n => n - 1);
        
        disjointSet.uniteSets(nodeA, nodeB);
        markAsNotPotentialFriend(nodeA, nodeB);
    }

    const blockConnectionsStartIdx = friendshipCount + 1;
    for (let i = 0; i < blockCount; i++) {
        const currentBlockLine = rawData[blockConnectionsStartIdx + i];
        const [nodeA, nodeB] = parseLineNumbers(currentBlockLine).map(n => n - 1);
        
        markAsNotPotentialFriend(nodeA, nodeB);
    }

    const componentMembers = {};
    const nodeComponentMap = {};

    for (let i = 0; i < nodeCount; i++) {
        const rootNode = disjointSet.findSet(i);
        
        if (!componentMembers[rootNode]) {
            componentMembers[rootNode] = {};
        }
        componentMembers[rootNode][i] = true;
        nodeComponentMap[i] = componentMembers[rootNode];

        markAsNotPotentialFriend(i, i);
    }
    
    const potentialFriendCounts = new Array(nodeCount).fill(0);

    for (let i = 0; i < nodeCount; i++) {
        const currentNodesComponent = nodeComponentMap[i];
        
        if (!currentNodesComponent) {
            continue; 
        }

        const componentMemberKeys = Object.keys(currentNodesComponent);
        for (let j = 0; j < componentMemberKeys.length; j++) {
            const otherNodeInComponent = parseInt(componentMemberKeys[j], 10);

            const isDirectlyConnectedOrBlocked = connectionStatusMap[i] && connectionStatusMap[i][otherNodeInComponent] === false;
            
            if (!isDirectlyConnectedOrBlocked) {
                potentialFriendCounts[i]++;
            }
        }
    }
    
    console.log(potentialFriendCounts.join(" "));
}

function DisjointSet(initialSize) {
  this.parentNodes = Array.from({ length: initialSize }, (_, i) => i);
  this.treeRanks = new Array(initialSize).fill(0);
}

const dsPrototype = DisjointSet.prototype;

Object.defineProperty(dsPrototype, "size", {
  "get": function() {
    return this.parentNodes.length;
  }
});

dsPrototype.addElement = function() {
  const newElementIndex = this.parentNodes.length;
  this.parentNodes.push(newElementIndex);
  this.treeRanks.push(0);
  return newElementIndex;
};

dsPrototype.findSet = function(elementX) {
  let originalElementX = elementX;
  const parents = this.parentNodes;

  while (parents[elementX] !== elementX) {
    elementX = parents[elementX];
  }

  while (parents[originalElementX] !== elementX) {
    const nextParent = parents[originalElementX];
    parents[originalElementX] = elementX;
    originalElementX = nextParent;
  }
  return elementX;
};

dsPrototype.uniteSets = function(elementX, elementY) {
  const rootX = this.findSet(elementX);
  const rootY = this.findSet(elementY);

  if (rootX === rootY) {
    return;
  }

  const ranks = this.treeRanks;
  const parents = this.parentNodes;
  
  const rankX = ranks[rootX];
  const rankY = ranks[rootY];

  if (rankX < rankY) {
    parents[rootX] = rootY;
  } else if (rankY < rankX) {
    parents[rootY] = rootX;
  } else {
    parents[rootY] = rootX;
    ranks[rootX]++;
  }
};

const inputData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
processInputData(inputData);
