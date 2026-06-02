"use strict";

// Utility function to create multi-dimensional arrays initialized with a specific value or expression.
// The last argument specifies the initial value/expression for the innermost array elements.
// Subsequent arguments define the dimensions from innermost to outermost.
// Example: createMultiDimArray("[]", 3) creates an array of 3 empty arrays: `[[], [], []]`
// Example: createMultiDimArray(0, 2, 3) creates a 2x3 array initialized with zeros: `[[0,0,0], [0,0,0]]`
function createMultiDimArray(valExpr) {
  const argsList = arguments;
  let argCount = argsList.length;
  // Construct the string representation for the innermost array creation.
  // It uses the last dimension and maps each element to the provided value expression.
  let arrayStr = `new Array(argsList[${--argCount}]).fill(0).map(_ => { return ${valExpr}; })`;
  // Iteratively wrap the string with outer array creations for the remaining dimensions.
  while (--argCount) {
    arrayStr = `new Array(argsList[${argCount}]).fill(0).map(_ => ${arrayStr})`;
  }
  // Evaluate the dynamically constructed string to produce the actual array.
  return eval(arrayStr);
}

// Implementation of a Disjoint Set Union (DSU) data structure.
// Used for efficiently managing sets of elements and performing union/find operations.
function DisjointSet(elementCount) {
  // `parentOrSize` array:
  // If `parentOrSize[i]` < 0, then `i` is a root, and its value is the negative of the set's size.
  // If `parentOrSize[i]` >= 0, then `i` is not a root, and its value is the parent of `i`.
  this.parentOrSize = new Array(elementCount + 1).fill(-1);
}

DisjointSet.prototype = {
  // Finds the representative (root) of the set containing `idx`.
  // Applies path compression for optimization.
  findRoot: function(idx) {
    if (this.parentOrSize[idx] < 0) {
      return idx; // `idx` is already the root of its set.
    }
    // Recursively find the root and compress the path by setting `idx`'s parent directly to the root.
    return this.parentOrSize[idx] = this.findRoot(this.parentOrSize[idx]);
  },

  // Checks if two elements, `nodeA` and `nodeB`, belong to the same set.
  areConnected: function(nodeA, nodeB) {
    return this.findRoot(nodeA) === this.findRoot(nodeB);
  },

  // Unites the sets containing `nodeA` and `nodeB`.
  // Returns `1` if `nodeA` and `nodeB` were already in the same set, otherwise `undefined`.
  // Implements union by size heuristic.
  unionSets: function(nodeA, nodeB) {
    nodeA = this.findRoot(nodeA); // Get root of `nodeA`'s set.
    nodeB = this.findRoot(nodeB); // Get root of `nodeB`'s set.

    if (nodeA === nodeB) {
      return 1; // They are already in the same set, no union needed.
    }

    // Attach the smaller tree under the root of the larger tree.
    // This keeps the tree height minimal, improving `findRoot` performance.
    if (this.parentOrSize[nodeB] <= this.parentOrSize[nodeA]) {
      this.parentOrSize[nodeB] += this.parentOrSize[nodeA]; // Update size of the new root (`nodeB`).
      this.parentOrSize[nodeA] = nodeB; // Make `nodeB` the parent of `nodeA`.
    } else {
      this.parentOrSize[nodeA] += this.parentOrSize[nodeB]; // Update size of the new root (`nodeA`).
      this.parentOrSize[nodeB] = nodeA; // Make `nodeA` the parent of `nodeB`.
    }
  },

  // Returns the size of the set containing `idx`.
  getSetSize: function(idx) {
    // The size is stored as a negative value at the root of the set.
    return -this.parentOrSize[this.findRoot(idx)];
  },
};

// Global variables to maintain the state of the simulation.
let remainingTravelTime = 0; // Decrements each day while moving between nodes.
let currentLocation = 0; // The current node (location) of the delivery vehicle.
let currentDay = 0; // The current day in the simulation.
let lastPickupDay = -1; // Tracks the last day new orders were processed.
let totalScore = 0; // Accumulates the score based on delivery times.

const MAX_DISTANCE = 1000000000; // Represents an infinitely large distance in the graph.
let numLocations; // Total number of locations (vertices) in the graph.
let numRoutes; // Total number of direct routes (edges) in the graph.
let shortestPathMatrix; // 2D array storing all-pairs shortest path distances.
let directRouteDistances; // 2D array storing direct edge distances (only for adjacent nodes).
let adjacencyList; // Adjacency list representation of the graph.
let unusedInputData; // Variable to store input data that is read but not used in the logic.
let maxSimulationDays; // The total number of days the simulation will run.
let maxSimulationDaysSquared; // `maxSimulationDays` squared, used in score calculation.

