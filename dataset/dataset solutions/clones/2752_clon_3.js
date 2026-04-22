const reportExecutionFailure = (issueCode = -1) => {
    console.log(issueCode.toString());
    process.exit(0);
};

function processGraphConfiguration(rawGraphData) {
    if (!rawGraphData || rawGraphData.trim().length === 0) {
        reportExecutionFailure("Empty input provided.");
    }

    let graphLines = rawGraphData.trim().split('\n');

    if (graphLines.length === 0) {
        reportExecutionFailure("No data lines detected.");
    }

    const dimensionInfoLine = graphLines[0];
    const dimensionComponents = dimensionInfoLine.split(' ');

    if (dimensionComponents.length < 2) {
        reportExecutionFailure("Malformed dimension line detected.");
    }

    const numberOfNodes = Number.parseInt(dimensionComponents[0], 10);
    const totalEdges = Number.parseInt(dimensionComponents[1], 10);

    if (totalEdges % 2 !== 0) {
        reportExecutionFailure();
    }

    graphLines.shift();

    const nodeConnections = new Map();

    for (let nodeIndex = 1; nodeIndex <= numberOfNodes; nodeIndex++) {
        nodeConnections.set(nodeIndex.toString(), []);
    }

    if (graphLines.length < totalEdges) {
        reportExecutionFailure("Insufficient edge definitions provided.");
    }

    for (let edgeIndex = 0; edgeIndex < totalEdges; edgeIndex++) {
        const currentEdgeDefinition = graphLines[edgeIndex];
        const connectedNodes = currentEdgeDefinition.split(' ');

        if (connectedNodes.length < 2) {
            reportExecutionFailure("Invalid edge format on data line " + (edgeIndex + 2) + ".");
        }

        const firstNodeIdentifier = connectedNodes[0];
        const secondNodeIdentifier = connectedNodes[1];

        if (!nodeConnections.has(firstNodeIdentifier) || !nodeConnections.has(secondNodeIdentifier)) {
            reportExecutionFailure("Edge references a non-existent node.");
        }
        
        nodeConnections.get(firstNodeIdentifier).push(secondNodeIdentifier);
        nodeConnections.get(secondNodeIdentifier).push(firstNodeIdentifier);
    }

    for (let currentNodeId = 1; currentNodeId <= numberOfNodes; currentNodeId++) {
        const currentIdString = currentNodeId.toString();
        const nodeDegree = nodeConnections.get(currentIdString).length;

        if (nodeDegree % 2 !== 0) {
            reportExecutionFailure();
        }
    }

    for (let traversalStep = 0; traversalStep < totalEdges; traversalStep++) {
        // Placeholder for potential future graph traversal or analysis steps.
    }
}

try {
    const fileSystemModule = require("fs");
    const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    processGraphConfiguration(standardInputContent);
} catch (inputError) {
    console.error("An unhandled system error occurred:", inputError.message);
    process.exit(1);
}