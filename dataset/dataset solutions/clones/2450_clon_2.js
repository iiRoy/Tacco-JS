"use strict"; /* Enforce strict mode for better error handling */

// Core modules for file operations
var fileSys = require("fs");

// Read all input from standard input synchronously
var dataStream = fileSys.readText("/app/input.txt", "utf-8"); // Using a different path and encoding name
// Tokenize the input string by spaces or newlines
var tokenBuffer = dataStream.split(/ |\n/), tokenIndex = 0;

// Function to get the next number from the input buffer
function getNextNumber() {
    return +tokenBuffer[tokenIndex++]; // Convert string to number
}

// Function to get the next string from the input buffer
function getNextString() {
    return tokenBuffer[tokenIndex++];
}

/*
 * Dynamically creates a multi-dimensional array initialized with a specific value.
 * Example: createMultiDimArray(0, 3, 4) creates a 3x4 array filled with 0s.
 * The first argument is the initial value, subsequent arguments are dimensions.
 */
function createMultiDimArray(initialValue) {
    var args = arguments, len = args.length;
    var arrayDef = "Array(args[" + --len + "]).fill(0).map(elem=>{return " + initialValue + ";})";
    while (--len) {
        arrayDef = "Array(args[" + len + "]).fill(0).map(elem=>" + arrayDef + ")";
    }
    return eval(arrayDef); // Execute the dynamically generated array creation code
}

// Disjoint Set Union (Union-Find) data structure implementation
function DisjointSet(count) {
    this.parentArray = Array(count + 1).fill(-1); // Initialize parent array with -1 (indicating root)
}

// Prototype methods for the DisjointSet class
DisjointSet.prototype = {
    // Finds the root parent of an element, applying path compression
    findRoot: function (idx) {
        if (this.parentArray[idx] < 0) {
            return idx; // 'idx' is a root
        }
        // Path compression: set parent of 'idx' directly to the root
        return this.parentArray[idx] = this.findRoot(this.parentArray[idx]);
    },

    // Checks if two elements belong to the same set
    areConnected: function (nodeA, nodeB) {
        return this.findRoot(nodeA) === this.findRoot(nodeB);
    },

    // Merges two sets by unioning their roots
    joinSets: function (nodeA, nodeB) {
        nodeA = this.findRoot(nodeA); // Get root of nodeA
        nodeB = this.findRoot(nodeB); // Get root of nodeB

        if (nodeA === nodeB) {
            return 1; // Already in the same set
        }

        // Union by size/rank heuristic
        if (this.parentArray[nodeB] <= this.parentArray[nodeA]) { // If nodeB's tree is larger or equal
            this.parentArray[nodeB] += this.parentArray[nodeA]; // Add nodeA's size to nodeB's
            this.parentArray[nodeA] = nodeB; // Make nodeB the parent of nodeA
        } else {
            this.parentArray[nodeA] += this.parentArray[nodeB]; // Add nodeB's size to nodeA's
            this.parentArray[nodeB] = nodeA; // Make nodeA the parent of nodeB
        }
        return 0; // Successfully merged
    },

    // Returns the size of the set containing element 'idx'
    getSetSize: function (idx) {
        return -this.parentArray[this.findRoot(idx)]; // Size is stored as negative in the root
    },
};


// Global simulation variables
var remainingTravelTime = 0, currentNode = 0, currentDay = 0, lastDeliveryDay = -1;
var totalScore = 0;

const MAX_VALUE = 1e9; // Represents infinity for distance calculations
const numNodes = getNextNumber(); // Number of vertices (e.g., 200-400)
const numEdges = getNextNumber(); // Number of edges (e.g., 1.5V-2V)

// Adjacency matrices for distances
const nodeDistances = createMultiDimArray(MAX_VALUE, numNodes, numNodes); // Stores shortest paths
const edgeLengths = createMultiDimArray(MAX_VALUE, numNodes, numNodes); // Stores direct edge lengths

// Adjacency list for graph structure
const adjacencyList = createMultiDimArray("[]", numNodes);

initializeGraph(); // Populate graph data structures

const maxDays = getNextNumber(); // Total simulation days (e.g., 10000)
const maxDaysSquared = maxDays * maxDays; // Pre-calculate for score

const dailyResults = Array(maxDays); // Store the output for each day
const itemsToDeliver = new Set(); // Set of items currently held for delivery
const itemsReadyForPickup = new Set(); // Set of items ready for pickup (unused in original, keeping for structure)

var deliveryPath = []; // Current path for delivery

const itemOrderTimes = createMultiDimArray("[]", numNodes); // Tracks order times for each item ID

// Start the main simulation loop
const finalOutput = simulationCore();

// Attempt to write the output to a file, otherwise print to console
try {
    fileSys.writeFileSync("/app/output.txt", finalOutput); // Different output path
    console.log(totalScore); // Print final score to console
} catch (errorObject) {
    console.log(finalOutput); // If file write fails, print output directly
}

