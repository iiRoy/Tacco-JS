function processInputData(inputContent) {
    const dataLines = inputContent.split('\n').filter(Boolean);
    const [firstConfigLine, ...operationLines] = dataLines.map(lineSegment => lineSegment.split(' ').map(Number));

    const [nodeCount, operationCount] = firstConfigLine;

    const dss = new DisjointSetStructure(nodeCount);

    operationLines.forEach(opPair => dss.unite(opPair[0] - 1, opPair[1] - 1));

    console.log(dss.disjointSetCount);
}

class DisjointSetStructure {
    constructor(elementCount) {
        this.parentPointers = Array(elementCount).fill(0).map((_, idx) => idx);
        this.setRanks = Array(elementCount).fill(0);
        this.setSizes = Array(elementCount).fill(1);
        this.disjointSetCount = elementCount;
    }

    findRoot(elementIndex) {
        let currentElement = elementIndex;
        const pathNodes = [];

        while (this.parentPointers[currentElement] !== currentElement) {
            pathNodes.push(currentElement);
            currentElement = this.parentPointers[currentElement];
        }

        for (const nodeToCompress of pathNodes) {
            this.parentPointers[nodeToCompress] = currentElement;
        }

        return currentElement;
    }

    unite(indexA, indexB) {
        let rootA = this.findRoot(indexA);
        let rootB = this.findRoot(indexB);

        if (rootA === rootB) {
            return;
        }

        if (this.setRanks[rootA] < this.setRanks[rootB]) {
            [rootA, rootB] = [rootB, rootA];
        }

        this.parentPointers[rootB] = rootA;
        this.setSizes[rootA] += this.setSizes[rootB];

        if (this.setRanks[rootA] === this.setRanks[rootB]) {
            this.setRanks[rootA]++;
        }
        this.disjointSetCount--;
    }

    getSetSize(elementIndex) {
        const rootOfElement = this.findRoot(elementIndex);
        return this.setSizes[rootOfElement];
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
