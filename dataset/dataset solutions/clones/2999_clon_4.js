class InputProcessor {
    constructor(rawInputContent) {
        this.lineGenerator = this._createLineGenerator(rawInputContent.trim());
        this.currentLineTokens = [];
    }

    *_createLineGenerator(text) {
        const lines = text.split('\n');
        for (const line of lines) {
            yield line;
        }
    }

    extractToken(asString) {
        if (this.currentLineTokens.length === 0) {
            const { value, done } = this.lineGenerator.next();
            if (done) {
                throw new Error("Input exhausted unexpectedly.");
            }
            this.currentLineTokens = value.split(' ');
        }
        const tokenValue = this.currentLineTokens.shift();
        if (tokenValue === undefined) {
             throw new Error("Failed to extract token from line.");
        }
        return asString ? tokenValue : Number(tokenValue);
    }

    fetchLine(asString) {
        const { value, done } = this.lineGenerator.next();
        if (done) {
            throw new Error("Input exhausted unexpectedly.");
        }
        this.currentLineTokens = [];
        const tokens = value.split(' ');
        return asString ? tokens : tokens.map(Number);
    }

    fetchMatrix(rowCount, asString) {
        const resultMatrix = [];
        for (let i = 0; i < rowCount; i++) {
            resultMatrix.push(this.fetchLine(asString));
        }
        return resultMatrix;
    }

    fetchRows(rowCount, asString) {
        const resultRows = [];
        for (let i = 0; i < rowCount; i++) {
            const { value, done } = this.lineGenerator.next();
            if (done) {
                throw new Error("Input exhausted unexpectedly.");
            }
            this.currentLineTokens = [];
            resultRows.push(asString ? value : Number(value));
        }
        return resultRows;
    }
}

function createMultiDimArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    const newArray = new Array(currentDimensionSize);
    for (let i = 0; i < currentDimensionSize; i++) {
        newArray[i] = createMultiDimArray(initialValue, ...remainingDimensions);
    }
    return newArray;
}

console.log(solveGraphProblem());

function solveGraphProblem() {
    const inputReader = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

    const nodeCount = inputReader.extractToken();
    const adjacencyLists = createMultiDimArray([], nodeCount);

    for (let edgeIndex = 0; edgeIndex < nodeCount - 1; edgeIndex++) {
        const edgeNodes = inputReader.fetchLine().map(val => val - 1);
        adjacencyLists[edgeNodes[0]].push(edgeNodes[1]);
        adjacencyLists[edgeNodes[1]].push(edgeNodes[0]);
    }

    let farthestNodeFromStart = 0;
    let maxDistanceFirstTraversal = 0;

    const bfsQueueOne = [[0, 0]];
    const visitedNodesOne = new Set();
    visitedNodesOne.add(0);

    let queueHeadOne = 0;
    while(queueHeadOne < bfsQueueOne.length) {
        const [currentNode, currentDistance] = bfsQueueOne[queueHeadOne++];
        
        if (currentDistance > maxDistanceFirstTraversal) {
            maxDistanceFirstTraversal = currentDistance;
            farthestNodeFromStart = currentNode;
        }

        for (const neighborNode of adjacencyLists[currentNode]) {
            if (!visitedNodesOne.has(neighborNode)) {
                visitedNodesOne.add(neighborNode);
                bfsQueueOne.push([neighborNode, currentDistance + 1]);
            }
        }
    }

    let finalMaxDistance = 0;

    const bfsQueueTwo = [[farthestNodeFromStart, 0]];
    const visitedNodesTwo = new Set();
    visitedNodesTwo.add(farthestNodeFromStart);

    let queueHeadTwo = 0;
    while(queueHeadTwo < bfsQueueTwo.length) {
        const [currentNode, currentDistance] = bfsQueueTwo[queueHeadTwo++];
        
        if (currentDistance > finalMaxDistance) {
            finalMaxDistance = currentDistance;
        }

        for (const neighborNode of adjacencyLists[currentNode]) {
            if (!visitedNodesTwo.has(neighborNode)) {
                visitedNodesTwo.add(neighborNode);
                bfsQueueTwo.push([neighborNode, currentDistance + 1]);
            }
        }
    }

    return finalMaxDistance % 3 === 1 ? "Second" : "First";
}
