"use strict";

function* inputTokenGenerator(inputString, valueParser = Number) {
    const lineIterator = inputString.split("\n")[Symbol.iterator]();
    let currentLineResult = lineIterator.next();
    let tokenBuffer = [];

    while (!currentLineResult.done || tokenBuffer.length > 0) {
        if (tokenBuffer.length === 0) {
            if (currentLineResult.done) {
                return;
            }
            tokenBuffer = currentLineResult.value.trim().split(" ").filter(t => t !== "");
            currentLineResult = lineIterator.next();
        }
        if (tokenBuffer.length > 0) {
            yield valueParser(tokenBuffer.shift());
        }
    }
}

function analyzeGraphProperties(sourceData) {
    const dataStream = inputTokenGenerator(sourceData);

    const totalNodes = dataStream.next().value;
    const totalEdges = dataStream.next().value;

    const graphConnections = new Map();

    for (let i = 1; i <= totalNodes; i++) {
        graphConnections.set(i, new Set());
    }

    for (let i = 0; i < totalEdges; i++) {
        const nodeA = dataStream.next().value;
        const nodeB = dataStream.next().value;

        if (!graphConnections.has(nodeA)) graphConnections.set(nodeA, new Set());
        if (!graphConnections.has(nodeB)) graphConnections.set(nodeB, new Set());

        graphConnections.get(nodeA).add(nodeB);
        graphConnections.get(nodeB).add(nodeA);
    }

    const allDegrees = [];
    for (let i = 1; i <= totalNodes; i++) {
        allDegrees.push(graphConnections.get(i).size);
    }

    const hasHighDegreeNode = allDegrees.some(degreeValue => degreeValue >= 6);
    const allDegreesAreEven = allDegrees.every(degreeValue => degreeValue % 2 === 0);

    return (hasHighDegreeNode && allDegreesAreEven) ? "Yes" : "No";
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(analyzeGraphProperties(fileContent));
