"use strict";

const processInput = (inputString) => {
    const processedLines = inputString.trim().split("\n");

    const headerParts = processedLines[0].split(" ");
    const totalNodes = parseInt(headerParts[0], 10);
    const totalEdges = parseInt(headerParts[1], 10);

    const edgeDescriptions = processedLines.slice(1, totalEdges + 1);

    const connectionCounts = Array.from({ length: totalNodes }, () => 0);
    let finalOutcome = "IMPOSSIBLE";

    const parseEdgeData = (edgeLine) => {
        return edgeLine.split(" ").map(val => parseInt(val, 10));
    };

    const initialNodeIdentifier = 1;
    const terminalNodeIdentifier = totalNodes;

    for (let edgeIdx = 0; edgeIdx < totalEdges; edgeIdx++) {
        const currentEdgePair = parseEdgeData(edgeDescriptions[edgeIdx]);
        const originNode = currentEdgePair[0];
        const destinationNode = currentEdgePair[1];

        if (originNode === initialNodeIdentifier) {
            if (connectionCounts[destinationNode] === terminalNodeIdentifier) {
                finalOutcome = "POSSIBLE";
                break;
            } else {
                connectionCounts[destinationNode]++;
            }
        }

        if (destinationNode === terminalNodeIdentifier) {
            if (connectionCounts[originNode] === initialNodeIdentifier) {
                finalOutcome = "POSSIBLE";
                break;
            } else {
                connectionCounts[originNode]++;
            }
        }
    }

    console.log(finalOutcome);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
