"use strict";
const extractNumbers = (rawData) => {
    return rawData
        .trim()
        .split('\n')
        .flatMap(line => line.trim().split(' ').filter(Boolean))
        .map(Number);
};

const analyzeGraphProperties = (numericData) => {
    const totalVertices = numericData[0];
    const totalEdges = numericData[1];

    const nodeConnectionCounts = new Map();

    for (let currentVertex = 1; currentVertex <= totalVertices; currentVertex++) {
        nodeConnectionCounts.set(currentVertex, 0);
    }

    for (let i = 2; i < numericData.length; i += 2) {
        const firstVertex = numericData[i];
        const secondVertex = numericData[i + 1];

        nodeConnectionCounts.set(firstVertex, nodeConnectionCounts.get(firstVertex) + 1);
        nodeConnectionCounts.set(secondVertex, nodeConnectionCounts.get(secondVertex) + 1);
    }

    const allDegrees = Array.from(nodeConnectionCounts.values());

    const hasSpecificDegree = allDegrees.some(degreeVal => degreeVal === 6);
    const allDegreesEven = allDegrees.every(degreeVal => degreeVal % 2 === 0);

    return (hasSpecificDegree && allDegreesEven) ? "Yes" : "No";
};

const rawInputText = require("fs").readFileSync("/dev/stdin", "utf8");
const parsedNumbers = extractNumbers(rawInputText);
console.log(analyzeGraphProperties(parsedNumbers));