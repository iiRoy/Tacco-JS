var fileSystemModule = require('fs');

function readInputData() {
    var inputDescriptor = process.stdin.fd;
    var fileStatistics = fileSystemModule.fstatSync(inputDescriptor);
    var totalInputLength = fileStatistics.size;
    var dataBuffer = Buffer.alloc(totalInputLength);
    var bytesActuallyRead = fileSystemModule.readSync(inputDescriptor, dataBuffer, 0, totalInputLength, 0);
    var fullInputString = dataBuffer.toString('utf8', 0, bytesActuallyRead);
    var inputLinesArray = fullInputString.split('\n');

    var firstLineParts = inputLinesArray.shift().split(' ');
    var nodeCount = parseInt(firstLineParts[0], 10);
    var edgeCount = parseInt(firstLineParts[1], 10);

    var allRelations = inputLinesArray.slice(0, edgeCount).map(line => line.split(' '));

    return { nodeCount, edgeCount, allRelations };
}

function constructAdjacencyList(numNodes, numEdges, edgeList) {
    var adjacencyList = Array.from({ length: numNodes }, () => []);
    for (let currentEdgeIndex = 0; currentEdgeIndex < numEdges; currentEdgeIndex++) {
        let sourceNodeIndex = parseInt(edgeList[currentEdgeIndex][0], 10) - 1;
        let targetNodeIndex = parseInt(edgeList[currentEdgeIndex][1], 10) - 1;
        adjacencyList[sourceNodeIndex].push(targetNodeIndex);
    }
    return adjacencyList;
}

function createGraphWithoutEdge(originalGraph, edgeToRemove) {
    var sourceNodeIdentifier = parseInt(edgeToRemove[0], 10) - 1;
    var targetNodeIdentifier = parseInt(edgeToRemove[1], 10) - 1;

    var modifiedGraphRepresentation = originalGraph.slice(); // Shallow copy of the outer array
    var sourceNodeNeighbors = modifiedGraphRepresentation[sourceNodeIdentifier];
    
    modifiedGraphRepresentation[sourceNodeIdentifier] = sourceNodeNeighbors.filter(function (currentNeighbor) {
        return targetNodeIdentifier !== currentNeighbor;
    });
    return modifiedGraphRepresentation;
}

function calculateMaxPathLength(currentGraph, numNodes) {
    var maxPathLengths = new Array(numNodes).fill(1);
    var overallMaximumPath = 1;

    for (let currentNodeIndex = 0; currentNodeIndex < numNodes; currentNodeIndex++) {
        var neighborsOfCurrentNode = currentGraph[currentNodeIndex];
        for (let neighborListIndex = 0; neighborListIndex < neighborsOfCurrentNode.length; neighborListIndex++) {
            let neighborNode = neighborsOfCurrentNode[neighborListIndex];
            maxPathLengths[neighborNode] = Math.max(maxPathLengths[neighborNode], maxPathLengths[currentNodeIndex] + 1);
        }
        overallMaximumPath = Math.max(overallMaximumPath, maxPathLengths[currentNodeIndex]);
    }
    return overallMaximumPath;
}

var { nodeCount, edgeCount, allRelations } = readInputData();

var initialGraphRepresentation = constructAdjacencyList(nodeCount, edgeCount, allRelations);
var initialMaxPath = calculateMaxPathLength(initialGraphRepresentation, nodeCount);

var foundCandidateEdge = false;
for (let edgeIterationIndex = 0; edgeIterationIndex < edgeCount; edgeIterationIndex++) {
    var currentEdgeRelation = allRelations[edgeIterationIndex];
    var graphWithRemovedEdge = createGraphWithoutEdge(initialGraphRepresentation, currentEdgeRelation);
    
    var currentGraphMaxPath = calculateMaxPathLength(graphWithRemovedEdge, nodeCount);

    if (currentGraphMaxPath < initialMaxPath) {
        console.log(edgeIterationIndex + 1);
        foundCandidateEdge = true;
    }
}

if (!foundCandidateEdge) {
    console.log(-1);
}
