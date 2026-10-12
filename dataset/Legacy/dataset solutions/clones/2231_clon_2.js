var graphNodes = [];
var constraintPaths = [];
// Edge naming convention: (smaller_node_id * 0x64) + larger_node_id

function ProcessInput(rawData) {
    rawData = rawData.split("\n");

    var nodeCount = parseInt(rawData[0], 0xA);
    for (var idx = 0x0; idx < nodeCount; idx++) {
        var nodeInfo = {
            nodeId: idx,
            connectedNodes: [],
            nodeDepth: 0x0,
            parentNode: null
            // Index of connected nodes within the graphNodes array
        };
        graphNodes.push(nodeInfo);
    }

    // Process edge connections for the graph
    for (var idx = 0x1; idx < nodeCount; idx++) {
        var tempParts = rawData[idx].split(" ");
        var firstNodeIdx = parseInt(tempParts[0x0], 0xA);
        var secondNodeIdx = parseInt(tempParts[0x1], 0xA);
        graphNodes[firstNodeIdx - 0x1].connectedNodes.push(secondNodeIdx - 0x1);
        graphNodes[secondNodeIdx - 0x1].connectedNodes.push(firstNodeIdx - 0x1);
    }

    ArrangeTreeStructure(graphNodes[0x0]);
    // At this point, the tree structure (depths and parents) is established.

    // Now, let's examine the constraints.
    var constraintCount = parseInt(rawData[nodeCount]); // Number of restrictions
    for (var idx = nodeCount + 0x1; idx <= nodeCount + constraintCount; idx++) {
        var tempParts = rawData[idx].split(" ");
        var restrictNodeA = parseInt(tempParts[0x0], 0xA);
        var restrictNodeB = parseInt(tempParts[0x1], 0xA);
        constraintPaths.push(FindPathBetweenNodes(restrictNodeA - 0x1, restrictNodeB - 0x1));
    }

    var pathCombinations = CalculatePathIntersections();

    var exclusionPattern = 0x0;

    for (var binaryKey in pathCombinations) {
        if (CountOccurrences(binaryKey, "1") % 0b10 === 0x1) {
            exclusionPattern += Math.pow(0b10, nodeCount - (0x1 + pathCombinations[binaryKey].length));
        } else {
            exclusionPattern -= Math.pow(0b10, nodeCount - (0x1 + pathCombinations[binaryKey].length));
        }
    }
    console.log(Math.pow(0b10, nodeCount - 0x1) - exclusionPattern);
    // console.log('Final result: %d', finalValue);
}

// Computes the union of paths for combinations of restrictions
function CalculatePathIntersections() {
    var intersectionMap = {};
    for (var idx = 0x1; idx < Math.pow(0b10, constraintPaths.length); idx++) {
        var binaryKey = idx.toString(0b10);
        if (CountOccurrences(binaryKey, "1") === 0x1) {
            intersectionMap[binaryKey] = constraintPaths[binaryKey.length - 0x1];
        } else {
            // Determine the union of paths from the first and last parts of the binary key
            var firstPartKey = "" + binaryKey.substring(0x0, 0x1) * Math.pow(0xA, binaryKey.length - 0x1);
            var remainingPartKey = "" + parseInt(binaryKey.substring(0x1, binaryKey.length), 0b10).toString(0b10);
            intersectionMap[binaryKey] = RemoveDuplicates(intersectionMap[firstPartKey].concat(intersectionMap[remainingPartKey]));
        }
    }
    return intersectionMap;
}

function RemoveDuplicates(inputArray) {
    return inputArray.filter((elementValue, elementIndex, selfArray) => selfArray.indexOf(elementValue) === elementIndex);
}

function CountOccurrences(inputString, targetChar) {
    return (inputString.match(new RegExp(targetChar, "g")) || []).length;
}

function FindPathBetweenNodes(startNodeIndex, endNodeIndex) { // Operates with node indices, not objects
    var pathEdges = [];
    var startDepth = graphNodes[startNodeIndex].nodeDepth;
    var endDepth = graphNodes[endNodeIndex].nodeDepth;

    while (true) {
        if (startDepth === endDepth) {
            if (startNodeIndex === endNodeIndex) {
                break;
            }

            pathEdges.push(Math.min(startNodeIndex, graphNodes[startNodeIndex].parentNode) * 0x64 + Math.max(startNodeIndex, graphNodes[startNodeIndex].parentNode));
            startDepth -= 0x1;
            startNodeIndex = graphNodes[startNodeIndex].parentNode;

            pathEdges.push(Math.min(endNodeIndex, graphNodes[endNodeIndex].parentNode) * 0x64 + Math.max(endNodeIndex, graphNodes[endNodeIndex].parentNode));
            endDepth -= 0x1;
            endNodeIndex = graphNodes[endNodeIndex].parentNode;

        } else if (startDepth > endDepth) {
            pathEdges.push(Math.min(startNodeIndex, graphNodes[startNodeIndex].parentNode) * 0x64 + Math.max(startNodeIndex, graphNodes[startNodeIndex].parentNode));
            startDepth -= 0x1;
            startNodeIndex = graphNodes[startNodeIndex].parentNode;

        } else {
            pathEdges.push(Math.min(endNodeIndex, graphNodes[endNodeIndex].parentNode) * 0x64 + Math.max(endNodeIndex, graphNodes[endNodeIndex].parentNode));
            endDepth -= 0x1;
            endNodeIndex = graphNodes[endNodeIndex].parentNode;
        }
    }

    return pathEdges;
}

function ArrangeTreeStructure(currentNode) {
    for (var idx = 0x0; idx < currentNode.connectedNodes.length; idx++) {
        var potentialChildIndex = currentNode.connectedNodes[idx]; // Check if the i-th potential child is actually its parent. Skip if it is, otherwise keep it as a child.

        if (potentialChildIndex !== currentNode.parentNode) {
            graphNodes[potentialChildIndex].parentNode = currentNode.nodeId;
            graphNodes[potentialChildIndex].nodeDepth = currentNode.nodeDepth + 0x1;
            // If it's a true child, set its parent to the current node.
            ArrangeTreeStructure(graphNodes[potentialChildIndex]);

        } else {
            currentNode.connectedNodes.splice(idx, 0x1);
            idx--;
            // If it was the parent, remove it from the child list to avoid cycles.
        }
    }
}

//* Do not modify anything below this line (reads from standard input and calls the main processing function)
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
