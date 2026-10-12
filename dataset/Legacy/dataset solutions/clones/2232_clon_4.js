class SourceReader {
    constructor(rawInputContent) {
        this.inputLines = rawInputContent.trim().split("\n");
        this.currentLinePointer = 0;
        this.currentLineTokenBuffer = [];
    }

    // Replicates GET.a() behavior: reads tokens from right-to-left on each line
    extractNextValue(returnAsString = false) {
        if (this.currentLineTokenBuffer.length === 0) {
            if (this.currentLinePointer >= this.inputLines.length) {
                throw new Error("End of input reached.");
            }
            this.currentLineTokenBuffer = this.inputLines[this.currentLinePointer].split(" ").reverse();
            this.currentLinePointer++;
        }
        const token = this.currentLineTokenBuffer.pop();
        return returnAsString ? token : +token;
    }

    // Replicates GET.l() behavior
    extractFullLine(returnAsString = false) {
        if (this.currentLinePointer >= this.inputLines.length) {
            throw new Error("End of input reached.");
        }
        const lineTokens = this.inputLines[this.currentLinePointer].split(" ");
        this.currentLinePointer++;
        return returnAsString ? lineTokens : lineTokens.map(Number);
    }

    // Replicates GET.m() behavior
    extractValueMatrix(numRows, returnAsString = false) {
        const matrix = [];
        for (let i = 0; i < numRows; i++) {
            matrix.push(this.extractFullLine(returnAsString));
        }
        return matrix;
    }

    // Replicates GET.r() behavior
    extractRawLines(numRows, returnAsString = false) {
        const lines = [];
        for (let i = 0; i < numRows; i++) {
            if (this.currentLinePointer >= this.inputLines.length) {
                throw new Error("End of input reached.");
            }
            const lineContent = this.inputLines[this.currentLinePointer];
            this.currentLinePointer++;
            lines.push(returnAsString ? lineContent : +lineContent);
        }
        return lines;
    }
}

function createMultiDimArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }

    const buildArray = (dims, currentDimIdx) => {
        if (currentDimIdx === dims.length - 1) {
            return Array.from({ length: dims[currentDimIdx] }, () => initialValue);
        } else {
            return Array.from({ length: dims[currentDimIdx] }, () =>
                buildArray(dims, currentDimIdx + 1)
            );
        }
    };

    return buildArray(dimensions, 0);
}

var adjacencyMap;
var edgeQueryMasks;

var programOutput = executeMainLogic();
if (programOutput !== undefined) console.log(programOutput);

function executeMainLogic() {
    var inputSource = new SourceReader(require("fs").readFileSync("/dev/stdin", "utf8"));

    var nodeCount = inputSource.extractNextValue();
    var edgeDetails = []; // Stores {u, v, originalIndex}
    var edgeLookupMap = new Map(); // Key: "min-max", Value: originalIndex

    adjacencyMap = createMultiDimArray([], nodeCount);
    edgeQueryMasks = createMultiDimArray(0, nodeCount - 1);

    for (var i = 0; i < nodeCount - 1; i++) {
        var nodeS = inputSource.extractNextValue() - 1;
        var nodeT = inputSource.extractNextValue() - 1;
        
        var minNode = Math.min(nodeS, nodeT);
        var maxNode = Math.max(nodeS, nodeT);

        edgeDetails[i] = { u: minNode, v: maxNode, originalIndex: i };
        edgeLookupMap.set(`${minNode}-${maxNode}`, i);

        adjacencyMap[nodeS].push(nodeT);
        adjacencyMap[nodeT].push(nodeS);
    }

    var queryCount = inputSource.extractNextValue();
    for (var i = 0; i < queryCount; i++) {
        var queryStart = inputSource.extractNextValue() - 1;
        var queryEnd = inputSource.extractNextValue() - 1;
        var currentQueryBit = 1 << i;

        var pathNodes = findPathIterative(queryStart, queryEnd, adjacencyMap);
        
        if (pathNodes) {
            for (var j = 1; j < pathNodes.length; j++) {
                var pathNode1 = pathNodes[j - 1];
                var pathNode2 = pathNodes[j];
                
                var edgeNode1 = Math.min(pathNode1, pathNode2);
                var edgeNode2 = Math.max(pathNode1, pathNode2);
                
                var edgeKey = `${edgeNode1}-${edgeNode2}`;
                var edgeIdx = edgeLookupMap.get(edgeKey);
                
                if (edgeIdx !== undefined) {
                    edgeQueryMasks[edgeIdx] |= currentQueryBit;
                }
            }
        }
    }

    var totalMaskStates = 1 << queryCount;
    var maskCombinations = createMultiDimArray(0, totalMaskStates);
    maskCombinations[0] = 1;

    for (var j = 0; j < nodeCount - 1; j++) {
        var currentEdgeMask = edgeQueryMasks[j];
        if (currentEdgeMask === 0) {
            maskCombinations = maskCombinations.map(count => count * 2);
        } else {
            maskCombinations = maskCombinations.reduce((accumulator, currentCount, mask) => {
                if (currentCount > 0) {
                    accumulator[mask] += currentCount; // Option 1: Exclude current edge
                    accumulator[mask | currentEdgeMask] += currentCount; // Option 2: Include current edge
                }
                return accumulator;
            }, new Array(totalMaskStates).fill(0));
        }
    }
    return maskCombinations[totalMaskStates - 1];
}

function findPathIterative(startNode, targetNode, graphStructure) {
    const traversalStack = [[startNode, null]]; // [currentNode, parentNode]
    const visitedNodes = new Set();
    const parentTrace = new Map(); // Maps child node to its parent node in the path

    visitedNodes.add(startNode);

    while (traversalStack.length > 0) {
        const [currentNode, parentNode] = traversalStack.pop();

        parentTrace.set(currentNode, parentNode);

        if (currentNode === targetNode) {
            // Path found, reconstruct it from parentTrace
            const pathReconstruction = [];
            let currentPathNode = targetNode;
            while (currentPathNode !== null) {
                pathReconstruction.unshift(currentPathNode);
                currentPathNode = parentTrace.get(currentPathNode);
            }
            return pathReconstruction;
        }

        for (const neighbor of graphStructure[currentNode]) {
            if (!visitedNodes.has(neighbor)) {
                visitedNodes.add(neighbor);
                traversalStack.push([neighbor, currentNode]);
            }
        }
    }
    return null; // Should not be reached in a connected tree for valid start/target
}
