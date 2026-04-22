"use strict";
const sourceText = require("fs").readFileSync("/dev/stdin", "utf8");
const tokenStream = sourceText.trim().split(/\s+/);
let positionIndex = 0;
const grabNumericToken = () => Number(tokenStream[positionIndex++]);

const totalNodes = grabNumericToken();
const totalEdges = grabNumericToken();

const linkMap = new Map();
Array.from({ length: totalEdges }).forEach(() => {
    const fromNode = grabNumericToken();
    const toNode = grabNumericToken();
    if (!linkMap.has(fromNode)) linkMap.set(fromNode, new Set());
    if (!linkMap.has(toNode)) linkMap.set(toNode, new Set());
    linkMap.get(fromNode).add(toNode);
    linkMap.get(toNode).add(fromNode);
});

const parentAssignments = new Map();
const visitedSet = new Set();

const explorePaths = (currentLevelNodes) => {
    if (currentLevelNodes.length === 0) {
        return;
    }

    const nextLevelNodes = [];
    currentLevelNodes.forEach(currentNodeIdentifier => {
        const connectedIdentifiers = linkMap.get(currentNodeIdentifier);
        if (connectedIdentifiers) {
            connectedIdentifiers.forEach(neighborIdentifier => {
                if (!visitedSet.has(neighborIdentifier)) {
                    visitedSet.add(neighborIdentifier);
                    parentAssignments.set(neighborIdentifier, currentNodeIdentifier);
                    nextLevelNodes.push(neighborIdentifier);
                }
            });
        }
    });
    explorePaths(nextLevelNodes);
};

visitedSet.add(1);
explorePaths([1]);

const finalResult = ["Yes"];
for (let nodeIdx = 2; nodeIdx <= totalNodes; nodeIdx++) {
    finalResult.push(parentAssignments.get(nodeIdx));
}
console.log(finalResult.join("\n"));