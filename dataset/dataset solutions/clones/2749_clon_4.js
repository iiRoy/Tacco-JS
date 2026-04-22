const acquireInput = (textSource) => {
    let inputLines = textSource.trim().split('\n');
    let lineIndex = 0;

    const readSingleItem = (returnAsString = false) => {
        if (lineIndex >= inputLines.length) return undefined;

        let currentLineContent = inputLines[lineIndex];
        if (typeof currentLineContent === 'string') {
            currentLineContent = currentLineContent.split(' ').reverse();
            inputLines[lineIndex] = currentLineContent;
        }

        const itemValue = currentLineContent.pop();
        if (currentLineContent.length === 0) {
            lineIndex++;
        }
        return returnAsString ? itemValue : Number(itemValue);
    };

    const readLineItems = (returnAsStrings = false) => {
        if (lineIndex >= inputLines.length) return [];
        const originalLine = inputLines[lineIndex];
        lineIndex++;
        const items = originalLine.split(' ');
        return returnAsStrings ? items : items.map(Number);
    };

    const readMatrixItems = (numberOfRows, returnAsStrings = false) => {
        const matrix = [];
        for (let i = 0; i < numberOfRows; i++) {
            matrix.push(readLineItems(returnAsStrings));
        }
        return matrix;
    };

    const readVectorItems = (numberOfRows, returnAsStrings = false) => {
        const vector = [];
        for (let i = 0; i < numberOfRows; i++) {
            if (lineIndex >= inputLines.length) break;
            const originalLine = inputLines[lineIndex];
            lineIndex++;
            const item = originalLine.trim();
            vector.push(returnAsStrings ? item : Number(item));
        }
        return vector;
    };

    return {
        fetchItem: readSingleItem,
        fetchLine: readLineItems,
        fetchBlock: readMatrixItems,
        fetchSlice: readVectorItems
    };
};

const makeMultiDimArray = (initialValue, ...dimensions) => {
    if (dimensions.length === 0) {
        return typeof initialValue === 'string' ? JSON.parse(initialValue) : initialValue;
    }
    const currentDimension = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    return Array.from({ length: currentDimension }, () => makeMultiDimArray(initialValue, ...remainingDimensions));
};

class DisjointSet {
    #parentContainer; 

    constructor(elementCount) {
        this.#parentContainer = Array(elementCount + 1).fill(-1); 
    }

    findRepresentative(index) {
        if (this.#parentContainer[index] < 0) {
            return index; 
        }
        return this.#parentContainer[index] = this.findRepresentative(this.#parentContainer[index]);
    }

    areConnected(firstItem, secondItem) {
        return this.findRepresentative(firstItem) === this.findRepresentative(secondItem);
    }

    mergeSets(firstItem, secondItem) {
        let rootA = this.findRepresentative(firstItem);
        let rootB = this.findRepresentative(secondItem);

        if (rootA === rootB) {
            return false; 
        }
        
        if (this.#parentContainer[rootB] <= this.#parentContainer[rootA]) {
            this.#parentContainer[rootA] += this.#parentContainer[rootB];
            this.#parentContainer[rootB] = rootA;
        } else {
            this.#parentContainer[rootB] += this.#parentContainer[rootA];
            this.#parentContainer[rootA] = rootB;
        }
        return true; 
    }

    groupSize(index) {
        return -this.#parentContainer[this.findRepresentative(index)];
    }
}

function performGraphOrientation() {
    const dataReader = acquireInput(require("fs").readFileSync("/dev/stdin","utf8"));
    const nodeCount = dataReader.fetchItem();
    const edgeCount = dataReader.fetchItem();

    if (edgeCount % 2 !== 0) {
        return -1;
    }

    const inputEdges = dataReader.fetchBlock(edgeCount);
    const resultOrientations = [];
    const componentManager = new DisjointSet(nodeCount);
    const cycleEdgesAdjacency = makeMultiDimArray("[]", nodeCount + 1);
    const nodeParityTracker = makeMultiDimArray(0, nodeCount + 1);

    for (let k = 0; k < edgeCount; ++k) {
        const sourceNode = inputEdges[k][0];
        const destNode = inputEdges[k][1];

        if (componentManager.mergeSets(sourceNode, destNode)) {
            resultOrientations.push(`${sourceNode} ${destNode}`);
            nodeParityTracker[sourceNode] ^= 1; 
        } else {
            cycleEdgesAdjacency[sourceNode].push(destNode);
            cycleEdgesAdjacency[destNode].push(sourceNode);
        }
    }

    const traversalStack = [];
    const visitedInTraversal = new Set(); 

    traversalStack.push({ currentVertex: 1, entryParent: 0, visitPhase: 'pre' }); 

    while (traversalStack.length > 0) {
        const currentFrame = traversalStack.pop();
        const currentVertex = currentFrame.currentVertex;
        const entryParent = currentFrame.entryParent;

        if (currentFrame.visitPhase === 'pre') {
            if (visitedInTraversal.has(currentVertex)) {
                continue; 
            }
            visitedInTraversal.add(currentVertex);

            traversalStack.push({ currentVertex: currentVertex, entryParent: entryParent, visitPhase: 'post' }); 

            for (let i = cycleEdgesAdjacency[currentVertex].length - 1; i >= 0; --i) {
                const neighbor = cycleEdgesAdjacency[currentVertex][i];
                if (neighbor === entryParent) {
                    continue; 
                }
                if (!visitedInTraversal.has(neighbor)) { 
                    traversalStack.push({ currentVertex: neighbor, entryParent: currentVertex, visitPhase: 'pre' });
                }
            }
        } else {
            if (entryParent === 0) { 
                continue; 
            }

            if (nodeParityTracker[currentVertex]) { 
                resultOrientations.push(`${currentVertex} ${entryParent}`);
            } else { 
                resultOrientations.push(`${entryParent} ${currentVertex}`);
                nodeParityTracker[entryParent] ^= 1; 
            }
        }
    }
    
    return resultOrientations.join('\n');
}

if (process.argv.length < 3) {
    require("child_process").fork("Main.js", ["1"], { execArgv: ["--stack-size=240000"] });
} else {
    console.log(performGraphOrientation());
}