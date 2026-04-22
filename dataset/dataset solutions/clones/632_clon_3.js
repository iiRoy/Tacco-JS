const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync(0, 'utf8'); // Reading from standard input (fd 0)

// Process raw input into individual lines
const inputLines = rawInputData.split('\n');

// Parse initial graph parameters from the first line
// Using array destructuring and Number conversion for clarity
const [ graphNodeCount, connectionCount, startingFuelLevel ] = inputLines[0].split(' ').map(Number);

// Declare loop iterators
let nodeIterator, edgeIterator;

// Initialize an array to store the "fuel capacity" of each node
// Using Array.from for a cleaner initialization pattern
const nodeFuelCapacities = Array.from({ length: graphNodeCount });

// Initialize an adjacency list to represent the graph connections
// Each element in the list will be an array of objects detailing outgoing edges
const graphConnections = Array.from({ length: graphNodeCount }, () => []);

// Populate node fuel capacities from subsequent input lines
for (nodeIterator = 0; nodeIterator < graphNodeCount; nodeIterator++) {
  nodeFuelCapacities[nodeIterator] = parseInt(inputLines[nodeIterator + 1], 10);
}

// Parse and add graph edges (connections)
for (edgeIterator = 0; edgeIterator < connectionCount; edgeIterator++) {
   // Extract and convert edge data: source, destination, and travel duration
   const edgeDataParts = inputLines[edgeIterator + graphNodeCount + 1].split(' ').map(Number);
   const sourceNodeIndex = edgeDataParts[0] - 1; // Adjust to 0-indexed
   const destinationNodeIndex = edgeDataParts[1] - 1; // Adjust to 0-indexed
   const travelDurationCost = edgeDataParts[2];

   // Add bi-directional edges to the adjacency list
   // Each edge object contains the target node and the cost to traverse
   graphConnections[sourceNodeIndex].push({
     targetNode: destinationNodeIndex,
     durationCost: travelDurationCost
   });
   graphConnections[destinationNodeIndex].push({
     targetNode: sourceNodeIndex,
     durationCost: travelDurationCost
   });
}

// Initialize the exploration queue for our pathfinding algorithm
// This queue will hold potential path states, ordered by accumulated duration
const pathCandidates = [];

// Add the starting state to the queue
pathCandidates.push({
  currentNode: 0, // Starting node index
  accumulatedDuration: 0, // Initial time elapsed is zero
  currentFuel: startingFuelLevel, // Initial fuel level
  nodesVisitedInPath: new Set([0]) // Track visited nodes in this specific path to prevent cycles
});

// Variable to store the minimum time found to reach the destination
// Initialized to Infinity to ensure any valid path updates it
let shortestJourneyTime = Infinity;

// Main graph traversal loop, implementing a Dijkstra-like search
while (pathCandidates.length > 0) {
  // Sort the queue to always process the path with the minimum accumulated duration first
  // This simulates a priority queue using a standard array
  pathCandidates.sort((stateA, stateB) => stateA.accumulatedDuration - stateB.accumulatedDuration);
  const currentPathState = pathCandidates.shift(); // Extract the path with the smallest duration

  // Pruning optimization: if this path's accumulated duration already exceeds
  // the shortest time found to the destination, there's no need to explore it further
  if (currentPathState.accumulatedDuration >= shortestJourneyTime) {
    continue;
  }

  // Explore all adjacent nodes from the current node
  for (const edgeDetail of graphConnections[currentPathState.currentNode]) {
    const nextSegmentNode = edgeDetail.targetNode;
    const segmentCost = edgeDetail.durationCost;

    // Skip this segment if the next node has already been visited in the current path
    // This prevents infinite loops in cyclic graphs
    if (currentPathState.nodesVisitedInPath.has(nextSegmentNode)) {
      continue;
    }
    
    // Check if the current node has sufficient fuel capacity to traverse this segment
    if (nodeFuelCapacities[currentPathState.currentNode] < segmentCost) {
      continue; // Not enough fuel to pass through this edge
    }

    // Calculate the new accumulated duration and fuel level for the next state
    let newAccumulatedDuration;
    let newCurrentFuel;

    // Intermediate calculation for clarity in the conditions below
    const nextNodeRequiredFuelPlusSegment = nodeFuelCapacities[nextSegmentNode] + segmentCost;

    // Condition 1: If next node's fuel capacity + segment cost is less than current fuel
    if (nextNodeRequiredFuelPlusSegment < currentPathState.currentFuel) {
      newCurrentFuel = nodeFuelCapacities[nextSegmentNode]; // Fuel becomes next node's capacity
      newAccumulatedDuration = currentPathState.accumulatedDuration + segmentCost + (currentPathState.currentFuel - nextNodeRequiredFuelPlusSegment);
    }
    // Condition 2: If next node's fuel capacity + segment cost is sufficient AND current fuel is enough for segment
    // (Corrected potential typo from original: h[next + obj.t >= node.height -> nodeFuelCapacities[nextSegmentNode] + segmentCost >= currentPathState.currentFuel)
    else if (nextNodeRequiredFuelPlusSegment >= currentPathState.currentFuel && currentPathState.currentFuel >= segmentCost) {
      newCurrentFuel = currentPathState.currentFuel - segmentCost; // Fuel decreases by segment cost
      newAccumulatedDuration = currentPathState.accumulatedDuration + segmentCost;
    }
    // Condition 3: All other cases where fuel runs out or is insufficient for the segment
    else {
      newCurrentFuel = 0; // Fuel becomes zero
      // Duration increases by segment cost plus the deficit of fuel
      newAccumulatedDuration = currentPathState.accumulatedDuration + segmentCost + (segmentCost - currentPathState.currentFuel);
    }
    
    // Check if the next node is the final destination
    const finalDestinationNodeIndex = graphNodeCount - 1;
    if (nextSegmentNode === finalDestinationNodeIndex) {
      // If destination reached, calculate the final total journey time
      // (Type III: Directly calculate and update min, avoiding an unnecessary push/pop to the queue)
      const finalJourneyTime = newAccumulatedDuration + nodeFuelCapacities[finalDestinationNodeIndex] - newCurrentFuel;
      shortestJourneyTime = Math.min(shortestJourneyTime, finalJourneyTime);
    } else {
      // If not the destination, prepare the next path state and add it to the queue
      // Create a new Set for the path history to maintain immutability for this path branch
      const updatedNodesVisited = new Set(currentPathState.nodesVisitedInPath);
      updatedNodesVisited.add(nextSegmentNode);

      pathCandidates.push({
        currentNode: nextSegmentNode,
        accumulatedDuration: newAccumulatedDuration,
        currentFuel: newCurrentFuel,
        nodesVisitedInPath: updatedNodesVisited
      });
    }
  } // End of for-loop for neighbors
} // End of while-loop for pathCandidates

// Output the final result
// If no path was found, shortestJourneyTime will still be Infinity
if (shortestJourneyTime === Infinity) {
  console.log(-1); // Indicate no path found
} else {
  console.log(shortestJourneyTime); // Output the minimum time
}