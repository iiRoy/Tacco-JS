var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var parsedLines = fileContent.split("\n").map((lineStr) => {
    return lineStr.split(" ").map((numStr) => { return Number(numStr); });
});

var initialConfiguration = parsedLines[0];
var finalNodeIdentifier = initialConfiguration[0];
// var edgeQuantity = initialConfiguration[1]; // Original had E commented out, so I'll omit an equivalent
var auxiliaryParameter = initialConfiguration[2]; // P in original, unused.

parsedLines.shift(); // Remove the configuration line

var graphConnections = {};
for (var nodeIndex = 1; nodeIndex <= finalNodeIdentifier; nodeIndex++) {
    graphConnections[nodeIndex] = [];
}

parsedLines.forEach((edgeDescription) => {
    graphConnections[edgeDescription[0]].push([edgeDescription[1], edgeDescription[2]]);
});

var highestPathValue = -1;

function exploreGraphRecursively(currentLocation, accumulatedWeight, visitedPathNodes) {
    if (currentLocation === finalNodeIdentifier) {
        highestPathValue = Math.max(highestPathValue, accumulatedWeight);
        return;
    }

    visitedPathNodes.add(currentLocation);

    const adjacentEdges = graphConnections[currentLocation] || [];
    for (const [nextLocation, traversalCost] of adjacentEdges) {
        if (!visitedPathNodes.has(nextLocation)) {
            exploreGraphRecursively(nextLocation, accumulatedWeight + traversalCost, visitedPathNodes);
        }
        // If nextLocation is already in visitedPathNodes, it means a cycle is detected
        // within the current path. The original code would print "loop detected" and
        // effectively prune this branch by not continuing the traversal.
        // This recursive implementation achieves the same pruning by simply not
        // making a recursive call for cyclic paths.
    }

    visitedPathNodes.delete(currentLocation); // Backtrack: remove current node from the path for exploring other branches
}

// Initiate the graph traversal from node 1 with an initial accumulated weight of 0
// and an empty set to track visited nodes in the current path.
exploreGraphRecursively(1, 0, new Set());

console.log(highestPathValue);
