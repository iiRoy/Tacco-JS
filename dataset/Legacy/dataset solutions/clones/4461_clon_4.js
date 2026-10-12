"use strict";

const processGraphData = (inputContent) => {
    const dataLines = inputContent.trim().split("\n");
    const [graphNodeCountText, graphEdgeCountText] = dataLines[0].split(" ");
    const graphNodeCount = parseInt(graphNodeCountText);
    const graphEdgeCount = parseInt(graphEdgeCountText);

    const graphConnections = dataLines.slice(1, graphEdgeCount + 1).map(connectionLine => {
        const [originIdentifier, destinationIdentifier] = connectionLine.split(" ").map(Number);
        return { originIdentifier, destinationIdentifier };
    });

    const processingResult = graphConnections.reduce((accumulator, currentConnection) => {
        if (accumulator.pathEstablished) {
            return accumulator;
        }

        const { originIdentifier, destinationIdentifier } = currentConnection;

        if (originIdentifier === 1) {
            accumulator.nodesFromInitial.add(destinationIdentifier);
            if (accumulator.nodesToTerminal.has(destinationIdentifier)) {
                accumulator.pathEstablished = true;
            }
        }

        if (destinationIdentifier === graphNodeCount) {
            accumulator.nodesToTerminal.add(originIdentifier);
            if (accumulator.nodesFromInitial.has(originIdentifier)) {
                accumulator.pathEstablished = true;
            }
        }
        return accumulator;
    }, {
        nodesFromInitial: new Set(),
        nodesToTerminal: new Set(),
        pathEstablished: false
    });

    console.log(processingResult.pathEstablished ? "POSSIBLE" : "IMPOSSIBLE");
};

processGraphData(require('fs').readFileSync('/dev/stdin', 'utf8'));
