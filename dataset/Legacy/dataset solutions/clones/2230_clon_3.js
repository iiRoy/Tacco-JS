"use strict";

const _toNumber = (value) => +value;

const InputReaderFactory = (function () {
    class InputReader {
        constructor(rawInputString) {
            this._inputLines = rawInputString.trim().split("\n");
            this._currentLineIndex = 0;
        }

        _ensureLineTokens(lineIndex) {
            if (typeof this._inputLines[lineIndex] === "string") {
                this._inputLines[lineIndex] = this._inputLines[lineIndex].split(" ").reverse();
            }
        }

        readNextToken(asString = false) {
            const lines = this._inputLines;
            let lineIdx = this._currentLineIndex;

            this._ensureLineTokens(lineIdx);

            let token = lines[lineIdx].pop();
            if (!lines[lineIdx].length) {
                this._currentLineIndex++;
            }
            return asString ? token : _toNumber(token);
        }

        readLineTokens(asString = false) {
            const lineContent = this._inputLines[this._currentLineIndex++];
            const tokens = lineContent.split(" ");
            return asString ? tokens : tokens.map(_toNumber);
        }

        readMatrix(numLines, asString = false) {
            const matrixRows = this._inputLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
            const parsedMatrix = matrixRows.map(row => row.split(" "));
            return asString ? parsedMatrix : parsedMatrix.map(row => row.map(_toNumber));
        }

        readRawLines(numLines, asString = false) {
            const rawLines = this._inputLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
            return asString ? rawLines : rawLines.map(_toNumber);
        }
    }
    return function createReader(s) { return new InputReader(s); };
})();

const inputReader = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initValueExpr, ...dimensions) {
    let dimCount = dimensions.length;
    let arrayCreationString = `Array(dimensions[${--dimCount}]).fill(0).map(x=>{return ${initValueExpr};})`;
    while (--dimCount >= 0) {
        arrayCreationString = `Array(dimensions[${dimCount}]).fill(0).map(x=>${arrayCreationString})`;
    }
    return eval(arrayCreationString);
}

let adjacencyList;
let edgeBitmasks;

function getCanonicalEdgeKey(nodeA, nodeB) {
    const minNode = Math.min(nodeA, nodeB);
    const maxNode = Math.max(nodeA, nodeB);
    return `${minNode}-${maxNode}`;
}

function solveProblem() {
    const nodeCount = inputReader.readNextToken();
    const edgeLookupMap = new Map();

    adjacencyList = createMultiDimArray("[]", nodeCount);
    edgeBitmasks = createMultiDimArray(0, nodeCount - 1);

    for (let edgeIdx = 0; edgeIdx < nodeCount - 1; edgeIdx++) {
        const nodeA = inputReader.readNextToken() - 1;
        const nodeB = inputReader.readNextToken() - 1;
        
        edgeLookupMap.set(getCanonicalEdgeKey(nodeA, nodeB), edgeIdx);

        adjacencyList[nodeA].push(nodeB);
        adjacencyList[nodeB].push(nodeA);
    }

    const queryCount = inputReader.readNextToken();
    for (let queryIdx = 0; queryIdx < queryCount; queryIdx++) {
        const startNode = inputReader.readNextToken() - 1;
        const endNode = inputReader.readNextToken() - 1;
        const currentQueryBit = 1 << queryIdx;

        const pathNodes = findPathDFS(startNode, endNode, -1, []);
        
        for (let pathStepIdx = 1; pathStepIdx < pathNodes.length; pathStepIdx++) {
            const prevNodeInPath = pathNodes[pathStepIdx - 1];
            const currNodeInPath = pathNodes[pathStepIdx];
            
            const edgeKey = getCanonicalEdgeKey(prevNodeInPath, currNodeInPath);
            const correspondingEdgeListIdx = edgeLookupMap.get(edgeKey);
            
            if (correspondingEdgeListIdx !== undefined) {
                edgeBitmasks[correspondingEdgeListIdx] |= currentQueryBit;
            }
        }
    }

    const totalBitmaskStates = 1 << queryCount;
    let dpStates = createMultiDimArray(0, totalBitmaskStates);
    dpStates[0] = 1;

    const applyDpTransition = (currentDpArray, edgeMaskValue) => {
        const nextDpArray = createMultiDimArray(0, totalBitmaskStates);
        for (let stateIterator = 0; stateIterator < totalBitmaskStates; stateIterator++) {
            if (currentDpArray[stateIterator] === 0) continue;

            if (edgeMaskValue === 0) {
                nextDpArray[stateIterator] += currentDpArray[stateIterator] * 2;
            } else {
                nextDpArray[stateIterator | edgeMaskValue] += currentDpArray[stateIterator];
                nextDpArray[stateIterator] += currentDpArray[stateIterator];
            }
        }
        return nextDpArray;
    };

    for (let edgeIterator = 0; edgeIterator < nodeCount - 1; edgeIterator++) {
        dpStates = applyDpTransition(dpStates, edgeBitmasks[edgeIterator]);
    }

    return dpStates[totalBitmaskStates - 1];
}

function findPathDFS(currentNode, targetNode, parentNode, currentPathAccumulator) {
    currentPathAccumulator.push(currentNode);
    if (targetNode === currentNode) {
        return currentPathAccumulator;
    }

    for (const neighborNode of adjacencyList[currentNode]) {
        if (neighborNode === parentNode) {
            continue;
        }
        const pathFound = findPathDFS(neighborNode, targetNode, currentNode, currentPathAccumulator);
        if (pathFound) {
            return pathFound;
        }
    }
    currentPathAccumulator.pop();
    return null;
}

const problemResult = solveProblem();
if (problemResult !== undefined) {
    console.log(problemResult);
}
