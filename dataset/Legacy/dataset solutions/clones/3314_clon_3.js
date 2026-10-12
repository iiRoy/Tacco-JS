class InputParser {
    constructor(rawInputString) {
        this._sourceLines = rawInputString.trim().split("\n");
        this._currentLineIndex = 0;
        this._cachedLineTokens = [];
    }

    _ensureLineTokens() {
        if (this._cachedLineTokens.length === 0 && this._currentLineIndex < this._sourceLines.length) {
            this._cachedLineTokens = this._sourceLines[this._currentLineIndex].split(" ").reverse();
            this._currentLineIndex++;
        }
    }

    readNextToken(convertToNumber = false) {
        this._ensureLineTokens();
        const tokenValue = this._cachedLineTokens.pop();
        return convertToNumber ? +tokenValue : tokenValue;
    }

    readSingleNumber() {
        return this.readNextToken(true);
    }

    readLineOfNumbers() {
        const lineContent = this._sourceLines[this._currentLineIndex++];
        return lineContent.split(" ").map(Number);
    }

    readMatrixOfNumbers(numberOfRows) {
        const resultMatrix = [];
        for (let i = 0; i < numberOfRows; i++) {
            resultMatrix.push(this.readLineOfNumbers());
        }
        return resultMatrix;
    }

    readMultipleNumbers(count) {
        const numbersList = [];
        for (let i = 0; i < count; i++) {
            numbersList.push(Number(this._sourceLines[this._currentLineIndex++]));
        }
        return numbersList;
    }
}

const createInputReader = (inputString) => new InputParser(inputString);

const inputData = createInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(calculateDependencyGenerations());

function calculateDependencyGenerations() {
    const nodeCount = inputData.readSingleNumber();
    const dependencyCount = inputData.readSingleNumber();
    const dependencyPairs = inputData.readMatrixOfNumbers(dependencyCount);

    // `isIndependentNode[k] = 1` means node `k` is not a dependent (i.e., it's a root/starting node).
    // `isIndependentNode[k] = 0` means node `k` is a dependent (i.e., it appears as x[i][0]).
    const isIndependentNode = Array(nodeCount + 1).fill(1);
    const reverseDependencyGraph = Array(nodeCount + 1).fill(0).map(() => []);

    for (let k = 0; k < dependencyCount; k++) {
        const dependentNode = dependencyPairs[k][0];
        const prerequisiteNode = dependencyPairs[k][1];
        isIndependentNode[dependentNode] = 0; // Mark this node as a dependent
        reverseDependencyGraph[prerequisiteNode].push(dependentNode); // prerequisiteNode -> dependentNode
    }

    let currentLevelNodes = [];
    // Initialize the first level with all nodes that are not dependents (i.e., they are independent/root nodes).
    for (let k = 1; k <= nodeCount; k++) {
        if (isIndependentNode[k]) {
            currentLevelNodes.push(k);
        }
    }

    let generationCounter = -1; // Start at -1, as the first iteration will increment it to 0 for the initial level.

    while (currentLevelNodes.length > 0) {
        const nextLevelNodes = [];
        // `processedInCurrentLevel` tracks nodes already added to `nextLevelNodes` within this generation
        // to avoid redundant processing if a node is a predecessor to multiple nodes in `currentLevelNodes`.
        const processedInCurrentLevel = Array(nodeCount + 1).fill(0);
        generationCounter++;

        for (let k = 0; k < currentLevelNodes.length; k++) {
            const currentNode = currentLevelNodes[k];
            if (processedInCurrentLevel[currentNode]) {
                continue;
            }
            processedInCurrentLevel[currentNode] = 1;
            // Add all nodes that depend on `currentNode` to the next level.
            // These are the nodes that can now be processed because `currentNode` is processed.
            nextLevelNodes.push(...reverseDependencyGraph[currentNode]);
        }
        currentLevelNodes = nextLevelNodes;
    }
    return generationCounter;
}
