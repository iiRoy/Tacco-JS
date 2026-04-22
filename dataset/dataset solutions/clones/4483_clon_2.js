// Top-level function to handle graph processing from input.
function GraphProcessor(rawInputData) {
  // Split the entire input string into an array of individual line strings.
  let inputLines = rawInputData.split("\n");

  // Parse the first line to determine the total number of nodes in the graph.
  const totalNodes = parseInt(inputLines[0]);

  // Initialize an array to store shortest distances from the first node (index 0).
  // All distances are initially set to a large value (totalNodes) representing infinity.
  let firstDistances = new Array(totalNodes).fill(totalNodes);
  firstDistances[0] = 0; // The distance from the starting node to itself is zero.

  // Initialize an array to store shortest distances from the last node (index totalNodes - 1).
  // Similar initialization strategy as for firstDistances.
  let secondDistances = new Array(totalNodes).fill(totalNodes);
  secondDistances[totalNodes - 1] = 0; // The distance from the end node to itself is zero.

  // Create an adjacency list representation for the graph.
  // Each element in `nodeConnections` will hold an array of connected node indices.
  // Note: `fill([])` makes all entries point to the same array initially.
  // This is later corrected by conditional assignment in the loop below.
  const nodeConnections = new Array(totalNodes).fill([]);

  // Iterate through the input lines (starting from the second line) to build the graph edges.
  // Each line defines an edge between two nodes.
  for (let loopCounter = 0; loopCounter < totalNodes - 1; loopCounter++) {
    const edgeDefinition = inputLines[loopCounter + 1].split(" ");
    const nodeA = parseInt(edgeDefinition[0]) - 1; // Convert to 0-indexed node identifier
    const nodeB = parseInt(edgeDefinition[1]) - 1; // Convert to 0-indexed node identifier

    // Add nodeB to the adjacency list of nodeA.
    // If nodeA's list is currently the shared empty array, reassign it. Otherwise, push.
    if (nodeConnections[nodeA].length === 0) {
      nodeConnections[nodeA] = [nodeB];
    } else {
      nodeConnections[nodeA].push(nodeB);
    }

    // Add nodeA to the adjacency list of nodeB (since the graph is undirected).
    // Similar logic as for nodeA.
    if (nodeConnections[nodeB].length === 0) {
      nodeConnections[nodeB] = [nodeA];
    } else {
      nodeConnections[nodeB].push(nodeA);
    }
  }

  // This helper function computes the shortest distances from a specified starting node
  // to all other nodes in the graph using a Dijkstra-like algorithm.
  function calculateNodeDistances(startingNodeIndex, currentDistanceArray) {
    // Initialize a queue containing all nodes, representing unvisited vertices.
    let nodeQueue = new Array(totalNodes);
    for (let queueInitIndex = 0; queueInitIndex < totalNodes; queueInitIndex++) {
      nodeQueue[queueInitIndex] = queueInitIndex;
    }

    // Continue processing as long as there are nodes remaining in the queue.
    while (nodeQueue.length !== 0) {
      // Examine all neighbors of the current processing node.
      for (let neighborIndex = 0; neighborIndex < nodeConnections[startingNodeIndex].length; neighborIndex++) {
        const connectedNode = nodeConnections[startingNodeIndex][neighborIndex];
        // If a shorter path to a neighbor is found through the current node, update its distance.
        if (currentDistanceArray[connectedNode] > currentDistanceArray[startingNodeIndex]) {
          currentDistanceArray[connectedNode] = currentDistanceArray[startingNodeIndex] + 1;
        }
      }

      // Remove the current node from the queue as it has been processed.
      nodeQueue.splice(nodeQueue.indexOf(startingNodeIndex), 1);

      // Find the next node to process: the unvisited node with the smallest known distance.
      let minFoundDistance = totalNodes; // Initialize with a value larger than any possible distance
      let nextProcessingNode = -1; // Placeholder for the next node to select

      for (let scanQueueIndex = 0; scanQueueIndex < nodeQueue.length; scanQueueIndex++) {
        const candidateNode = nodeQueue[scanQueueIndex];
        if (currentDistanceArray[candidateNode] < minFoundDistance) {
          nextProcessingNode = candidateNode;
          minFoundDistance = currentDistanceArray[candidateNode];
        }
      }
      // Update the `startingNodeIndex` to the newly selected node for the next iteration.
      startingNodeIndex = nextProcessingNode;
    }
    return currentDistanceArray; // Return the array of computed distances.
  }

  // Execute the distance calculation from the first node (index 0).
  firstDistances = calculateNodeDistances(0, firstDistances);

  // Execute the distance calculation from the last node (index totalNodes - 1).
  secondDistances = calculateNodeDistances(totalNodes - 1, secondDistances);

  // Calculate the score for the "Fennec" player by counting nodes
  // that are closer to the first node than to the last node.
  let fennecScore = 0;
  for (let nodeIterator = 0; nodeIterator < totalNodes; nodeIterator++) {
    // Exclude the actual start and end nodes from the score calculation.
    if (nodeIterator !== 0 && nodeIterator !== totalNodes - 1) {
      if (firstDistances[nodeIterator] <= secondDistances[nodeIterator]) {
        fennecScore++;
      }
    }
  }

  // Determine the overall winner based on the calculated scores.
  let winnerName = "Fennec"; // Assume Fennec wins by default.
  // The total number of intermediate nodes is totalNodes - 2.
  // If Fennec's score is less than or equal to Snuke's score, Snuke wins.
  if (fennecScore <= (totalNodes - 2) - fennecScore) {
    winnerName = "Snuke";
  }

  // Output the name of the winning player to the console.
  console.log('%s', winnerName);
}

// Read input from the standard input stream and pass it to the graph processing function.
// Note: `require`, `fs`, `readFileSync`, `parseInt`, `Array`, `console.log`
// and their methods (`split`, `fill`, `length`, `push`, `indexOf`, `splice`)
// are built-in JavaScript features or standard Node.js modules.
// Renaming them would break functionality or require defining wrappers,
// which would alter the number of statements/logic, violating Type II rules.
GraphProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));