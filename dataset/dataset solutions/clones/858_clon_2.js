/*
 * This module processes input data from standard input to find critical graph edges.
 * Developed by AI Code Transform on 2023-10-27.
 */
var fileSystem = require('fs')
  , contentSize = fileSystem.fstatSync(process.stdin.fd).size
  , dataBlock = Buffer.alloc(contentSize)
  , readBytesCount = fileSystem.readSync(process.stdin.fd, dataBlock, 0, contentSize, 0)
  , dataLines = dataBlock.toString('utf8', 0, readBytesCount).split('\n')
  ;

// Function to generate a new adjacency list by removing a specific connection.
function removeConnection(adjMatrix, linkToRemove) {
    let firstNode = linkToRemove[0];
    let secondNode = linkToRemove[1];
    let tempAdjMatrix = adjMatrix.slice(); // Create a shallow copy of the adjacency list.

    // Deep copy the array for the first node's connections and remove the second node.
    (tempAdjMatrix[firstNode] = adjMatrix[firstNode].slice()).splice(adjMatrix[firstNode].indexOf(secondNode), 1);

    return tempAdjMatrix; // Return the adjacency list with the connection removed.
}

// This utility function calculates the longest path in a given graph structure.
function calculateMaxPathLength(graphStructure) {
    let pathDistances = []; // Array to store computed path lengths for each node.
    let nodeIndex, neighborIndex;
    let currentMax = 1; // Initialize the maximum path length found.

    // Initialize path distance for all nodes to 1.
    for (nodeIndex = 0; nodeIndex < totalNodes; nodeIndex++) {
        pathDistances[nodeIndex] = 1;
    }

    // Traverse the graph to update path distances using dynamic programming approach.
    for (nodeIndex = 0; nodeIndex < totalNodes; nodeIndex++) {
        for (neighborIndex = 0; neighborIndex < graphStructure[nodeIndex].length; neighborIndex++) {
            // Update the path length for the adjacent node if a longer path is discovered.
            pathDistances[graphStructure[nodeIndex][neighborIndex]] = Math.max(
                pathDistances[graphStructure[nodeIndex][neighborIndex]],
                pathDistances[nodeIndex] + 1
            );
        }
        // The original code had this line commented out, maintaining the same structure.
        // currentMax = Math.max(currentMax, pathDistances[nodeIndex]);
    }
    // Return the global maximum path length from the calculated distances.
    return Math.max.apply(null, pathDistances);
}

// Determines the maximum path length within a specific connected component of a graph.
function determineMaxComponentPath(componentGraph, connectedNodes) {
    let pathMeasurements = []; // Stores path lengths for nodes within the component.
    let compIdx, adjIdx, activeNode;
    let nodesInComp = connectedNodes.length;
    let adjCount;
    let highestPath = 1; // Initialize the highest path length for the current component.

    // Initialize path measurements for all nodes in the given component to 1.
    for (compIdx = 0; compIdx < nodesInComp; compIdx++) {
        pathMeasurements[connectedNodes[compIdx]] = 1;
    }

    // Iterate through the nodes in the component to calculate path lengths.
    for (compIdx = 0; compIdx < nodesInComp; compIdx++) {
        activeNode = connectedNodes[compIdx];
        // Original code had a commented increment, maintaining that behavior.
        // pathMeasurements[compIdx]++;
        adjCount = componentGraph[activeNode].length;
        for (adjIdx = 0; adjIdx < adjCount; adjIdx++) {
            // Update the path measurement for adjacent nodes if a longer path is found.
            pathMeasurements[componentGraph[activeNode][adjIdx]] = Math.max(
                pathMeasurements[componentGraph[activeNode][adjIdx]],
                pathMeasurements[activeNode] + 1
            );
        }
        // Update the highest path found within this component.
        highestPath = Math.max(highestPath, pathMeasurements[activeNode]);
    }
    return highestPath; // Return the maximum path length for this component.
}


let initialData = dataLines.shift().split(' ');
let totalNodes = parseInt(initialData[0]); // Total number of nodes (vertices) in the graph.
let totalEdges = parseInt(initialData[1]); // Total number of edges (connections) in the graph.
let connectionRecords = []; // Array to store all input connections.
let currentGraphState; // Variable to hold the graph during specific operations.
let alternateGraphState; // Another variable for temporary graph states.
let loopCounter;
let nodeOne, nodeTwo;

// ComponentManager implements a Disjoint Set Union (DSU) data structure.
let ComponentManager = function () {
    let loopVar;
    let parentRepresentations = []; // Stores parent of each element; negative value indicates root and size.
    let componentMemberLists = []; // Stores lists of nodes belonging to each component.

    // Initialize the DSU structure: each node starts as its own set.
    for (loopVar = 0; loopVar < totalNodes; loopVar++) {
        parentRepresentations[loopVar] = -1; // -1 means element is a root and its set size is 1.
        componentMemberLists[loopVar] = []; // Initialize empty list for component members.
    }

    // Merges two sets if they are distinct, based on their elements elementX and elementY.
    function mergeComponents(elementX, elementY) {
        elementX = findRepresentative(elementX);
        elementY = findRepresentative(elementY);

        if (elementX !== elementY) { // If elements are in different sets.
            // Union by size heuristic: attach smaller tree under root of larger tree.
            if (parentRepresentations[elementX] < parentRepresentations[elementY]) {
                parentRepresentations[elementX] += parentRepresentations[elementY]; // Add size of Y's set to X's set.
                parentRepresentations[elementY] = elementX; // Make X the parent of Y.
            } else {
                parentRepresentations[elementY] += parentRepresentations[elementX]; // Add size of X's set to Y's set.
                parentRepresentations[elementX] = elementY; // Make Y the parent of X.
            }
        }
        return elementX !== elementY; // Returns true if a merge actually happened.
    }

    // Finds the representative (root) of the set containing elementZ, with path compression.
    function findRepresentative(elementZ) {
        return parentRepresentations[elementZ] < 0
            ? elementZ
            : parentRepresentations[elementZ] = findRepresentative(parentRepresentations[elementZ]);
    }

    // Collects all nodes into lists grouped by their connected components.
    function retrieveComponentMembers() {
        for (loopVar = 0; loopVar < totalNodes; loopVar++) {
            componentMemberLists[findRepresentative(loopVar)].push(loopVar);
        }

        // Filters out empty lists and sorts nodes within each component.
        componentMemberLists = componentMemberLists
            .filter(function (currentElementList) {
                return currentElementList.length > 0;
            })
            .map(function (currentElementList) {
                return currentElementList.sort((valA, valB) => valA - valB); // Sort numerically.
            });
        return componentMemberLists;
    }

    // Public interface for the Disjoint Set Union operations.
    return {
        merge: mergeComponents,
        getRepresentative: findRepresentative,
        getComponents: retrieveComponentMembers
    };
}();

