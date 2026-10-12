class DisjointSet {
    constructor(nodeCount) {
        this.parents = Array.from({ length: nodeCount }, (_, index) => index);
        this.componentSizes = Array.from({ length: nodeCount }, () => 1);
    }

    find(nodeIndex) {
        let current = nodeIndex;
        const pathNodes = [];
        while (this.parents[current] !== current) {
            pathNodes.push(current);
            current = this.parents[current];
        }
        for (const pathNode of pathNodes) {
            this.parents[pathNode] = current;
        }
        return current;
    }

    unite(firstIndex, secondIndex) {
        let rootA = this.find(firstIndex);
        let rootB = this.find(secondIndex);

        if (rootA === rootB) {
            return false;
        }

        if (this.componentSizes[rootA] < this.componentSizes[rootB]) {
            [rootA, rootB] = [rootB, rootA];
        }

        this.parents[rootB] = rootA;
        this.componentSizes[rootA] += this.componentSizes[rootB];
        return true;
    }

    getComponentSize(nodeIndex) {
        return this.componentSizes[this.find(nodeIndex)];
    }

    areConnected(firstIndex, secondIndex) {
        return this.find(firstIndex) === this.find(secondIndex);
    }
}

function processInputAndCalculate(rawInput) {
    const inputLines = rawInput.split('\n');
    const [nodeCount, edgeCount] = inputLines[0].split(' ').map(Number);

    const bridgeConnections = [];
    for (let k = 1; k <= edgeCount; k++) {
        bridgeConnections.push(inputLines[k].split(' ').map(Number));
    }

    const reversedBridgeOrder = bridgeConnections.reverse();

    const islandManager = new DisjointSet(nodeCount);

    let currentInconvenience = (nodeCount * (nodeCount - 1)) / 2;
    const temporaryResults = [];
    temporaryResults.push(currentInconvenience);

    for (const currentBridge of reversedBridgeOrder) {
        const [u, v] = [currentBridge[0] - 1, currentBridge[1] - 1];

        if (!islandManager.areConnected(u, v)) {
            const sizeU = islandManager.getComponentSize(u);
            const sizeV = islandManager.getComponentSize(v);
            currentInconvenience -= (sizeU * sizeV);
            islandManager.unite(u, v);
        } else {
            islandManager.unite(u, v);
        }
        temporaryResults.push(currentInconvenience);
    }

    const finalOutputValues = temporaryResults.reverse();

    for (let i = 1; i <= edgeCount; i++) {
        console.log(finalOutputValues[i]);
    }
}

processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8'));
