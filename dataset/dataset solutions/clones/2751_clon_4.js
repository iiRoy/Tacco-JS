class DataStreamProcessor {
    #lineBuffer;
    #currentLineTokens;
    #linePointer;

    constructor(inputString) {
        this.#lineBuffer = inputString.trim().split("\n");
        this.#linePointer = 0;
        this.#currentLineTokens = [];
    }

    #loadNextLineTokens() {
        if (this.#currentLineTokens.length === 0 && this.#linePointer < this.#lineBuffer.length) {
            this.#currentLineTokens = this.#lineBuffer[this.#linePointer++].split(" ");
        }
    }

    extractNextValue(asString = false) {
        this.#loadNextLineTokens();
        if (this.#currentLineTokens.length === 0) {
            return undefined;
        }
        const extractedToken = this.#currentLineTokens.shift();
        return asString ? extractedToken : Number(extractedToken);
    }

    extractLineValues(asStrings = false) {
        if (this.#linePointer >= this.#lineBuffer.length) {
            return [];
        }
        const currentLine = this.#lineBuffer[this.#linePointer++];
        const tokensOnLine = currentLine.split(" ");
        return asStrings ? tokensOnLine : tokensOnLine.map(Number);
    }

    extractMatrix(rowCount, asStrings = false) {
        const collectedMatrix = [];
        for (let i = 0; i < rowCount; i++) {
            collectedMatrix.push(this.extractLineValues(asStrings));
        }
        return collectedMatrix;
    }

    extractRawLines(rowCount, asStrings = false) {
        const collectedLines = [];
        for (let i = 0; i < rowCount; i++) {
            if (this.#linePointer >= this.#lineBuffer.length) break;
            const lineContent = this.#lineBuffer[this.#linePointer++];
            collectedLines.push(asStrings ? lineContent : Number(lineContent));
        }
        return collectedLines;
    }
}

function generateNestedArray(initialFill, ...dimensions) {
    const createRecursive = (dims) => {
        if (dims.length === 0) {
            return typeof initialFill === 'object' && initialFill !== null
                ? JSON.parse(JSON.stringify(initialFill))
                : initialFill;
        }
        const currentDimensionSize = dims[0];
        const remainingDimensions = dims.slice(1);
        return Array.from({ length: currentDimensionSize }, () => createRecursive(remainingDimensions));
    };
    return createRecursive(dimensions);
}

class DisjointSet {
    #parentOrSize;

    constructor(elementCount) {
        this.#parentOrSize = Array(elementCount + 1).fill(-1);
    }

    findRepresentative(idx) {
        if (this.#parentOrSize[idx] < 0) {
            return idx;
        }
        return (this.#parentOrSize[idx] = this.findRepresentative(this.#parentOrSize[idx]));
    }

    areConnected(idx1, idx2) {
        return this.findRepresentative(idx1) === this.findRepresentative(idx2);
    }

    uniteSets(idx1, idx2) {
        let rootA = this.findRepresentative(idx1);
        let rootB = this.findRepresentative(idx2);

        if (rootA === rootB) {
            return false;
        }

        if (this.#parentOrSize[rootB] < this.#parentOrSize[rootA]) {
            [rootA, rootB] = [rootB, rootA];
        }
        this.#parentOrSize[rootA] += this.#parentOrSize[rootB];
        this.#parentOrSize[rootB] = rootA;

        return true;
    }

    getSetSize(idx) {
        return -this.#parentOrSize[this.findRepresentative(idx)];
    }
}

const inputReader = new DataStreamProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(executeGraphAlgorithm());

function executeGraphAlgorithm() {
    const nodeQuantity = inputReader.extractNextValue();
    const edgeQuantity = inputReader.extractNextValue();

    if (edgeQuantity % 2 !== 0) {
        return -1;
    }

    const allEdges = inputReader.extractMatrix(edgeQuantity);
    const disjointSetStructure = new DisjointSet(nodeQuantity);
    const finalEdgeList = [];
    const cycleEdgeAdjacency = generateNestedArray([], nodeQuantity + 1);
    const nodeParityTracker = generateNestedArray(0, nodeQuantity + 1);

    for (let k = 0; k < edgeQuantity; k++) {
        const sourceNode = allEdges[k][0];
        const targetNode = allEdges[k][1];

        if (disjointSetStructure.uniteSets(sourceNode, targetNode)) {
            finalEdgeList.push(`${sourceNode} ${targetNode}`);
            nodeParityTracker[sourceNode] ^= 1;
        } else {
            cycleEdgeAdjacency[sourceNode].push(targetNode);
            cycleEdgeAdjacency[targetNode].push(sourceNode);
        }
    }

    function balanceParityTraversal(currentNode, parentNode) {
        cycleEdgeAdjacency[currentNode].forEach(neighbor => {
            if (neighbor === parentNode) {
                return;
            }
            balanceParityTraversal(neighbor, currentNode);
        });

        if (parentNode === 0) {
            return;
        }

        if (nodeParityTracker[currentNode] === 1) {
            finalEdgeList.push(`${currentNode} ${parentNode}`);
        } else {
            finalEdgeList.push(`${parentNode} ${currentNode}`);
            nodeParityTracker[parentNode] ^= 1;
        }
    }

    balanceParityTraversal(1, 0);

    return finalEdgeList.join("\n");
}
