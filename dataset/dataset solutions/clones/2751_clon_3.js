const InputParser = (function () {
    class DataStreamReader {
        constructor(sourceInputText) {
            this.inputLines = sourceInputText.trim().split('\n');
            this.currentLinePointer = 0;
            this.currentLineElementsBuffer = [];
        }

        retrieveNextElement(returnAsString = false) {
            if (this.currentLineElementsBuffer.length === 0) {
                if (this.currentLinePointer >= this.inputLines.length) {
                    throw new Error("Attempted to read past end of input.");
                }
                const lineData = this.inputLines[this.currentLinePointer];
                this.currentLineElementsBuffer = lineData.split(' ').reverse();
            }

            const elementValue = this.currentLineElementsBuffer.pop();

            if (this.currentLineElementsBuffer.length === 0) {
                this.currentLinePointer++;
            }
            
            return returnAsString ? elementValue : Number(elementValue);
        }

        readEntireLine(returnAsString = false) {
            if (this.currentLinePointer >= this.inputLines.length) {
                throw new Error("Attempted to read past end of input when reading a full line.");
            }
            this.currentLineElementsBuffer = [];

            const lineContent = this.inputLines[this.currentLinePointer++];
            const parsedElements = lineContent.split(/\s+/);
            return returnAsString ? parsedElements : parsedElements.map(item => Number(item));
        }

        readMatrixData(numRows, returnAsString = false) {
            if (numRows <= 0) return [];
            if (this.currentLinePointer + numRows > this.inputLines.length) {
                throw new Error("Attempted to read more matrix rows than available in input.");
            }
            const matrixSlice = this.inputLines.slice(this.currentLinePointer, this.currentLinePointer + numRows);
            this.currentLinePointer += numRows;

            const resultMatrix = matrixSlice.map(line => {
                const rowElements = line.split(/\s+/);
                return returnAsString ? rowElements : rowElements.map(item => Number(item));
            });
            return resultMatrix;
        }

        readLinesAsSingleValues(numLines, returnAsString = false) {
            if (numLines <= 0) return [];
            if (this.currentLinePointer + numLines > this.inputLines.length) {
                throw new Error("Attempted to read more lines than available in input.");
            }
            const linesSlice = this.inputLines.slice(this.currentLinePointer, this.currentLinePointer + numLines);
            this.currentLinePointer += numLines;

            return returnAsString ? linesSlice : linesSlice.map(line => Number(line));
        }
    }

    return function (sourceContent) {
        return new DataStreamReader(sourceContent);
    };
})();


function initializeMultiDimArray(defaultValueGenerator, ...dimensions) {
    if (dimensions.length === 0) {
        return typeof defaultValueGenerator === 'function' ? defaultValueGenerator() : defaultValueGenerator;
    }

    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);

    if (currentDimensionSize < 0 || !Number.isInteger(currentDimensionSize)) {
        throw new Error(`Invalid dimension size: ${currentDimensionSize}. Must be a non-negative integer.`);
    }

    const newArray = new Array(currentDimensionSize);
    for (let i = 0; i < currentDimensionSize; i++) {
        newArray[i] = initializeMultiDimArray(defaultValueGenerator, ...remainingDimensions);
    }
    return newArray;
}


class DisjointSetUnion {
    constructor(nodeCount) {
        if (nodeCount < 0 || !Number.isInteger(nodeCount)) {
            throw new Error(`Invalid node count: ${nodeCount}. Must be a non-negative integer.`);
        }
        this.parentOrSize = Array(nodeCount + 1).fill(-1);
    }

    findRoot(elementId) {
        if (elementId < 1 || elementId >= this.parentOrSize.length) {
            throw new Error(`Invalid element ID: ${elementId}. Must be within [1, ${this.parentOrSize.length - 1}].`);
        }
        if (this.parentOrSize[elementId] < 0) {
            return elementId;
        }
        this.parentOrSize[elementId] = this.findRoot(this.parentOrSize[elementId]);
        return this.parentOrSize[elementId];
    }

    areConnected(elementA, elementB) {
        return this.findRoot(elementA) === this.findRoot(elementB);
    }

    unionSets(elementA, elementB) {
        let rootA = this.findRoot(elementA);
        let rootB = this.findRoot(elementB);

        if (rootA === rootB) {
            return false;
        }

        if (this.parentOrSize[rootB] < this.parentOrSize[rootA]) {
            [rootA, rootB] = [rootB, rootA];
        }
        
        this.parentOrSize[rootA] += this.parentOrSize[rootB];
        this.parentOrSize[rootB] = rootA;
        
        return true;
    }

    getSetSize(elementId) {
        return -this.parentOrSize[this.findRoot(elementId)];
    }
}

function solveProblem() {
    const dataReader = InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

    const totalNodes = dataReader.retrieveNextElement();
    const totalEdges = dataReader.retrieveNextElement();

    if (totalEdges % 2 !== 0) {
        return -1;
    }

    const graphEdges = dataReader.readMatrixData(totalEdges);

    const dsuManager = new DisjointSetUnion(totalNodes);

    const finalEdgeSequence = [];

    const adjacencyList = initializeMultiDimArray(() => [], totalNodes + 1);

    const nodeParityState = initializeMultiDimArray(0, totalNodes + 1);

    for (const currentEdge of graphEdges) {
        const [nodeU, nodeV] = currentEdge;

        if (dsuManager.unionSets(nodeU, nodeV)) {
            finalEdgeSequence.push(`${nodeU} ${nodeV}`);
            nodeParityState[nodeU] ^= 1;
        } else {
            adjacencyList[nodeU].push(nodeV);
            adjacencyList[nodeV].push(nodeU);
        }
    }

    processGraphDFS(1, 0, adjacencyList, nodeParityState, finalEdgeSequence);

    return finalEdgeSequence.join("\n");
}

function processGraphDFS(currentNode, parentNode, graphAdjList, nodeParityTracker, collectedEdges) {
    for (const neighborNode of graphAdjList[currentNode]) {
        if (neighborNode === parentNode) {
            continue;
        }
        processGraphDFS(neighborNode, currentNode, graphAdjList, nodeParityTracker, collectedEdges);
    }

    if (parentNode === 0) {
        return;
    }

    if (nodeParityTracker[currentNode] === 1) {
        collectedEdges.push(`${currentNode} ${parentNode}`);
        nodeParityTracker[parentNode] ^= 1;
    } else {
        collectedEdges.push(`${parentNode} ${currentNode}`);
    }
}

console.log(solveProblem());