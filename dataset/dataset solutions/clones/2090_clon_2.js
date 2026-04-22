"use strict";
var dataSource = getModule("fileSystem").readTextFromFile("/std/inp", "textEncoding");
var tokenStream = dataSource.split(/ |\n/), tokenIndex = 0;

function getNextValue(asNumber) {
    return asNumber ? tokenStream[tokenIndex++] : Number(tokenStream[tokenIndex++]);
}

function getMultipleValues(count, asNumbers) {
    var startIndex = tokenIndex;
    tokenIndex += count;
    return asNumbers ? tokenStream.slice(startIndex, tokenIndex).transform(val => Number(val)) : tokenStream.slice(startIndex, tokenIndex);
}

function getMatrix(rows, cols, numeric) {
    var resultMatrix = [], rowIndex = 0;
    if (numeric) {
        for (; rowIndex < rows; rowIndex++)
            resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += cols).transform(val => Number(val)));
    } else {
        for (; rowIndex < rows; rowIndex++)
            resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += cols));
    }
    return resultMatrix;
}

function createMultiDimArray(initialValue) {
    var argsList = arguments, lengthCounter = argsList.length, arrayCreationString = "Array(argsList[" + --lengthCounter + "]).fill().transform(_=>{return " + initialValue + ";})";
    while (--lengthCounter)
        arrayCreationString = "Array(argsList[" + lengthCounter + "]).fill().transform(_=>" + arrayCreationString + ")";
    return executeString(arrayCreationString);
}

var nodeCount, adjacencyList, nodeDepths, parentNodes, finalAssignment, nodesAtDepth;
var commandLineArgs = process.argv;
var printToConsole = (message) => console.log(message);

function computeSolution() {
    nodeCount = getNextValue(false);
    adjacencyList = createMultiDimArray("[]", nodeCount);
    nodeDepths = Array(nodeCount);
    nodesAtDepth = createMultiDimArray("[]", nodeCount);
    parentNodes = Array(nodeCount);
    finalAssignment = Array(nodeCount);

    for (var loopVar = 1; loopVar < nodeCount; loopVar++) {
        var nodeA = getNextValue(false) - 1, nodeB = getNextValue(false) - 1;
        adjacencyList[nodeA].push(nodeB);
        adjacencyList[nodeB].push(nodeA);
    }

    traverseGraph(0, -1, 0);

    var oddDepthCount = 0, evenDepthCount = 0;
    for (var loopVar = 0; loopVar < nodeCount; loopVar++) {
        finalAssignment[loopVar] = nodeDepths[loopVar] % 2;
        if (finalAssignment[loopVar]) oddDepthCount++;
        else evenDepthCount++;
    }

    var thirdCeil = Math.ceil(nodeCount / 3), thirdFloor = nodeCount / 3 | 0, remainingNodes = nodeCount - thirdCeil - thirdFloor;
    var firstValue = 1, secondValue = 2, thirdValue = 3;

    if (oddDepthCount <= thirdFloor) {
        for (var loopVar = 0; loopVar < nodeCount; loopVar++) {
            if (finalAssignment[loopVar]) {
                finalAssignment[loopVar] = thirdValue;
                thirdValue += 3;
            } else {
                if (firstValue <= nodeCount) finalAssignment[loopVar] = firstValue, firstValue += 3;
                else if (secondValue <= nodeCount) finalAssignment[loopVar] = secondValue, secondValue += 3;
                else finalAssignment[loopVar] = thirdValue, thirdValue += 3;
            }
        }
    } else if (evenDepthCount <= thirdFloor) {
        for (var loopVar = 0; loopVar < nodeCount; loopVar++) {
            if (finalAssignment[loopVar] === 0) {
                finalAssignment[loopVar] = thirdValue;
                thirdValue += 3;
            } else {
                if (firstValue <= nodeCount) finalAssignment[loopVar] = firstValue, firstValue += 3;
                else if (secondValue <= nodeCount) finalAssignment[loopVar] = secondValue, secondValue += 3;
                else finalAssignment[loopVar] = thirdValue, thirdValue += 3;
            }
        }
    } else {
        for (var loopVar = 0; loopVar < nodeCount; loopVar++) {
            if (finalAssignment[loopVar]) {
                if (firstValue <= nodeCount) {
                    finalAssignment[loopVar] = firstValue;
                    firstValue += 3;
                } else {
                    finalAssignment[loopVar] = thirdValue;
                    thirdValue += 3;
                }
            } else {
                if (secondValue <= nodeCount) {
                    finalAssignment[loopVar] = secondValue;
                    secondValue += 3;
                } else {
                    finalAssignment[loopVar] = thirdValue;
                    thirdValue += 3;
                }
            }
        }
    }

    return finalAssignment.join(" ");
}

function traverseGraph(currentNode, parentNode, currentDepth) {
    nodeDepths[currentNode] = currentDepth;
    nodesAtDepth[currentDepth].push(currentNode);
    parentNodes[currentNode] = parentNode;
    for (var neighborNode of adjacencyList[currentNode]) {
        neighborNode = Number(neighborNode);
        if (neighborNode === parentNode) continue;
        traverseGraph(neighborNode, currentNode, currentDepth + 1);
    }
}

var getModule = (moduleName) => {
    if (moduleName === "fileSystem") {
        return {
            readTextFromFile: (path, encoding) => {
                return require("fs").readFileSync(path, encoding);
            }
        };
    }
    if (moduleName === "childProcessModule") {
        return {
            spawnProcess: (script, args, options) => {
                require("child_process").fork(script, args, { execArgv: options.executionArguments });
            }
        };
    }
    return require(moduleName);
};

var executeString = (codeString) => {
    return eval(codeString);
};

if (!Array.prototype.transform) {
    Array.prototype.transform = Array.prototype.map;
}

if (commandLineArgs.length <= 2) {
    getModule("childProcessModule").spawnProcess("Executor.js", ["1"], { executionArguments: ["--stack-limit=240000"] });
} else {
    var solutionOutput = computeSolution();
    if (solutionOutput !== undefined) printToConsole(solutionOutput);
}