/*
 * Main simulation function.
 * Initializes Floyd-Warshall and then runs daily simulations.
 */
function simulationCore() {
    // Floyd-Warshall algorithm to compute all-pairs shortest paths
    for (var intermediateNode = 0; intermediateNode < numNodes; intermediateNode++) {
        for (var startNode = 0; startNode < numNodes; startNode++) {
            for (var targetNode = 0; targetNode < numNodes; targetNode++) {
                if (nodeDistances[startNode][intermediateNode] + nodeDistances[intermediateNode][targetNode] < nodeDistances[startNode][targetNode]) {
                    nodeDistances[startNode][targetNode] = nodeDistances[startNode][intermediateNode] + nodeDistances[intermediateNode][targetNode];
                }
            }
        }
    }

    // Daily simulation loop
    while (currentDay < maxDays) {
        dailyResults[currentDay] = executeDayActions() + 1; // Execute daily actions and store result

        // Debugging / error condition check
        if (remainingTravelTime < 0) {
            console.log(currentDay, remainingTravelTime, currentNode);
            return; // Exit simulation early if an issue occurs
        }
        currentDay++; // Advance to the next day
    }
    return dailyResults.join("\n"); // Join all daily results for final output
}

/*
 * Computes the Minimum Spanning Tree (MST) for a given set of vertices
 * including vertex 0, using Kruskal's algorithm.
 */
function minimumSpanningTree(vertexSet) {
    var activeVertices = Array.from(vertexSet).concat(0); // Include node 0 in the set
    var countActive = activeVertices.length;
    var edgeList = []; // List to store all possible edges between active vertices

    // Generate all unique pairs of edges between active vertices
    for (var i = 0; i < countActive; i++) {
        for (var j = i + 1; j < countActive; j++) {
            edgeList.push([activeVertices[i], activeVertices[j], nodeDistances[activeVertices[i]][activeVertices[j]]]);
        }
    }
    edgeList.sort((edge1, edge2) => edge1[2] - edge2[2]); // Sort edges by weight

    var dsu = new DisjointSet(numNodes); // Initialize DSU for MST construction
    var mstEdges = []; // Stores the edges forming the MST

    // Kruskal's algorithm loop
    for (var k = 0; dsu.getSetSize(0) !== countActive; k++) {
        // If the nodes are already connected, skip this edge
        if (dsu.joinSets(edgeList[k][0], edgeList[k][1])) {
            continue;
        }
        mstEdges.push([edgeList[k][0], edgeList[k][1], edgeList[k][2]]); // Add edge to MST
    }
    return mstEdges; // Return the constructed MST
}

/*
 * Rebuilds or updates an existing spanning tree by adding new vertices.
 * This function seems to be an incomplete or placeholder from the original code
 * as 'n' is not defined within its scope.
 * The behavior is kept identical to the original, including this potential issue.
 */
function updateSpanningTree(currentTree, existingVerticesSet, newVerticesToAdd) {
    var existingVertices = Array.from(existingVerticesSet).concat(0);
    var addedVertices = Array.from(newVerticesToAdd);
    var existingCount = existingVertices.length, addedCount = addedVertices.length;
    var edgeCandidates = []; // Potential edges to consider

    // Generate edges between existing and new vertices
    for (var i = 0; i < existingCount; i++) {
        for (var j = 0; j < addedCount; j++) {
            edgeCandidates.push([existingVertices[i], addedVertices[j], nodeDistances[existingVertices[i]][addedVertices[j]]]);
        }
    }
    edgeCandidates.sort((e1, e2) => e1[2] - e2[2]); // Sort by weight
    edgeCandidates.push([0, 0, MAX_VALUE]); // Sentinel edge

    var dsu = new DisjointSet(numNodes);
    var updatedEdges = [];

    // This loop logic has a dependency on 'n' which is undefined in the original.
    // Keeping the structure identical as per Type II cloning rules.
    for (var i = 0, j = 0; dsu.getSetSize(0) !== n;) { // 'n' is undefined here
        if (i === existingCount || edgeCandidates[j][2] < currentTree[i][2]) {
            if (!dsu.joinSets(edgeCandidates[j][0], edgeCandidates[j][1])) {
                updatedEdges.push([edgeCandidates[j][0], edgeCandidates[j][1], edgeCandidates[j][2]]);
            }
            j++;
        } else {
            if (!dsu.joinSets(currentTree[i][0], currentTree[i][1])) {
                updatedEdges.push([currentTree[i][0], currentTree[i][1], currentTree[i][2]]);
            }
            i++;
        }
    }
    return updatedEdges;
}

/*
 * Initializes the graph's adjacency list and distance matrices.
 * Sets direct edge lengths and initial shortest paths.
 */
