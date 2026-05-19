(function(inputData) {
  // Process the raw input string
  var inputLines = inputData.trim().split('\n');

  // Extract graph dimensions from the first line
  var initialParams = inputLines.shift().split(' ').map(Number);
  var vertexCount = initialParams.shift(); // Number of vertices (N)
  var edgeCount = initialParams.shift(); // Number of edges (M)

  // Initialize data structures for graph representation and component tracking
  var adjacencyList = []; // Stores the graph as an adjacency list
  var componentIds = []; // Stores the component ID for each vertex

  // Populate initial graph structures
  for (var vtxIdx = 0; vtxIdx < vertexCount; vtxIdx++) {
    adjacencyList.push([]); // Each vertex gets an empty list for its neighbors
    componentIds.push(null); // Initialize all component IDs to null (unvisited)
  }

  // Read and build the graph edges
  for (var k = 0; k < edgeCount; k++) {
    var currentEdge = inputLines.shift().split(' ').map(Number);
    // Add edges to the adjacency list (undirected graph)
    adjacencyList[currentEdge[0]].push(currentEdge[1]);
    adjacencyList[currentEdge[1]].push(currentEdge[0]);
  }

  // Depth-First Search (DFS) function to find connected components
  function exploreComponent(startNode, componentIdentifier) {
    var traversalStack = [];
    componentIds[startNode] = componentIdentifier; // Assign component ID to the starting node
    traversalStack.push(startNode); // Add starting node to the stack

    // Continue as long as there are nodes to visit in the current component
    while (traversalStack.length > 0) {
      var currentNode = traversalStack.shift(); // Get the next node from the stack (BFS-like, but DFS can also use stack)

      // Iterate through neighbors of the current node
      for (var neighborIdx = 0; neighborIdx < adjacencyList[currentNode].length; neighborIdx++) {
        var neighborNode = adjacencyList[currentNode][neighborIdx];
        // If the neighbor has not been assigned a component ID yet
        if (!componentIds[neighborNode]) {
          componentIds[neighborNode] = componentIdentifier; // Assign the same component ID
          traversalStack.push(neighborNode); // Add neighbor to the stack for further exploration
        }
      }
    }
  }

  // Assign component IDs to all vertices using DFS
  var currentId = 1; // Start component IDs from 1
  for (var vtx = 0; vtx < vertexCount; vtx++) {
    // If a vertex hasn't been visited (i.e., not part of any component yet)
    if (!componentIds[vtx]) {
      exploreComponent(vtx, currentId++); // Start a new DFS from this vertex and increment component ID
    }
  }

  // Read the number of queries
  var queryCount = parseInt(inputLines.shift(), 10);

  // Process each query
  inputLines.forEach(function(queryLine) {
    var queryNodes = queryLine.split(' ').map(Number);
    // Check if the two queried nodes belong to the same connected component
    if (componentIds[queryNodes[0]] === componentIds[queryNodes[1]]) {
      console.log('yes'); // They are in the same component
    } else {
      console.log('no'); // They are in different components
    }
  });

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
