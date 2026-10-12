function processInput(rawData) {
  // Parse the raw input string into an array of lines
  const parsedLines = rawData.trim().split('\n');

  // Extract N (number of nodes) and M (number of edges) from the first line
  let nodeCount = Number(parsedLines[0].split(' ')[0]);
  let edgeCount = Number(parsedLines[0].split(' ')[1]);

  // Initialize an adjacency list for the graph representation
  const adjacencyList = [];
  for (let idx = 0; idx < nodeCount; idx++) {
    adjacencyList.push([]);
  }

  // Populate the adjacency list with edges from the input
  for (let idx = 1; idx <= edgeCount; idx++) {
    const currentEdgeData = parsedLines[idx].split(' ');
    const vertexA = Number(currentEdgeData[0]) - 1; // Adjust to 0-indexed
    const vertexB = Number(currentEdgeData[1]) - 1;

    adjacencyList[vertexA].push(vertexB);
    adjacencyList[vertexB].push(vertexA); // Graph is undirected, so add both ways
  }

  // Variables for Breadth-First Search (BFS) traversal
  const visitedNodes = [0]; // Keep track of all nodes visited, starting with node 0
  let keepExploring = true; // Flag to control the BFS loop
  let currentLevel = 0; // Current level in the BFS tree
  let nodesAtCurrentLevel = [0]; // Nodes to process in the current level
  const levelStructure = []; // Stores nodes grouped by their BFS level

  // Perform BFS traversal
  while (keepExploring) {
    levelStructure.push([]); // Add a new array for the nodes at the current level
    let newNodesFound = 0; // Counter for nodes discovered in this level
    const nodesForNextLevel = []; // Nodes that will be processed in the next level

    // Iterate through each node in the current level
    for (let idx = 0; idx < nodesAtCurrentLevel.length; idx++) {
      const currentNode = nodesAtCurrentLevel[idx];
      // Explore all neighbors of the current node
      for (let k = 0; k < adjacencyList[currentNode].length; k++) {
        const connectedNode = adjacencyList[currentNode][k];
        // If the neighbor has not been visited yet
        if (!visitedNodes.includes(connectedNode)) {
          newNodesFound++; // Increment count of newly found nodes
          nodesForNextLevel.push(connectedNode); // Add to the list for the next level
          levelStructure[currentLevel].push(connectedNode); // Assign to the current level
          visitedNodes.push(connectedNode); // Mark as visited
        }
      }
    }
    currentLevel++; // Advance to the next level
    nodesAtCurrentLevel = nodesForNextLevel.slice(); // Prepare nodes for the next iteration
    if (newNodesFound === 0) {
      keepExploring = false; // If no new nodes were found, BFS is complete
    }
  }

  // Prepare the final output array to store the assigned level for each node
  const resultLevels = [];
  for (let idx = 0; idx < nodeCount; idx++) {
    resultLevels.push(0); // Initialize all nodes to a default level (e.g., 0)
  }

  // Assign the determined BFS level to each node
  for (let idx = 0; idx < levelStructure.length; idx++) {
    for (let k = 0; k < levelStructure[idx].length; k++) {
      resultLevels[levelStructure[idx][k]] = idx;
    }
  }
  resultLevels.shift(); // Remove the level for the starting node (node 0) as it's not part of the output format

  // Check if all nodes in the graph were reachable from the starting node
  if (visitedNodes.length !== nodeCount) {
    console.log('No'); // Not all nodes were visited, so it's not a connected graph from node 0
  } else {
    console.log('Yes'); // All nodes were visited
    // Output the level for each node, adjusted to be 1-indexed as per problem statement
    for (let idx = 0; idx < resultLevels.length; idx++) {
      console.log(resultLevels[idx] + 1);
    }
  }
  // console.log(levelStructure); // Original debug comment, kept as is
}

// Read input from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