const pendingDeliveries = new Set(); // Stores the set of unique destination nodes for pending orders.
let deliveryPathSequence = []; // Stores the sequence of nodes to visit for pickups/deliveries.
let pickupDayRecords = []; // Stores the day each order was picked up, indexed by destination node.
const inputBuffer = []; // A buffer to store parsed input values from `readline`.
const dailyOutput = []; // Stores the output (next location to move to) for each day.

let inputBufferIndex = 0; // Current read position within the `inputBuffer`.

// Reads and returns the next numerical value from the global `inputBuffer`.
function readNextInput() {
  return +inputBuffer[inputBufferIndex++];
}

// Implements Kruskal's algorithm to find a Minimum Spanning Tree (MST).
// The MST connects the depot (location 0) and all `targetLocations`.
function buildMinimumSpanningTree(targetLocations) {
  // Create a list of all nodes relevant for the MST, including the depot (location 0).
  const allNodesInSet = Array.from(targetLocations).concat(0);
  const nodeCountInSet = allNodesInSet.length;
  const candidateEdges = [];

  // Generate all possible edges between any two nodes in `allNodesInSet`.
  // The weight of each edge is its shortest path distance.
  for (let i = 0; i < nodeCountInSet; i++) {
    for (let j = i + 1; j < nodeCountInSet; j++) {
      const node1 = allNodesInSet[i];
      const node2 = allNodesInSet[j];
      candidateEdges.push([node1, node2, shortestPathMatrix[node1][node2]]);
    }
  }

  // Sort all candidate edges by their weight (distance) in ascending order.
  candidateEdges.sort((edgeA, edgeB) => edgeA[2] - edgeB[2]);

  // Initialize a DisjointSet instance to track connected components during MST construction.
  const disjointSetInstance = new DisjointSet(numLocations);
  const mstEdges = []; // This array will store the edges that form the MST.

  // Iterate through the sorted edges.
  // Add an edge to the MST if it connects two previously unconnected components.
  for (let i = 0; disjointSetInstance.getSetSize(0) !== nodeCountInSet; i++) {
    const edgeNodeA = candidateEdges[i][0];
    const edgeNodeB = candidateEdges[i][1];
    // If `unionSets` returns 1, it means `edgeNodeA` and `edgeNodeB` were already connected,
    // so adding this edge would form a cycle.
    if (disjointSetInstance.unionSets(edgeNodeA, edgeNodeB)) {
      continue; // Skip this edge as it forms a cycle.
    }
    // If they were not connected, add the edge to the MST.
    mstEdges.push([edgeNodeA, edgeNodeB, candidateEdges[i][2]]);
  }
  return mstEdges;
}

// Determines the next location the vehicle should move towards.
// This could be a delivery target, or the depot if no deliveries are pending.
function determineNextMove() {
  // If there are no pending deliveries, the vehicle should return to the depot (location 0).
  if (pendingDeliveries.size === 0) {
    if (currentLocation === 0) return -2; // Already at the depot, no move needed.
    return findNextStepOnPath(0); // Find the next step towards the depot.
  }

  // If the vehicle has reached the last node in its current `deliveryPathSequence`,
  // that node is considered visited, so it's removed from the path.
  if (currentLocation === deliveryPathSequence[deliveryPathSequence.length - 1]) {
    deliveryPathSequence.pop();
  }

  // If the `deliveryPathSequence` becomes empty after popping, it means all planned
  // pickups/deliveries on the current path are done, so return to depot.
  if (deliveryPathSequence.length === 0) {
    return findNextStepOnPath(0);
  }
  // Otherwise, continue towards the next node in the `deliveryPathSequence`.
  return findNextStepOnPath(deliveryPathSequence[deliveryPathSequence.length - 1]);
}

// Finds the immediate next node on the shortest path from `currentLocation` to `destinationNode`.
function findNextStepOnPath(destinationNode) {
  if (destinationNode === currentLocation) return -2; // Already at the destination.

  // Iterate through all direct neighbors of the `currentLocation`.
  for (const neighborNode of adjacencyList[currentLocation]) {
    // Check if `neighborNode` lies on the shortest path from `currentLocation` to `destinationNode`.
    // This is true if `dist(current, dest) = dist(current, neighbor) + dist(neighbor, dest)`.
    if (shortestPathMatrix[currentLocation][destinationNode] === directRouteDistances[currentLocation][neighborNode] + shortestPathMatrix[neighborNode][destinationNode]) {
      remainingTravelTime = directRouteDistances[currentLocation][neighborNode] - 1; // Decrement travel time for the move.
      return currentLocation = neighborNode; // Move to the `neighborNode`.
    }
  }
  return -2; // This case should ideally not be reached if paths are always valid.
}

