function parseNodeIndex(strValue) {
    return parseInt(strValue, 10) - 1;
}

function ensureObjectProperty(obj, key) {
    if (!obj[key]) {
        obj[key] = {};
    }
    return obj[key];
}

function ProcessInput(rawData) {
    const initialParams = rawData[0].split(" ");
    const nodeCount = parseInt(initialParams[0], 10);
    const edgeCount = parseInt(initialParams[1], 10);
    const blockCount = parseInt(initialParams[2], 10);

    const disjointSet = new DisjointSet(nodeCount);
    const connectionExclusions = {};

    for (let idx = 0; idx < edgeCount; idx++) {
        const edgeData = rawData[idx + 1].split(" ");
        const nodeA = parseNodeIndex(edgeData[0]);
        const nodeB = parseNodeIndex(edgeData[1]);

        disjointSet.unite(nodeA, nodeB);

        ensureObjectProperty(connectionExclusions, nodeA)[nodeB] = false;
        ensureObjectProperty(connectionExclusions, nodeB)[nodeA] = false;
    }

    for (let idx = 0; idx < blockCount; idx++) {
        const blockData = rawData[idx + edgeCount + 1].split(" ");
        const nodeA = parseNodeIndex(blockData[0]);
        const nodeB = parseNodeIndex(blockData[1]);

        ensureObjectProperty(connectionExclusions, nodeA)[nodeB] = false;
        ensureObjectProperty(connectionExclusions, nodeB)[nodeA] = false;
    }

    const componentMembers = {};
    const nodeComponentMap = {};

    for (let idx = 0; idx < nodeCount; idx++) {
        const representativeNode = disjointSet.findSet(idx);
        ensureObjectProperty(componentMembers, representativeNode)[idx] = true;
        nodeComponentMap[idx] = componentMembers[representativeNode];
        
        ensureObjectProperty(connectionExclusions, idx)[idx] = false;
    }
    
    const finalCounts = new Array(nodeCount);

    for (let idx = 0; idx < nodeCount; idx++) {
        let potentialFriendsCount = 0;
        const currentComponentMembers = nodeComponentMap[idx];
        const currentExclusions = connectionExclusions[idx] || {};

        for (const memberNodeStr in currentComponentMembers) {
            const memberNode = parseInt(memberNodeStr, 10);
            if (currentComponentMembers[memberNodeStr] && currentExclusions[memberNode] !== false) {
                potentialFriendsCount++;
            }
        }
        finalCounts[idx] = potentialFriendsCount;
    }
    console.log(finalCounts.join(" "));
}

function DisjointSet(initialCapacity) {
    this.parentNodes = new Array(initialCapacity);
    this.treeRanks = new Array(initialCapacity);

    for (let idx = 0; idx < initialCapacity; ++idx) {
        this.parentNodes[idx] = idx;
        this.treeRanks[idx] = 0;
    }
}

const dsPrototype = DisjointSet.prototype;

Object.defineProperty(dsPrototype, "size", {
    "get": function() {
        return this.parentNodes.length;
    }
});

dsPrototype.addSet = function() {
    const currentSize = this.parentNodes.length;
    this.parentNodes.push(currentSize);
    this.treeRanks.push(0);
    return currentSize;
};

dsPrototype.findSet = function(elementX) {
    let currentNode = elementX;
    const parents = this.parentNodes;

    while (parents[currentNode] !== currentNode) {
        currentNode = parents[currentNode];
    }

    let pathNode = elementX;
    while (parents[pathNode] !== currentNode) {
        const nextNodeInPath = parents[pathNode];
        parents[pathNode] = currentNode;
        pathNode = nextNodeInPath;
    }
    return currentNode;
};

dsPrototype.unite = function(elementX, elementY) {
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

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
