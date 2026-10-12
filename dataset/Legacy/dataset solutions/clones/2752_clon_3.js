function logOutput(message) {
    console.log(message);
}

function executeGraphProcessing(rawInputString) {
    const ERROR_INDICATOR = "-1";

    const trimmedInput = rawInputString.trim();
    const inputLines = trimmedInput.split("\n");

    const firstLineParts = inputLines[0].split(" ");
    const totalNodes = parseInt(firstLineParts[0]);
    const totalEdges = parseInt(firstLineParts[1]);

    if (totalEdges % 2 !== 0) {
        console.log(ERROR_INDICATOR);
        return;
    }

    inputLines.shift();

    const graphAdjacencyList = {};

    for (let currentNodeId = 1; currentNodeId <= totalNodes; currentNodeId++) {
        graphAdjacencyList[currentNodeId] = [];
    }

    for (let currentEdgeIndex = 0; currentEdgeIndex < totalEdges; currentEdgeIndex++) {
        const edgeParts = inputLines[currentEdgeIndex].split(" ");
        const nodeIdentifierA = edgeParts[0];
        const nodeIdentifierB = edgeParts[1];

        graphAdjacencyList[nodeIdentifierA].push(nodeIdentifierB);
        graphAdjacencyList[nodeIdentifierB].push(nodeIdentifierA);
    }

    for (let currentNodeId = 1; currentNodeId <= totalNodes; currentNodeId++) {
        const nodeDegree = graphAdjacencyList[currentNodeId].length;
        if (nodeDegree % 2 !== 0) {
            console.log(ERROR_INDICATOR);
            return;
        }
    }
}

executeGraphProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));
