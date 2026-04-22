let receivedData = '';
let dataTokens = [];
let tokenPointer = 0;

const processIncomingData = (chunk) => {
    receivedData += chunk;
};

const finalizeInputAndExecute = () => {
    dataTokens = receivedData.trim().split(/\s+/);
    initiateGraphAnalysis();
};

const extractNumericValue = () => {
    return +dataTokens[tokenPointer++];
};

const outputResult = (value) => {
    console.log(value);
};

class GraphPartitionManager {
    #parentElements;
    #rankValues;

    constructor(elementCount) {
        this.#parentElements = new Map();
        this.#rankValues = new Map();
        for (let k = 0; k < elementCount; ++k) {
            this.#parentElements.set(k, k);
            this.#rankValues.set(k, 0);
        }
    }

    // Iterative path compression
    locateRoot(elementId) {
        let currentElement = elementId;
        const pathTraversal = [];
        while (this.#parentElements.get(currentElement) !== currentElement) {
            pathTraversal.push(currentElement);
            currentElement = this.#parentElements.get(currentElement);
        }
        for (const traversedNode of pathTraversal) {
            this.#parentElements.set(traversedNode, currentElement);
        }
        return currentElement;
    }

    areConnected(firstElement, secondElement) {
        return this.locateRoot(firstElement) === this.locateRoot(secondElement);
    }

    mergeComponents(firstElement, secondElement) {
        let rootOne = this.locateRoot(firstElement);
        let rootTwo = this.locateRoot(secondElement);

        if (rootOne === rootTwo) {
            return;
        }

        const rankOne = this.#rankValues.get(rootOne);
        const rankTwo = this.#rankValues.get(rootTwo);

        if (rankOne > rankTwo) {
            this.#parentElements.set(rootTwo, rootOne);
        } else if (rankTwo > rankOne) {
            this.#parentElements.set(rootOne, rootTwo);
        } else {
            this.#parentElements.set(rootTwo, rootOne);
            this.#rankValues.set(rootOne, rankOne + 1);
        }
    }
}

const initiateGraphAnalysis = () => {
    const totalNodes = extractNumericValue();
    const potentialLinks = [];

    for (let rowIdx = 0; rowIdx < totalNodes; ++rowIdx) {
        for (let colIdx = 0; colIdx < totalNodes; ++colIdx) {
            const linkWeight = extractNumericValue();
            if (rowIdx < colIdx && linkWeight !== -1) {
                potentialLinks.push({ weight: linkWeight, fromNode: rowIdx, toNode: colIdx });
            }
        }
    }

    potentialLinks.sort((linkA, linkB) => linkA.weight - linkB.weight);

    const componentManager = new GraphPartitionManager(totalNodes);
    let cumulativeCost = 0;

    for (const currentLink of potentialLinks) {
        const { weight: edgeCost, fromNode: nodeA, toNode: nodeB } = currentLink;

        if (!componentManager.areConnected(nodeA, nodeB)) {
            cumulativeCost += edgeCost;
            componentManager.mergeComponents(nodeA, nodeB);
        }
    }

    outputResult(cumulativeCost);
};

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', processIncomingData);
process.stdin.on('end', finalizeInputAndExecute);