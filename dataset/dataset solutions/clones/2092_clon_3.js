"use strict";
const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const inputTokens = fileContent.split(/ |\n/);
let currentTokenIndex = 0;

function readNextTokenAsNumber() {
    return +inputTokens[currentTokenIndex++];
}

function readNumericTokensArray(count) {
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(readNextTokenAsNumber());
    }
    return result;
}

function readNumericMatrix(height, width) {
    const matrix = [];
    for (let i = 0; i < height; i++) {
        matrix.push(readNumericTokensArray(width));
    }
    return matrix;
}

function createDynamicArray(initialValue) {
    const args = arguments;
    let argLength = args.length;
    let arrayCreationString = "Array(args[" + --argLength + "]).fill().map(x=>{return " + initialValue + ";})";
    while (--argLength) {
        arrayCreationString = "Array(args[" + argLength + "]).fill().map(x=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

let totalNodes;
let adjList;
let nodeDepths;
let finalAssignments;

function performDFS(currentVertex, parentVertex, currentDepthLevel) {
    nodeDepths[currentVertex] = currentDepthLevel;
    const neighbors = adjList[currentVertex];
    for (let i = 0; i < neighbors.length; i++) {
        const neighborVertex = neighbors[i];
        if (neighborVertex === parentVertex) {
            continue;
        }
        performDFS(neighborVertex, currentVertex, currentDepthLevel + 1);
    }
}

function executeSolution() {
    totalNodes = readNextTokenAsNumber();
    adjList = createDynamicArray("[]", totalNodes);
    nodeDepths = Array(totalNodes);
    finalAssignments = Array(totalNodes);

    for (let i = 0; i < totalNodes - 1; i++) {
        const nodeA = readNextTokenAsNumber() - 1;
        const nodeB = readNextTokenAsNumber() - 1;
        adjList[nodeA].push(nodeB);
        adjList[nodeB].push(nodeA);
    }

    performDFS(0, -1, 0);

    let oddDepthCount = 0;
    let evenDepthCount = 0;

    for (let i = 0; i < totalNodes; i++) {
        const currentParity = nodeDepths[i] % 2;
        finalAssignments[i] = currentParity;
        if (currentParity === 1) {
            oddDepthCount++;
        } else {
            evenDepthCount++;
        }
    }

    const groupOneSize = Math.ceil(totalNodes / 3);
    const groupThreeSize = Math.floor(totalNodes / 3);
    const groupTwoSize = totalNodes - groupOneSize - groupThreeSize;

    let assignValOne = 1;
    let assignValTwo = 2;
    let assignValThree = 3;

    if (oddDepthCount <= groupThreeSize) {
        for (let i = 0; i < totalNodes; i++) {
            if (finalAssignments[i] === 1) {
                finalAssignments[i] = assignValThree;
                assignValThree += 3;
            } else {
                let assignedValue = null;
                if (assignValOne <= totalNodes) {
                    assignedValue = assignValOne;
                    assignValOne += 3;
                } else if (assignValTwo <= totalNodes) {
                    assignedValue = assignValTwo;
                    assignValTwo += 3;
                } else {
                    assignedValue = assignValThree;
                    assignValThree += 3;
                }
                finalAssignments[i] = assignedValue;
            }
        }
    } else if (evenDepthCount <= groupThreeSize) {
        for (let i = 0; i < totalNodes; i++) {
            if (finalAssignments[i] === 0) {
                finalAssignments[i] = assignValThree;
                assignValThree += 3;
            } else {
                let assignedValue = null;
                if (assignValOne <= totalNodes) {
                    assignedValue = assignValOne;
                    assignValOne += 3;
                } else if (assignValTwo <= totalNodes) {
                    assignedValue = assignValTwo;
                    assignValTwo += 3;
                } else {
                    assignedValue = assignValThree;
                    assignValThree += 3;
                }
                finalAssignments[i] = assignedValue;
            }
        }
    } else {
        for (let i = 0; i < totalNodes; i++) {
            let assignedValue = null;
            if (finalAssignments[i] === 1) {
                if (assignValOne <= totalNodes) {
                    assignedValue = assignValOne;
                    assignValOne += 3;
                } else {
                    assignedValue = assignValThree;
                    assignValThree += 3;
                }
            } else {
                if (assignValTwo <= totalNodes) {
                    assignedValue = assignValTwo;
                    assignValTwo += 3;
                } else {
                    assignedValue = assignValThree;
                    assignValThree += 3;
                }
            }
            finalAssignments[i] = assignedValue;
        }
    }
    
    return finalAssignments.join(" ");
}

if (process.argv.length <= 2) {
    require("child_process").fork("Main.js", ["1"], { execArgv: ["--stack-size=240000"] });
} else {
    const solutionResult = executeSolution();
    if (solutionResult !== undefined) {
        console.log(solutionResult);
    }
}
