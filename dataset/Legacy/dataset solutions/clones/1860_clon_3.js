"use strict";
const STD_IN_PATH = "/dev/stdin";

let rawInputData = require("fs").readFileSync(STD_IN_PATH, "utf8");

let inputTokens = rawInputData.trim().split(/ |\n/);
let currentTokenIndex = 0;

function readNextNumber() {
    return +inputTokens[currentTokenIndex++];
}

function solveGraphProblem() {
    let nodeCount = readNextNumber();
    let edgeCount = readNextNumber();

    let adjacencyList = Array.from({ length: nodeCount + 1 }, () => []);

    for (let i = 0; i < edgeCount; i++) {
        let nodeA = readNextNumber();
        let nodeB = readNextNumber();
        adjacencyList[nodeA].push(nodeB);
        adjacencyList[nodeB].push(nodeA);
    }

    let parentTracker = new Array(nodeCount + 1);
    parentTracker[0] = "Yes";

    let unvisitedStatus = new Array(nodeCount + 1).fill(true);
    unvisitedStatus[1] = false;
    
    let unvisitedNodeCount = nodeCount - 1;

    let bfsQueue = [1];

    while (unvisitedNodeCount > 0) {
        let nextLevelQueue = [];
        
        for (let i = 0; i < bfsQueue.length; i++) {
            let currentNode = bfsQueue[i];

            for (let j = 0; j < adjacencyList[currentNode].length; j++) {
                let neighborNode = adjacencyList[currentNode][j];

                if (unvisitedStatus[neighborNode]) {
                    parentTracker[neighborNode] = currentNode;
                    unvisitedStatus[neighborNode] = false;
                    unvisitedNodeCount--;
                    nextLevelQueue.push(neighborNode);
                }
            }
        }
        bfsQueue = nextLevelQueue;
    }

    parentTracker.splice(1, 1);

    console.log(parentTracker.join("\n"));
}

solveGraphProblem();