// Executes the main action for the current day: moving, processing pickups, or completing deliveries.
function executeDailyAction() {
  if (remainingTravelTime) {
    remainingTravelTime--; // If currently moving, decrement the remaining travel time.
    return currentLocation; // Vehicle is still en route, stays at `currentLocation` for this day.
  }

  // If `remainingTravelTime` is 0, the vehicle has arrived at a node.
  if (currentLocation === 0) {
    processPickups(); // If at the depot, process any new orders.
  } else {
    completeDelivery(); // If at a delivery target, complete the delivery.
  }
  // After processing, determine the next move.
  return determineNextMove();
}

// Processes new orders that have arrived up to the `currentDay`.
function processPickups() {
  deliveryPathSequence = []; // Clear the previous delivery path to plan a new one.

  // Loop through each day from the `lastPickupDay` until `currentDay` to process new orders.
  while (lastPickupDay < currentDay) {
    lastPickupDay++;
    const numNewOrders = readNextInput(); // Read the number of new orders for this day.
    for (let i = 0; i < numNewOrders; i++) {
      const orderId = readNextInput() - 1; // Read order ID (not used in this logic).
      const deliveryTarget = readNextInput() - 1; // Read the destination node for the order.
      pendingDeliveries.add(deliveryTarget); // Add the destination to the set of pending deliveries.
      pickupDayRecords[deliveryTarget].push(lastPickupDay); // Record the day this order was picked up.
    }
  }

  if (pendingDeliveries.size === 0) return; // If no pending deliveries, nothing more to do.

  // Build an MST connecting the depot (0) and all `pendingDeliveries` locations.
  const deliveryTree = buildMinimumSpanningTree(pendingDeliveries);
  const treeAdjacency = createMultiDimArray("[]", numLocations); // Adjacency list for the MST.

  // Convert the MST edges into an adjacency list for easier traversal.
  for (let i = 0; i < deliveryTree.length; i++) {
    const edgeNodeA = deliveryTree[i][0];
    const edgeNodeB = deliveryTree[i][1];
    treeAdjacency[edgeNodeA].push(edgeNodeB);
    treeAdjacency[edgeNodeB].push(edgeNodeA);
  }

  // Perform a Depth-First Search (DFS) on the `deliveryTree` starting from the depot (0).
  // This DFS populates `deliveryPathSequence` with a traversal order.
  traverseDeliveryTree(0, -1, treeAdjacency);
  deliveryPathSequence.reverse(); // Reverse the path to get an order from depot to farthest node.
  deliveryPathSequence.pop(); // Remove the initial depot entry from the path.
}

// Performs a Depth-First Search (DFS) on the `treeAdjacency` graph.
// Populates `deliveryPathSequence` with the nodes visited during the traversal.
function traverseDeliveryTree(neighborNode, parentNode, treeAdjacency) {
  deliveryPathSequence.push(neighborNode); // Add the current node to the path.
  for (const connectedNode of treeAdjacency[neighborNode]) {
    if (connectedNode === parentNode) continue; // Avoid traversing back to the parent node.
    traverseDeliveryTree(connectedNode, neighborNode, treeAdjacency); // Recursively visit connected nodes.
  }
}

// Completes deliveries for all orders destined for the `currentLocation`.
function completeDelivery() {
  pendingDeliveries.delete(currentLocation); // Remove `currentLocation` from pending deliveries.
  // Calculate and add score for each order delivered to this location.
  while (pickupDayRecords[currentLocation].length) {
    const pickupDay = pickupDayRecords[currentLocation].pop(); // Get the day the order was picked up.
    const deliveryTimePenalty = currentDay - pickupDay; // Calculate the time taken for delivery.
    // Score is calculated as `maxSimulationDaysSquared - (deliveryTimePenalty * deliveryTimePenalty)`.
    totalScore += maxSimulationDaysSquared - deliveryTimePenalty * deliveryTimePenalty;
  }
}

// Setup the readline interface to handle input and output asynchronously.
const inputReader = require("readline").createInterface(process.stdin, process.stdout);