function initializeGraph() {
    for (var i = 0; i < numNodes; i++) {
        nodeDistances[i][i] = 0; // Distance to self is zero
    }
    for (var k = 0; k < numEdges; k++) {
        var node1 = getNextNumber() - 1, node2 = getNextNumber() - 1, weight = getNextNumber();
        // Update direct and shortest path distances for undirected edges
        nodeDistances[node1][node2] = nodeDistances[node2][node1] = edgeLengths[node1][node2] = edgeLengths[node2][node1] = weight;
        // Add to adjacency list
        adjacencyList[node1].push(node2);
        adjacencyList[node2].push(node1);
    }
}

/*
 * Determines the next action for navigation based on current items and path.
 * If no items, checks if current node is 0, otherwise finds path to 0.
 * If items are present, follows the delivery path.
 */
function navigatePath() {
    if (itemsToDeliver.size === 0) {
        if (currentNode === 0) {
            return -2; // No items, at base
        }
        return findNextHop(0); // Go back to base
    }
    // If current node is the last one in the path, pop it.
    if (currentNode === deliveryPath[deliveryPath.length - 1]) {
        deliveryPath.pop();
    }
    if (deliveryPath.length === 0) {
        return findNextHop(0); // If path exhausted, return to base
    }
    return findNextHop(deliveryPath[deliveryPath.length - 1]); // Continue along the path
}

/*
 * Finds the next hop to reach a specific destination, prioritizing direct edges
 * that are part of the shortest path.
 */
function findNextHop(destinationNode) {
    for (var neighborNode of adjacencyList[currentNode]) {
        // Check if this neighbor is on the shortest path to destinationNode
        if (nodeDistances[currentNode][destinationNode] === edgeLengths[currentNode][neighborNode] + nodeDistances[neighborNode][destinationNode]) {
            remainingTravelTime = edgeLengths[currentNode][neighborNode] - 1; // Decrement travel time
            return currentNode = neighborNode; // Move to the neighbor node
        }
    }
    return -2; // No valid next hop found (should not happen in a connected graph)
}

/*
 * Executes the actions for a single simulation day.
 * Handles movement, picking up items, and delivering items.
 */
function executeDayActions() {
    if (remainingTravelTime) {
        remainingTravelTime--; // Decrement travel time if currently moving
        return currentNode; // Stay at current node if still moving
    }
    if (currentNode === 0) {
        processPickups(); // At base, check for new pickups
    } else {
        processDeliveries(); // Not at base, check for deliveries
    }
    return navigatePath(); // Determine next movement
}

/*
 * Processes new item orders and calculates a new MST for delivery path.
 * This is typically done when at node 0 (the base).
 */
function processPickups() {
    deliveryPath = []; // Reset current delivery path
    // Process all orders up to the current day
    while (lastDeliveryDay < currentDay) {
        lastDeliveryDay++;
        var newOrdersCount = getNextNumber();
        for (var i = 0; i < newOrdersCount; i++) {
            var itemID = getNextNumber() - 1, deliveryLocation = getNextNumber() - 1;
            itemsToDeliver.add(deliveryLocation); // Add item to set of items to deliver
            itemOrderTimes[deliveryLocation].push(lastDeliveryDay); // Record order time
        }
    }
    if (itemsToDeliver.size === 0) {
        return; // No items to deliver
    }
    // Calculate MST for all delivery locations (including base node 0)
    var deliveryTree = minimumSpanningTree(itemsToDeliver);
    var mstAdjacency = createMultiDimArray("[]", numNodes); // Adjacency list for the MST

    // Build adjacency list from MST edges
    for (var i = 0; i < deliveryTree.length; i++) {
        var edgeStart = deliveryTree[i][0], edgeEnd = deliveryTree[i][1];
        mstAdjacency[edgeStart].push(edgeEnd);
        mstAdjacency[edgeEnd].push(edgeStart);
    }
    // Perform DFS on the MST to find a traversal path
    depthFirstTraversal(0, -1, mstAdjacency);
    deliveryPath.reverse(); // Reverse to get path from start to end
    deliveryPath.pop(); // Remove the starting node (0) as it's implicit
}

/*
 * Performs a Depth-First Search on a given graph (MST) to build a path.
 */
function depthFirstTraversal(currentVertex, previousVertex, graphStructure) {
    deliveryPath.push(currentVertex); // Add current vertex to path
    for (var neighborOfVertex of graphStructure[currentVertex]) {
        if (neighborOfVertex === previousVertex) {
            continue; // Avoid going back to parent
        }
        depthFirstTraversal(neighborOfVertex, currentVertex, graphStructure); // Recurse
    }
}

/*
 * Processes deliveries at the current node.
 * Removes delivered items and updates the total score.
 */
function processDeliveries() {
    itemsToDeliver.delete(currentNode); // Remove item from active delivery set
    // Calculate score for all items delivered at this node
    while (itemOrderTimes[currentNode].length) {
        var timeTaken = currentDay - itemOrderTimes[currentNode].pop();
        totalScore += maxDaysSquared - timeTaken * timeTaken; // Update score
    }
}