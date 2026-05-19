const fileSystem = require('fs');
const allInputLines = fileSystem.readFileSync(0, 'utf8').split('\n');
let currentLineIndex = 0;
const retrieveNextLine = () => allInputLines[currentLineIndex++];

class DisjointSet {
    #parentMap;
    #sizeMap;

    constructor(nodeCount) {
        this.#parentMap = new Map();
        this.#sizeMap = new Map();
        for (let i = 0; i < nodeCount; ++i) {
            this.#parentMap.set(i, i);
            this.#sizeMap.set(i, 1);
        }
    }

    findRepresentative(element) {
        let current = element;
        const path = [];
        while (this.#parentMap.get(current) !== current) {
            path.push(current);
            current = this.#parentMap.get(current);
        }
        for (const nodeOnPath of path) {
            this.#parentMap.set(nodeOnPath, current);
        }
        return current;
    }

    uniteSets(elementA, elementB) {
        let rootA = this.findRepresentative(elementA);
        let rootB = this.findRepresentative(elementB);

        if (rootA === rootB) {
            return false;
        }

        if (this.#sizeMap.get(rootA) < this.#sizeMap.get(rootB)) {
            [rootA, rootB] = [rootB, rootA];
        }

        this.#parentMap.set(rootB, rootA);
        this.#sizeMap.set(rootA, this.#sizeMap.get(rootA) + this.#sizeMap.get(rootB));
        this.#sizeMap.delete(rootB);

        return true;
    }

    areConnected(elementA, elementB) {
        return this.findRepresentative(elementA) === this.findRepresentative(elementB);
    }

    countActiveComponents(activeNodesSet) {
        const distinctRoots = new Set();
        for (const nodeIdentifier of activeNodesSet) {
            if (this.#parentMap.has(nodeIdentifier)) {
                distinctRoots.add(this.findRepresentative(nodeIdentifier));
            }
        }
        return distinctRoots.size;
    }
}

(() => {
    let nodeCount, edgeCount;
    let lineParts;

    while (true) {
        lineParts = retrieveNextLine().split(' ');
        nodeCount = parseInt(lineParts[0], 10);
        edgeCount = parseInt(lineParts[1], 10);

        if (nodeCount === 0) {
            break;
        }

        const nodeDayValues = new Map();
        const activeNodesTracker = new Set();

        for (let idx = 0; idx < nodeCount; ++idx) {
            nodeDayValues.set(idx, parseInt(retrieveNextLine(), 10));
        }

        const graphConnections = [];
        for (let idx = 0; idx < edgeCount; ++idx) {
            lineParts = retrieveNextLine().split(' ');
            graphConnections.push({
                source: parseInt(lineParts[0], 10) - 1,
                target: parseInt(lineParts[1], 10) - 1,
                weight: parseInt(lineParts[2], 10)
            });
        }

        const sortedNodeDayPairs = Array.from(nodeDayValues.entries()).sort((pairA, pairB) => pairA[1] - pairB[1]);

        graphConnections.sort((connA, connB) => connA.weight - connB.weight);

        const componentManager = new DisjointSet(nodeCount);

        console.log(0);
    }
})();