// A generator function to manage the asynchronous flow of the simulation,
// pausing and resuming execution as input lines are received.
const simulationGenerator = (function*() {
  // Helper function to get a single line of input asynchronously.
  const getLineAsync = () => inputReader.once("line", s => simulationGenerator.next(s));

  // Read the first line containing `numLocations` (V) and `numRoutes` (E).
  let initialInputLine = yield getLineAsync();
  initialInputLine = initialInputLine.split(" ");
  numRoutes = +initialInputLine[1];
  numLocations = +initialInputLine[0];

  // Initialize the distance matrices and adjacency list.
  shortestPathMatrix = createMultiDimArray(MAX_DISTANCE, numLocations, numLocations);
  directRouteDistances = createMultiDimArray(MAX_DISTANCE, numLocations, numLocations);
  adjacencyList = createMultiDimArray("[]", numLocations);

  // Initialize self-distances to 0 (distance from a node to itself).
  for (let i = 0; i < numLocations; i++) {
    shortestPathMatrix[i][i] = 0;
  }

  // Read `numRoutes` edges and populate the graph data structures.
  for (let i = 0; i < numRoutes; i++) {
    const routeData = (yield getLineAsync()).split(" ");
    const routeNode1 = +routeData[0] - 1; // Convert to 0-based index.
    const routeNode2 = +routeData[1] - 1; // Convert to 0-based index.
    const distance = +routeData[2];

    // Store direct distances and update shortest path matrix for direct connections.
    shortestPathMatrix[routeNode1][routeNode2] = shortestPathMatrix[routeNode2][routeNode1] = distance;
    directRouteDistances[routeNode1][routeNode2] = directRouteDistances[routeNode2][routeNode1] = distance;
    // Add to adjacency list.
    adjacencyList[routeNode1].push(routeNode2);
    adjacencyList[routeNode2].push(routeNode1);
  }

  // Apply the Floyd-Warshall algorithm to compute all-pairs shortest paths.
  // This finds the shortest path between any two nodes in the graph.
  for (let intermediateNode = 0; intermediateNode < numLocations; intermediateNode++) {
    for (let startNode = 0; startNode < numLocations; startNode++) {
      for (let endNode = 0; endNode < numLocations; endNode++) {
        // If path through `intermediateNode` is shorter than current shortest path.
        if (shortestPathMatrix[startNode][intermediateNode] + shortestPathMatrix[intermediateNode][endNode] < shortestPathMatrix[startNode][endNode]) {
          shortestPathMatrix[startNode][endNode] = shortestPathMatrix[startNode][intermediateNode] + shortestPathMatrix[intermediateNode][endNode];
        }
      }
    }
  }

  // Read and store an unused line of input data.
  unusedInputData = (yield getLineAsync()).split(" ").map(val => +val);

  // Read the maximum number of simulation days.
  maxSimulationDays = +(yield getLineAsync());
  maxSimulationDaysSquared = maxSimulationDays * maxSimulationDays; // Pre-calculate for scoring.

  // Initialize the `pickupDayRecords` array.
  pickupDayRecords = createMultiDimArray("[]", numLocations);

  // Main simulation loop, runs for `maxSimulationDays`.
  for (; currentDay < maxSimulationDays; currentDay++) {
    // Read the number of new orders for the current day.
    let lineInput = +(yield getLineAsync());
    inputBuffer.push(lineInput); // Add to the input buffer.

    // Read details for each new order (ID and destination).
    for (let i = 0; i < lineInput; i++) {
      const parsedInput = (yield getLineAsync()).split(" ").map(val => +val);
      inputBuffer.push(parsedInput[0], parsedInput[1]); // Add to the input buffer.
    }

    // Read and discard a block of input lines.
    lineInput = +(yield getLineAsync());
    for (let i = 0; i < lineInput; i++) {
      const parsedInput = yield getLineAsync(); // Discarded line.
    }

    // Execute the daily action (move, pickup, or deliver) and get the next location.
    // Add 1 to convert 0-based index to 1-based output.
    dailyOutput[currentDay] = executeDailyAction() + 1;
    console.log(dailyOutput[currentDay]); // Output the next location.

    // Read the termination condition.
    lineInput = yield getLineAsync();
    if (lineInput[0] !== "O") return; // If the input is not 'O', terminate the simulation.

    // Read and discard another block of input lines.
    lineInput = +(yield getLineAsync());
    for (let i = 0; i < lineInput; i++) {
      const parsedInput = yield getLineAsync(); // Discarded line.
    }
  }
})();

// Start the simulation by calling `next()` on the generator.
simulationGenerator.next();