// Section to build the graph's adjacency list and perform initial Disjoint Set Union operations.
let mainAdjacencyList = []; // This array will represent the graph using an adjacency list.
for (loopCounter = 0; loopCounter < totalNodes; loopCounter++) {
    mainAdjacencyList[loopCounter] = []; // Initialize each node with an empty list of adjacent nodes.
}

// Process each line of input data to construct the graph and manage connected components.
for (loopCounter = 0; loopCounter < totalEdges; loopCounter++) {
    let edgeInfo = dataLines[loopCounter].split(' ');
    nodeOne = parseInt(edgeInfo[0]) - 1; // Parse and convert to 0-indexed node identifier.
    nodeTwo = parseInt(edgeInfo[1]) - 1; // Parse and convert to 0-indexed node identifier.

    connectionRecords[loopCounter] = [nodeOne, nodeTwo]; // Store the connection.
    mainAdjacencyList[nodeOne].push(nodeTwo); // Add a directed edge from nodeOne to nodeTwo.
    ComponentManager.merge(nodeOne, nodeTwo); // Unite the sets containing these two nodes.
}

// After processing all edges, retrieve the distinct connected components.
let componentSets = ComponentManager.getComponents();
// console.log(componentSets); // Debugging: Output the identified connected components.

// Calculate the maximum path length for each individual connected component.
let componentMaxPaths = componentSets.map(function (currentSetOfNodes) {
    // Call the function to determine the longest path within the current component.
    return determineMaxComponentPath(mainAdjacencyList, currentSetOfNodes);
});
// console.log(componentMaxPaths); // Debugging: Output the max path for each component.

// Find the overall maximum path length across all components.
let overallLongestPath = Math.max.apply(null, componentMaxPaths);
let longestPathComponentIdx = componentMaxPaths.indexOf(overallLongestPath); // Get the index of the component with this path.
let isUniqueLongestPath; // A flag to track if a critical edge is found.
let targetComponentNodes = componentSets[longestPathComponentIdx]; // The nodes belonging to the component with the overall longest path.

// console.log(targetComponentNodes); // Debugging: Output the nodes in the target component.

// Check if there are multiple components that share the same overall longest path.
// If so, the solution is ambiguous, and -1 should be outputted.
if (componentMaxPaths.slice(longestPathComponentIdx + 1).indexOf(overallLongestPath) !== -1) {
    console.log(-1);
    return; // Terminate execution as the condition is met.
}

// The original code had a commented-out section for filtering edges, which is not used.
// var relevantEdges = connectionRecords.filter(function (entry) {
//   return targetComponentNodes.includes(entry[0]);
// });

isUniqueLongestPath = true; // Initialize flag, assuming no critical edge will be found.

// Iterate through all recorded connections to find a critical edge.
for (let edgeLoopIdx = 0; edgeLoopIdx < totalEdges; edgeLoopIdx++) {
    // console.log(connectionRecords[edgeLoopIdx][0]); // Debugging: Log the source node of the current edge.

    // Only consider edges where the starting node is part of the target component.
    if (targetComponentNodes.includes(connectionRecords[edgeLoopIdx][0])) {
        // Create a temporary graph by simulating the removal of the current edge.
        let modifiedGraph = removeConnection(mainAdjacencyList, connectionRecords[edgeLoopIdx]);

        // If removing this specific edge causes the maximum path length in the target component
        // to decrease, then this edge is a critical edge.
        if (determineMaxComponentPath(modifiedGraph, targetComponentNodes) < overallLongestPath) {
            console.log(edgeLoopIdx + 1); // Output the 1-indexed number of the critical edge.
            isUniqueLongestPath = false; // Set flag to indicate a critical edge has been found.
        }
    }
}

// Another commented-out loop from the original code, not part of the active logic.
// for (let edgeLoopIdx = 0; edgeLoopIdx < relevantEdges.length; edgeLoopIdx++) {
//   modifiedGraph = removeConnection(mainAdjacencyList, relevantEdges[edgeLoopIdx]);
//   console.log(modifiedGraph);
//   if (determineMaxComponentPath(modifiedGraph, targetComponentNodes) < overallLongestPath) {
//     console.log(edgeLoopIdx + 1);
//     isUniqueLongestPath = false;
//   }
// }

// If after checking all edges, no critical edge was found (i.e., the flag remains true), output -1.
if (isUniqueLongestPath) {
    console.log(-1);
}