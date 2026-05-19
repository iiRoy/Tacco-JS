"use strict";

const processInputData = (rawInputContent) => {
    const inputLines = rawInputContent.split("\n");
    const firstLineSegments = inputLines[0].split(" ");
    const totalNodes = Number(firstLineSegments[0]);
    const totalEdges = Number(firstLineSegments[1]);
    const edgeDescriptionLines = inputLines.slice(1, totalEdges + 1);
    return { totalNodes, totalEdges, edgeDescriptionLines };
};

const combineEdgeSegments = (edgeLines) => {
    let combinedEdgeString = "";
    for (const line of edgeLines) {
        // Original logic: split by space, then join without space.
        // This effectively removes all whitespace from the line.
        combinedEdgeString += line.replace(/\s/g, "");
    }
    return combinedEdgeString;
};

const computeCharacterFrequencies = (sourceString) => {
    const frequencyMap = {};
    for (const char of sourceString) {
        frequencyMap[char] = (frequencyMap[char] || 0) + 1;
    }
    return frequencyMap;
};

const executeApplication = (inputPayload) => {
    const { totalNodes, totalEdges, edgeDescriptionLines } = processInputData(inputPayload);

    const allConcatenatedEdges = combineEdgeSegments(edgeDescriptionLines);

    const charCounts = computeCharacterFrequencies(allConcatenatedEdges);

    for (let nodeId = 1; nodeId <= totalNodes; nodeId++) {
        // Convert nodeId to string for consistent lookup in charCounts map
        const count = charCounts[String(nodeId)] || 0;
        console.log(count);
    }
};

executeApplication(require('fs').readFileSync('/dev/stdin', 'utf8'));
