"use strict";

class InputProcessor {
    constructor(inputString) {
        this.tokens = inputString.split(/ |\n/);
        this.currentIndex = 0;
    }

    getNext(isString) {
        const token = this.tokens[this.currentIndex++];
        return isString ? token : +token;
    }

    getMultiple(count, isString) {
        const slicedTokens = this.tokens.slice(this.currentIndex, this.currentIndex + count);
        this.currentIndex += count;
        return isString ? slicedTokens : slicedTokens.map(val => +val);
    }

    getMatrix(height, width, isString) {
        const matrix = [];
        for (let i = 0; i < height; i++) {
            const rowTokens = this.tokens.slice(this.currentIndex, this.currentIndex + width);
            this.currentIndex += width;
            matrix.push(isString ? rowTokens : rowTokens.map(val => +val));
        }
        return matrix;
    }
}

function initializeMultiDimArray(initialValue) {
    const args = arguments;
    let len = args.length;
    let arrayCreationExpr = `Array(args[${--len}]).fill().map(x=>{return ${initialValue};})`;
    while (--len) {
        arrayCreationExpr = `Array(args[${len}]).fill().map(x=>${arrayCreationExpr})`;
    }
    return eval(arrayCreationExpr);
}

let nodeCount_g;
let adjacencyList_g;
let nodeDepth_g;
let parentNode_g;
let resultArray_g;
let nodesAtDepth_g;

function traverseGraphDFS(currentNodeId, parentId, currentDepthLevel) {
    nodeDepth_g[currentNodeId] = currentDepthLevel;
    nodesAtDepth_g[currentDepthLevel].push(currentNodeId);
    parentNode_g[currentNodeId] = parentId;

    for (const neighborId of adjacencyList_g[currentNodeId]) {
        const numericNeighborId = +neighborId;
        if (numericNeighborId === parentId) continue;
        traverseGraphDFS(numericNeighborId, currentNodeId, currentDepthLevel + 1);
    }
}

function executeMainLogic() {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const inputReader = new InputProcessor(fileContent);

    nodeCount_g = inputReader.getNext();
    adjacencyList_g = initializeMultiDimArray("[]", nodeCount_g);
    nodeDepth_g = Array(nodeCount_g);
    nodesAtDepth_g = initializeMultiDimArray("[]", nodeCount_g);
    parentNode_g = Array(nodeCount_g);
    resultArray_g = Array(nodeCount_g);

    for (let i = 1; i < nodeCount_g; i++) {
        const u = inputReader.getNext() - 1;
        const v = inputReader.getNext() - 1;
        adjacencyList_g[u].push(v);
        adjacencyList_g[v].push(u);
    }

    traverseGraphDFS(0, -1, 0);

    let oddDepthNodeCount = 0;
    let evenDepthNodeCount = 0;

    for (let i = 0; i < nodeCount_g; i++) {
        const currentParity = nodeDepth_g[i] % 2;
        resultArray_g[i] = currentParity;
        if (currentParity === 1) {
            oddDepthNodeCount++;
        } else {
            evenDepthNodeCount++;
        }
    }

    const targetGroupSize3 = nodeCount_g / 3 | 0;
    const targetGroupSize1 = Math.ceil(nodeCount_g / 3);

    let nextValueForGroup1 = 1;
    let nextValueForGroup2 = 2;
    let nextValueForGroup3 = 3;

    if (oddDepthNodeCount <= targetGroupSize3) {
        for (let i = 0; i < nodeCount_g; i++) {
            if (resultArray_g[i] === 1) {
                resultArray_g[i] = nextValueForGroup3;
                nextValueForGroup3 += 3;
            } else {
                let assignedValue;
                if (nextValueForGroup1 <= nodeCount_g) {
                    assignedValue = nextValueForGroup1;
                    nextValueForGroup1 += 3;
                } else if (nextValueForGroup2 <= nodeCount_g) {
                    assignedValue = nextValueForGroup2;
                    nextValueForGroup2 += 3;
                } else {
                    assignedValue = nextValueForGroup3;
                    nextValueForGroup3 += 3;
                }
                resultArray_g[i] = assignedValue;
            }
        }
    } else if (evenDepthNodeCount <= targetGroupSize3) {
        for (let i = 0; i < nodeCount_g; i++) {
            if (resultArray_g[i] === 0) {
                resultArray_g[i] = nextValueForGroup3;
                nextValueForGroup3 += 3;
            } else {
                let assignedValue;
                if (nextValueForGroup1 <= nodeCount_g) {
                    assignedValue = nextValueForGroup1;
                    nextValueForGroup1 += 3;
                } else if (nextValueForGroup2 <= nodeCount_g) {
                    assignedValue = nextValueForGroup2;
                    nextValueForGroup2 += 3;
                } else {
                    assignedValue = nextValueForGroup3;
                    nextValueForGroup3 += 3;
                }
                resultArray_g[i] = assignedValue;
            }
        }
    } else {
        for (let i = 0; i < nodeCount_g; i++) {
            if (resultArray_g[i] === 1) {
                let assignedValue;
                if (nextValueForGroup1 <= nodeCount_g) {
                    assignedValue = nextValueForGroup1;
                    nextValueForGroup1 += 3;
                } else {
                    assignedValue = nextValueForGroup3;
                    nextValueForGroup3 += 3;
                }
                resultArray_g[i] = assignedValue;
            } else {
                let assignedValue;
                if (nextValueForGroup2 <= nodeCount_g) {
                    assignedValue = nextValueForGroup2;
                    nextValueForGroup2 += 3;
                } else {
                    assignedValue = nextValueForGroup3;
                    nextValueForGroup3 += 3;
                }
                resultArray_g[i] = assignedValue;
            }
        }
    }

    return resultArray_g.join(" ");
}

if (process.argv.length <= 2) {
    require("child_process").fork("Main.js", ["1"], { execArgv: ["--stack-size=240000"] });
} else {
    const programOutput = executeMainLogic();
    if (programOutput !== undefined) {
        console.log(programOutput);
    }
}
