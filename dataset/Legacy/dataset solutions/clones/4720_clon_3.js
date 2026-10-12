"use strict";

const parseInputLines = (rawData) => rawData.trim().split("\n");

const createAdjacencyMatrix = (size) => {
    return Array.from({ length: size }, () => Array(size).fill(0));
};

const processInput = (rawInput) => {
    const inputLines = parseInputLines(rawInput);

    const firstLineParts = inputLines[0].split(" ");
    const nodeCount = parseInt(firstLineParts[0], 10);
    const edgeCount = parseInt(firstLineParts[1], 10);

    const edgeConnections = inputLines.slice(1, nodeCount + 1).map(line =>
        line.split(" ").map(val => parseInt(val, 10))
    );

    const adjMatrix = createAdjacencyMatrix(nodeCount);

    for (const edge of edgeConnections) {
        const sourceIdx = edge[0] - 1;
        const targetIdx = edge[1] - 1;

        adjMatrix[sourceIdx][targetIdx] = 1;
        adjMatrix[targetIdx][sourceIdx] = 1;
    }

    let totalPaths = 0;

    const findHamiltonianPaths = (currentVertex, visitedState) => {
        const allNodesVisited = visitedState.every(status => status === true);
        if (allNodesVisited) {
            totalPaths++;
            return;
        }

        for (let neighborVertex = 0; neighborVertex < nodeCount; neighborVertex++) {
            const hasEdge = adjMatrix[currentVertex][neighborVertex] === 1;
            const isVisited = visitedState[neighborVertex];

            if (hasEdge && !isVisited) {
                visitedState[neighborVertex] = true;
                findHamiltonianPaths(neighborVertex, visitedState);
                visitedState[neighborVertex] = false;
            }
        }
    };

    const initialVisitedState = Array.from({ length: nodeCount }, (_, idx) => idx === 0);
    findHamiltonianPaths(0, initialVisitedState);

    console.log(totalPaths);
};

const execute = () => {
    const stdinPath = '/dev/stdin';
    const fileContent = require('fs').readFileSync(stdinPath, 'utf8');
    processInput(fileContent);
};

execute();
