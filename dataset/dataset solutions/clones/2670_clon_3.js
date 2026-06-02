var rawInputString = require('fs').readFileSync('/dev/stdin', 'utf8');

// Helper function to parse each line of input
const parseInputLine = (lineContent) => {
  return lineContent.split(" ").map(Number);
};

var parsedInputData = rawInputString.split("\n").map(parseInputLine);

const initialConfig = parsedInputData.shift();
const numNodes = initialConfig[0];
const penaltyPerHop = initialConfig[2];

let maxScore = -1;

// Initialize adjacency list for graph representation
const adjacencyList = Object.create(null); // Using Object.create(null) for a cleaner map
for (let nodeIdentifier = 1; nodeIdentifier <= numNodes; nodeIdentifier++) {
  adjacencyList[nodeIdentifier] = [];
}

// Populate adjacency list with edge information
for (const edgeDetails of parsedInputData) {
  const sourceNodeId = edgeDetails[0];
  const destinationNodeId = edgeDetails[1];
  const edgeWeight = edgeDetails[2];
  adjacencyList[sourceNodeId].push([destinationNodeId, edgeWeight]);
}

(() => {
  let currentPathNodes = [1]; // Stores the sequence of nodes visited
  let currentPathGains = [0]; // Stores the gain accumulated at each step (edge weight to reach that node)
  let explorationStack = [Array.from(adjacencyList[1])]; // Stack to manage branches
  let currentBranchEdges = explorationStack.pop(); // Edges to explore from the current node

  // Helper function for backtracking
  const performBacktrack = () => {
    currentPathNodes.pop();
    currentPathGains.pop();
    if (explorationStack.length > 0) {
      currentBranchEdges = explorationStack.pop();
      return true; // Successfully backtracked, more paths to explore
    }
    return false; // No more paths to explore, terminate traversal
  };

  while (true) {
    // If no more edges in the current branch, backtrack
    while (currentBranchEdges.length === 0) {
      if (!performBacktrack()) {
        return; // Exit the IIFE if no more paths to explore
      }
    }

    const currentEdge = currentBranchEdges.pop();
    const nextNodeId = currentEdge[0];
    const edgeWeight = currentEdge[1];

    // Check if the next node is the target node
    if (nextNodeId === numNodes) {
      const totalPathGain = currentPathGains.reduce((accumulator, currentVal) => accumulator + currentVal, 0) + edgeWeight;
      const totalHops = currentPathNodes.length + 1; // Number of nodes in path including start and end
      const pathPenalty = penaltyPerHop * totalHops;
      const calculatedScore = totalPathGain - pathPenalty;
      maxScore = Math.max(calculatedScore, maxScore);
    }

    // Check for loops (revisiting a node in the current path)
    if (currentPathNodes.includes(nextNodeId)) {
      console.log("loop detected");
      continue; // Skip this path, it's a loop
    }

    // If the next node has outgoing edges, extend the path
    const outgoingEdges = adjacencyList[nextNodeId];
    const hasOutgoingEdges = outgoingEdges && outgoingEdges.length > 0;

    if (hasOutgoingEdges) {
      explorationStack.push(currentBranchEdges); // Save current branch for later
      currentBranchEdges = Array.from(outgoingEdges); // Start exploring new branch
      currentPathNodes.push(nextNodeId);
      currentPathGains.push(edgeWeight);
    }
    // If no outgoing edges and not the target, this path ends here.
    // The loop will naturally backtrack when currentBranchEdges becomes empty.
  }
})();

console.log(maxScore);
