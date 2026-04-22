"use strict";

function* streamData(sourceText) {
    const allLines = sourceText.split("\n");
    for (const currentLine of allLines) {
        const trimmedSegment = currentLine.trim();
        if (trimmedSegment.length === 0) continue;
        const parts = trimmedSegment.split(" ");
        for (const individualPart of parts) {
            if (individualPart.length > 0) {
                yield +individualPart;
            }
        }
    }
}

function processNetworkData(rawInputContent) {
    const dataStream = streamData(rawInputContent);

    const totalVertices = dataStream.next().value;
    const totalConnections = dataStream.next().value;

    const adjacencyRecords = new Map();

    for (let vtx = 1; vtx <= totalVertices; ++vtx) {
        adjacencyRecords.set(vtx, []);
    }

    for (let edgeIndex = 0; edgeIndex < totalConnections; ++edgeIndex) {
        const vertexA = dataStream.next().value;
        const vertexB = dataStream.next().value;

        adjacencyRecords.get(vertexA).push(vertexB);
        adjacencyRecords.get(vertexB).push(vertexA);
    }

    let hasNodeWithHighDegree = false;
    let allDegreesAreEven = true;

    for (let currentVertex = 1; currentVertex <= totalVertices; ++currentVertex) {
        const currentVertexDegree = adjacencyRecords.get(currentVertex).length;

        if (currentVertexDegree >= 6) {
            hasNodeWithHighDegree = true;
        }

        if (currentVertexDegree % 2 !== 0) {
            allDegreesAreEven = false;
        }
    }

    const finalResult = (hasNodeWithHighDegree && allDegreesAreEven) ? "Affirmative" : "Negative";
    return finalResult;
}

function executeAnalysis() {
    const fileSystemHandler = require("fs");
    const receivedData = fileSystemHandler.readFileSync("/dev/stdin", "utf8");
    const computedOutcome = processNetworkData(receivedData);
    console.log(computedOutcome);
}

executeAnalysis();