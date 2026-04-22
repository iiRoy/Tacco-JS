const systemInput = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const collectedInputLines = [];
systemInput.on('line', (dataLine) => {
    collectedInputLines.push(dataLine);
});

systemInput.on('close', () => {
    processInputData(collectedInputLines);
});

class ConnectivityManager {
    #parentMap;
    #groupSize;

    constructor(totalElements) {
        this.#parentMap = new Map();
        this.#groupSize = new Map();
        for (let k = 0; k < totalElements; ++k) {
            this.#parentMap.set(k, k);
            this.#groupSize.set(k, 1);
        }
    }

    findRepresentative(elementKey) {
        let current = elementKey;
        const path = [];
        while (this.#parentMap.get(current) !== current) {
            path.push(current);
            current = this.#parentMap.get(current);
        }
        for (const p of path) {
            this.#parentMap.set(p, current);
        }
        return current;
    }

    uniteGroups(elementOne, elementTwo) {
        const rootOne = this.findRepresentative(elementOne);
        const rootTwo = this.findRepresentative(elementTwo);

        if (rootOne === rootTwo) {
            return false;
        }

        const sizeOne = this.#groupSize.get(rootOne);
        const sizeTwo = this.#groupSize.get(rootTwo);

        if (sizeOne < sizeTwo) {
            this.#parentMap.set(rootOne, rootTwo);
            this.#groupSize.set(rootTwo, sizeOne + sizeTwo);
        } else {
            this.#parentMap.set(rootTwo, rootOne);
            this.#groupSize.set(rootOne, sizeOne + sizeTwo);
        }
        return true;
    }

    areSameGroup(elementOne, elementTwo) {
        return this.findRepresentative(elementOne) === this.findRepresentative(elementTwo);
    }

    countDistinctGroups() {
        const uniqueRoots = new Set();
        for (const [element, parent] of this.#parentMap.entries()) {
            if (element === parent) {
                uniqueRoots.add(element);
            }
        }
        return uniqueRoots.size;
    }
}

function processInputData(allLines) {
    let currentLineIndex = 0;

    function retrieveNextLine() {
        return allLines[currentLineIndex++];
    }

    while (true) {
        const dimensions = retrieveNextLine().split(' ').map(Number);
        const vertexQuantity = dimensions[0];
        const edgeQuantity = dimensions[1];

        if (vertexQuantity === 0 && edgeQuantity === 0) {
            break;
        }

        // The original code reads node 'days' data but effectively only uses it
        // to progressively mark all nodes as 'used' by the final iteration.
        // In the final iteration, all nodes are 'used', and the 'res' and 'uf'
        // are reset, leading to a standard Kruskal's on the entire graph.
        // If the entire graph is not connected, the result is 0.
        for (let v = 0; v < vertexQuantity; ++v) {
            retrieveNextLine(); // Discarding node 'days' as they don't affect the final outcome
        }

        const connectionStructures = []; // Represents edges as objects
        for (let e = 0; e < edgeQuantity; ++e) {
            const linkDetails = retrieveNextLine().split(' ').map(Number);
            connectionStructures.push({
                first: linkDetails[0] - 1, // Convert to 0-indexed
                second: linkDetails[1] - 1, // Convert to 0-indexed
                weight: linkDetails[2]
            });
        }

        // Sort edges by weight in ascending order for Kruskal's algorithm
        connectionStructures.sort((linkA, linkB) => linkA.weight - linkB.weight);

        const groupManager = new ConnectivityManager(vertexQuantity);
        let totalSpanningCost = 0;

        // Apply Kruskal's algorithm
        for (const link of connectionStructures) {
            if (groupManager.uniteGroups(link.first, link.second)) {
                totalSpanningCost += link.weight;
            }
        }

        // Check if all vertices form a single connected component
        // This mirrors the original's final `uf.count(use) > 1` check when all nodes are 'used'
        if (groupManager.countDistinctGroups() > 1) {
            console.log(0);
        } else {
            console.log(totalSpanningCost);
        }
    }
}