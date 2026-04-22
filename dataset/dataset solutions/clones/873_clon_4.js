const libIO = require('node:fs');

class LineFeedProvider {
    #segments;
    #segmentIndex;

    constructor() {
        const rawContent = libIO.readFileSync(0, 'utf8');
        this.#segments = rawContent.split('\n').filter(line => line.trim() !== '');
        this.#segmentIndex = 0;
    }

    pullNextTokens() {
        if (this.#segmentIndex >= this.#segments.length) {
            return null;
        }
        const currentSegment = this.#segments[this.#segmentIndex];
        this.#segmentIndex++;
        return currentSegment.split(' ');
    }
}

class DisjointSetUnion {
    #representativeMap;
    #groupSizes;

    constructor(initialCapacity) {
        this.#representativeMap = new Map();
        this.#groupSizes = new Map();
        for (let idx = 0; idx < initialCapacity; idx++) {
            this.#representativeMap.set(idx, idx);
            this.#groupSizes.set(idx, 1);
        }
    }

    findRepresentative(elementIdentifier) {
        if (!this.#representativeMap.has(elementIdentifier)) {
            return elementIdentifier;
        }
        let currentElement = elementIdentifier;
        const traversalPath = [];
        while (this.#representativeMap.get(currentElement) !== currentElement) {
            traversalPath.push(currentElement);
            currentElement = this.#representativeMap.get(currentElement);
        }
        for (const nodeOnPath of traversalPath) {
            this.#representativeMap.set(nodeOnPath, currentElement);
        }
        return currentElement;
    }

    uniteGroups(elementA, elementB) {
        let rootA = this.findRepresentative(elementA);
        let rootB = this.findRepresentative(elementB);

        if (rootA !== rootB) {
            if (this.#groupSizes.get(rootA) < this.#groupSizes.get(rootB)) {
                [rootA, rootB] = [rootB, rootA];
            }
            this.#representativeMap.set(rootB, rootA);
            this.#groupSizes.set(rootA, this.#groupSizes.get(rootA) + this.#groupSizes.get(rootB));
            this.#groupSizes.delete(rootB);
            return true;
        }
        return false;
    }

    countActiveComponents(activeElementIdentifiers) {
        const uniqueRepresentatives = new Set();
        for (const elementIdentifier of activeElementIdentifiers) {
            if (this.#representativeMap.has(elementIdentifier)) {
                uniqueRepresentatives.add(this.findRepresentative(elementIdentifier));
            }
        }
        return uniqueRepresentatives.size;
    }
}

function processGraphTestCases() {
    const dataProvider = new LineFeedProvider();

    while (true) {
        const initialCounts = dataProvider.pullNextTokens().map(Number);
        const nodeQuantity = initialCounts[0];
        const connectionQuantity = initialCounts[1];

        if (nodeQuantity === 0 && connectionQuantity === 0) {
            break;
        }

        const nodeAttributes = [];
        for (let idx = 0; idx < nodeQuantity; idx++) {
            nodeAttributes.push({
                identifier: idx,
                activationValue: Number(dataProvider.pullNextTokens()[0])
            });
        }

        const connectionRecords = [];
        for (let idx = 0; idx < connectionQuantity; idx++) {
            const parts = dataProvider.pullNextTokens().map(Number);
            const sourceNode = parts[0] - 1;
            const targetNode = parts[1] - 1;
            const edgeWeight = parts[2];
            connectionRecords.push({ source: sourceNode, target: targetNode, weight: edgeWeight });
        }

        const fullGraphPartitions = new DisjointSetUnion(nodeQuantity);
        connectionRecords.forEach(conn => {
            fullGraphPartitions.uniteGroups(conn.source, conn.target);
        });
        const allNodeIdentifiers = new Set(Array.from({ length: nodeQuantity }, (_, i) => i));
        if (fullGraphPartitions.countActiveComponents(allNodeIdentifiers) > 1) {
            console.log(0);
            continue;
        }

        let thresholdActivationValue = 0;
        const sortedNodeAttributes = [...nodeAttributes].sort((attrA, attrB) => attrA.activationValue - attrB.activationValue);

        for (let k = 0; k < sortedNodeAttributes.length; k++) {
            const currentActiveIdentifiers = new Set(sortedNodeAttributes.slice(0, k + 1).map(attr => attr.identifier));
            
            const interimPartitions = new DisjointSetUnion(nodeQuantity);
            connectionRecords.forEach(conn => {
                if (currentActiveIdentifiers.has(conn.source) && currentActiveIdentifiers.has(conn.target)) {
                    interimPartitions.uniteGroups(conn.source, conn.target);
                }
            });

            if (interimPartitions.countActiveComponents(currentActiveIdentifiers) > 1) {
                thresholdActivationValue = sortedNodeAttributes[k - 1] ? sortedNodeAttributes[k - 1].activationValue : 0;
                break;
            }
            thresholdActivationValue = sortedNodeAttributes[k].activationValue;
        }

        let totalMinimumWeight = 0;
        const finalPartitions = new DisjointSetUnion(nodeQuantity);

        const relevantConnections = connectionRecords.filter(conn => {
            const sourceAttr = nodeAttributes.find(attr => attr.identifier === conn.source);
            const targetAttr = nodeAttributes.find(attr => attr.identifier === conn.target);
            return sourceAttr.activationValue <= thresholdActivationValue &&
                   targetAttr.activationValue <= thresholdActivationValue;
        }).sort((connA, connB) => connA.weight - connB.weight);

        relevantConnections.forEach(conn => {
            if (finalPartitions.findRepresentative(conn.source) !== finalPartitions.findRepresentative(conn.target)) {
                finalPartitions.uniteGroups(conn.source, conn.target);
                totalMinimumWeight += conn.weight;
            }
        });

        console.log(totalMinimumWeight);
    }
}

processGraphTestCases();