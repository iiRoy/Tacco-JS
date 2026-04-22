class InputProcessor {
    #lineSource;
    #currentLineBuffer = [];
    #lineCursor = 0;

    constructor(initialText) {
        this.#lineSource = initialText.split(/\r?\n/).filter(segment => segment.trim() !== '');
    }

    // Mimics the 'a' method: reads a single value, advancing to next line if current is exhausted.
    // Original 'a' reads from right-to-left after reverse. My 'pullSingle' reads left-to-right via shift.
    pullSingle(asStringValue = false) {
        while (this.#currentLineBuffer.length === 0) {
            if (this.#lineCursor >= this.#lineSource.length) {
                throw new Error("No more data segments available.");
            }
            this.#currentLineBuffer = this.#lineSource[this.#lineCursor].split(' ').filter(part => part !== '');
            this.#lineCursor++;
        }
        const extracted = this.#currentLineBuffer.shift();
        return asStringValue ? extracted : Number(extracted);
    }

    // Mimics the 'l' method: reads an entire line, advancing to the next line.
    pullLine(asStringArray = false) {
        if (this.#lineCursor >= this.#lineSource.length) {
            throw new Error("No more full lines available.");
        }
        // Clear any remaining tokens from a partially consumed line by 'pullSingle'
        this.#currentLineBuffer = [];
        const lineContent = this.#lineSource[this.#lineCursor++];
        const parts = lineContent.split(' ').filter(part => part !== '');
        return asStringArray ? parts : parts.map(Number);
    }

    // Mimics the 'm' method: reads N lines.
    pullManyLines(count, asStringArrays = false) {
        const collectedLines = [];
        for (let k = 0; k < count; k++) {
            collectedLines.push(this.pullLine(asStringArrays));
        }
        return collectedLines;
    }
}

class GroupManager {
    #parentLinks = new Map();

    initializeNode(nodeId) {
        if (!this.#parentLinks.has(nodeId)) {
            this.#parentLinks.set(nodeId, nodeId);
        }
    }

    locateRoot(nodeId) {
        if (this.#parentLinks.get(nodeId) === nodeId) {
            return nodeId;
        }
        // Path compression
        const ultimateParent = this.locateRoot(this.#parentLinks.get(nodeId));
        this.#parentLinks.set(nodeId, ultimateParent);
        return ultimateParent;
    }

    uniteGroups(nodeX, nodeY) {
        const rootX = this.locateRoot(nodeX);
        const rootY = this.locateRoot(nodeY);

        if (rootX !== rootY) {
            this.#parentLinks.set(rootX, rootY); // Simple union
            return true; // Groups were merged
        }
        return false; // Already in the same group
    }

    checkConnection(nodeX, nodeY) {
        return this.locateRoot(nodeX) === this.locateRoot(nodeY);
    }
}

const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");
const dataProvider = new InputProcessor(sourceData);

const calculateOutcome = () => {
    const totalNodes = dataProvider.pullSingle();
    const connectionCount = dataProvider.pullSingle();

    const targetAssignments = dataProvider.pullLine();

    const connectivityStructure = new GroupManager();

    // Initialize all nodes for DSU
    Array.from({ length: totalNodes + 1 }, (_, index) => index)
         .forEach(nodeId => connectivityStructure.initializeNode(nodeId));

    // Establish connections
    Array.from({ length: connectionCount }, () => dataProvider.pullLine())
         .forEach(connectionPair => connectivityStructure.uniteGroups(connectionPair[0], connectionPair[1]));

    // Determine the final result
    const matchingCount = Array.from({ length: totalNodes }, (_, index) => index + 1) // Nodes from 1 to totalNodes
        .filter(nodeIdentifier => connectivityStructure.checkConnection(targetAssignments[nodeIdentifier - 1], nodeIdentifier))
        .length;

    return matchingCount;
};

console.log(calculateOutcome());