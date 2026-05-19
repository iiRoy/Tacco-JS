"use strict";

var InputReader = (function() {
    function createReader(sourceString) {
        return new ReaderInstance(sourceString);
    }

    function ReaderInstance(sourceString) {
        this._sourceLines = sourceString.trim().split("\n");
        this._currentLineIndex = 0;
    }

    function convertTokenToNumber(token, asString) {
        return asString ? token : +token;
    }

    ReaderInstance.prototype.readNextToken = function(asString) {
        var currentLineContent = this._sourceLines[this._currentLineIndex];
        if (typeof currentLineContent === "string") {
            this._sourceLines[this._currentLineIndex] = currentLineContent.split(" ").reverse();
        }
        var extractedToken = this._sourceLines[this._currentLineIndex].pop();
        if (!this._sourceLines[this._currentLineIndex].length) {
            this._currentLineIndex++;
        }
        return convertTokenToNumber(extractedToken, asString);
    };

    ReaderInstance.prototype.readLineTokens = function(asString) {
        var lineTokens = this._sourceLines[this._currentLineIndex++].split(" ");
        return asString ? lineTokens : lineTokens.map(token => +token);
    };

    ReaderInstance.prototype.readMatrix = function(rowCount, asString) {
        var matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + rowCount);
        this._currentLineIndex += rowCount;
        return asString ? matrixRows.map(row => row.split(" ")) : matrixRows.map(row => row.split(" ").map(token => +token));
    };

    ReaderInstance.prototype.readLines = function(rowCount, asString) {
        var lines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + rowCount);
        this._currentLineIndex += rowCount;
        return asString ? lines : lines.map(line => +line);
    };

    return createReader;
})();

var inputProcessor = InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }

    var currentDimensionSize = dimensions[0];
    var remainingDimensions = dimensions.slice(1);

    var newArray = new Array(currentDimensionSize);
    for (var i = 0; i < currentDimensionSize; i++) {
        newArray[i] = createMultiDimArray(initialValue, ...remainingDimensions);
    }
    return newArray;
}

var adjacencyList, edgeBitmasks;

var problemResult = solveProblem();
if (problemResult !== undefined) console.log(problemResult);

function solveProblem() {
    var nodeCount = inputProcessor.readNextToken();
    var edgeEndpointsA = [], edgeEndpointsB = [];

    adjacencyList = createMultiDimArray([], nodeCount);
    edgeBitmasks = createMultiDimArray(0, nodeCount - 1);

    function populateGraphEdges(numEdges) {
        for (var i = 0; i < numEdges; i++) {
            var node1 = inputProcessor.readNextToken() - 1;
            var node2 = inputProcessor.readNextToken() - 1;
            edgeEndpointsA[i] = Math.min(node1, node2);
            edgeEndpointsB[i] = Math.max(node1, node2);
            adjacencyList[node1].push(node2);
            adjacencyList[node2].push(node1);
        }
    }

    populateGraphEdges(nodeCount - 1);

    var queryCount = inputProcessor.readNextToken();

    function processAllQueries(numQueries, totalEdges) {
        for (var i = 0; i < numQueries; i++) {
            var queryStartNode = inputProcessor.readNextToken() - 1;
            var queryEndNode = inputProcessor.readNextToken() - 1;
            var currentQueryBit = 1 << i;

            var pathNodes = findPathDFS(queryStartNode, queryEndNode, -1, []);

            for (var j = 1; j < pathNodes.length; j++) {
                var edgeMinNode = Math.min(pathNodes[j - 1], pathNodes[j]);
                var edgeMaxNode = pathNodes[j - 1] + pathNodes[j] - edgeMinNode;
                
                for (var edgeIndex = 0; edgeIndex < totalEdges; edgeIndex++) {
                    if (edgeEndpointsA[edgeIndex] === edgeMinNode && edgeEndpointsB[edgeIndex] === edgeMaxNode) {
                        edgeBitmasks[edgeIndex] |= currentQueryBit;
                        break;
                    }
                }
            }
        }
    }

    processAllQueries(queryCount, nodeCount - 1);

    var maxBitmaskValue = 1 << queryCount;
    var dynamicProgrammingTable = createMultiDimArray(0, maxBitmaskValue);
    dynamicProgrammingTable[0] = 1;

    function computeDynamicProgramming(numEdges, totalMasks) {
        for (var edgeIterator = 0; edgeIterator < numEdges; edgeIterator++) {
            var currentEdgeMask = edgeBitmasks[edgeIterator];
            if (currentEdgeMask === 0) {
                for (var maskIterator = 0; maskIterator < totalMasks; maskIterator++) {
                    dynamicProgrammingTable[maskIterator] *= 2;
                }
            } else {
                for (var maskIterator = totalMasks - 1; maskIterator >= 0; maskIterator--) {
                    if ((maskIterator | currentEdgeMask) === maskIterator) {
                        dynamicProgrammingTable[maskIterator] *= 2;
                    } else {
                        dynamicProgrammingTable[maskIterator | currentEdgeMask] += dynamicProgrammingTable[maskIterator];
                    }
                }
            }
        }
    }

    computeDynamicProgramming(nodeCount - 1, maxBitmaskValue);

    return dynamicProgrammingTable[maxBitmaskValue - 1];
}

function findPathDFS(currentNode, targetNode, parentNode, currentPath) {
    currentPath.push(currentNode);

    if (currentNode === targetNode) {
        return currentPath;
    }

    for (var neighbor of adjacencyList[currentNode]) {
        if (neighbor === parentNode) {
            continue;
        }
        var foundPath = findPathDFS(neighbor, targetNode, currentNode, currentPath);
        if (foundPath) {
            return foundPath;
        }
    }

    currentPath.pop();
    return null;
}
