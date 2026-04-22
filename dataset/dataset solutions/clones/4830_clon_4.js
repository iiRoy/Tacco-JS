class InputSource {
    #lines;
    #idx;

    constructor(dataLines) {
        this.#lines = dataLines;
        this.#idx = 0;
    }

    hasNextLine() {
        return this.#idx < this.#lines.length;
    }

    fetchNextLine() {
        if (!this.hasNextLine()) {
            throw new Error("No further input available.");
        }
        return this.#lines[this.#idx++];
    }

    retrieveNumericArray() {
        return this.fetchNextLine().split(' ').map(Number);
    }
}

class DisjointSetSystem {
    #elements; 

    constructor(elementCount) {
        this.#elements = new Map();
        for (let i = 0; i < elementCount; ++i) {
            this.#elements.set(i, { parent: i, size: 1 });
        }
    }

    findRepresentative(elementId) {
        let node = this.#elements.get(elementId);
        if (node.parent === elementId) {
            return elementId;
        }
        node.parent = this.findRepresentative(node.parent);
        return node.parent;
    }

    uniteSets(elementA, elementB) {
        let rootA = this.findRepresentative(elementA);
        let rootB = this.findRepresentative(elementB);

        if (rootA !== rootB) {
            let nodeA = this.#elements.get(rootA);
            let nodeB = this.#elements.get(rootB);

            if (nodeA.size < nodeB.size) {
                [rootA, rootB] = [rootB, rootA];
                [nodeA, nodeB] = [nodeB, nodeA];
            }
            
            nodeB.parent = rootA;
            nodeA.size += nodeB.size;
        }
    }

    checkConnection(elementA, elementB) {
        return this.findRepresentative(elementA) === this.findRepresentative(elementB);
    }
}

let collectedInputLines = [];

const terminalInterface = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

terminalInterface.on('line', (lineContent) => {
    collectedInputLines.push(lineContent);
});

terminalInterface.on('close', () => {
    const dataProcessor = new InputSource(collectedInputLines);
    ProcessGraphConnections(dataProcessor);
});

function presentOutput(data) {
    console.log(data.join(' '));
}

function ProcessGraphConnections(inputReader) {
    const [nodeCount, kRoadCount, lRoadCount] = inputReader.retrieveNumericArray();

    const kDisjointSets = new DisjointSetSystem(nodeCount);
    const lDisjointSets = new DisjointSetSystem(nodeCount);

    const kRoads = Array.from({ length: kRoadCount }, () => {
        const [p1, p2] = inputReader.retrieveNumericArray();
        const u = p1 - 1;
        const v = p2 - 1;
        kDisjointSets.uniteSets(u, v);
        return [Math.min(u, v), Math.max(u, v)];
    });

    const lRoads = Array.from({ length: lRoadCount }, () => {
        const [p1, p2] = inputReader.retrieveNumericArray();
        const u = p1 - 1;
        const v = p2 - 1;
        lDisjointSets.uniteSets(u, v);
        return [Math.min(u, v), Math.max(u, v)];
    });

    const kRoadIncrements = kRoads.flatMap(([u, v]) => 
        lDisjointSets.checkConnection(u, v) ? [{ node: u, value: 1 }, { node: v, value: 1 }] : []
    );

    const existingKRelations = new Set(kRoads.map(([u, v]) => `${u}:${v}`));

    const lRoadIncrements = lRoads.flatMap(([u, v]) => {
        if (!existingKRelations.has(`${u}:${v}`)) {
            return kDisjointSets.checkConnection(u, v) ? [{ node: u, value: 1 }, { node: v, value: 1 }] : [];
        }
        return [];
    });

    const allIncrements = [...kRoadIncrements, ...lRoadIncrements];

    const finalConnectionCounts = allIncrements.reduce((currentCounts, { node, value }) => {
        currentCounts[node] += value;
        return currentCounts;
    }, Array(nodeCount).fill(1));

    presentOutput(finalConnectionCounts);
}