var InputParser = (function () {
    function createParser(sourceString) {
        return new ParserInstance(sourceString);
    }

    function ParserInstance(sourceString) {
        this._sourceLines = sourceString.trim().split("\n");
        this._currentLineIndex = 0;
    }

    const toNum = (val) => +val;

    ParserInstance.prototype.readSingleValue = function (asString) {
        let currentLine = this._sourceLines[this._currentLineIndex];
        if (typeof currentLine === "string") {
            this._sourceLines[this._currentLineIndex] = currentLine.split(" ").reverse();
        }
        let value = this._sourceLines[this._currentLineIndex].pop();
        if (!this._sourceLines[this._currentLineIndex].length) {
            this._currentLineIndex++;
        }
        return asString ? value : toNum(value);
    };

    ParserInstance.prototype.readLineValues = function (asStrings) {
        const lineTokens = this._sourceLines[this._currentLineIndex++].split(" ");
        return asStrings ? lineTokens : lineTokens.map(toNum);
    };

    ParserInstance.prototype.readMatrix = function (rowCount, asStrings) {
        const matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += rowCount);
        return asStrings ? matrixRows.map(row => row.split(" ")) : matrixRows.map(row => row.split(" ").map(toNum));
    };

    ParserInstance.prototype.readRawLines = function (rowCount, asStrings) {
        const rawLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += rowCount);
        return asStrings ? rawLines : rawLines.map(toNum);
    };

    return createParser;
})();

const inputReader = InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(processMainLogic());

function processMainLogic() {
    const nodeCount = inputReader.readSingleValue();
    const relationCount = inputReader.readSingleValue();

    const predecessors = [];
    const successors = [];

    const UNVISITED_LEVEL = Number.MAX_SAFE_INTEGER;
    const nodeLevels = Array(nodeCount + relationCount - 1).fill(UNVISITED_LEVEL);

    const ensureArray = (arr, index) => {
        if (!arr[index]) {
            arr[index] = [];
        }
        return arr[index];
    };

    for (let i = 0; i < nodeCount + relationCount - 1; i++) {
        const currentRelation = inputReader.readLineValues().map(val => val - 1);
        const sourceNode = currentRelation[0];
        const targetNode = currentRelation[1];

        ensureArray(predecessors, targetNode).push(sourceNode);
        ensureArray(successors, sourceNode).push(targetNode);
    }

    const resultParents = [];

    let initialNodeIdx = -1;
    for (let i = 0; ; i++) {
        if (!predecessors[i]) {
            initialNodeIdx = i;
            resultParents[initialNodeIdx] = 0;
            nodeLevels[initialNodeIdx] = 0;
            break;
        }
    }

    let currentLevelNodesQueue = successors[initialNodeIdx] || [];

    let processedNodeCount = 1;
    let currentDepth = 1;

    while (processedNodeCount < nodeCount) {
        const nextLevelNodesQueue = [];

        for (const currentNode of currentLevelNodesQueue) {
            let canProcessCurrentNode = true;

            const currentPredecessors = predecessors[currentNode] || [];
            for (const predNode of currentPredecessors) {
                if (nodeLevels[predNode] >= currentDepth) {
                    canProcessCurrentNode = false;
                    break;
                }
                if (nodeLevels[predNode] === currentDepth - 1) {
                    resultParents[currentNode] = predNode + 1;
                }
            }

            if (canProcessCurrentNode) {
                nodeLevels[currentNode] = currentDepth;
                processedNodeCount++;
                if (successors[currentNode]) {
                    nextLevelNodesQueue.push(...successors[currentNode]);
                }
            }
        }

        currentLevelNodesQueue = nextLevelNodesQueue;
        currentDepth++;
    }

    return resultParents.join("\n");
}
