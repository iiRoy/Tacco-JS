'use strict';
(function(rawInputData){

  // Helper function to parse the input string into structured data
  function parseGraphInput(inputString) {
    const lines = inputString.trim().split('\n');
    const nodeCount = Number(lines.shift()); // Convert first line to number of nodes
    // Map remaining lines to arrays of numbers representing edges
    const edgeDataList = lines.map(lineStr => lineStr.split(/\s+/).map(Number));
    return { nodeCount, edgeDataList };
  }

  // Class to represent a node in the graph
  class GraphNode {
    constructor(nodeIdentifier) {
      this.nodeIdentifier = nodeIdentifier; // Store the node's ID for reference
      this.adjList = []; // Adjacency list, stores objects { target: number, parity: number }
      this.colorGroup = -1; // -1 indicates unvisited, 0 or 1 for assigned color group
    }
  }

  // Parse the initial input data
  const { nodeCount, edgeDataList } = parseGraphInput(rawInputData);

  // Initialize graph nodes. Array index 0 is unused to maintain 1-indexed node IDs.
  const graphNodes = Array.from({ length: nodeCount + 1 }, (_, idx) => {
    if (idx === 0) return null; // Placeholder for the unused 0-index
    return new GraphNode(idx);
  });

  // Populate adjacency lists based on the parsed edge data
  edgeDataList.forEach(function(edgeInfo){
    const sourceNodeId = edgeInfo[0];
    const targetNodeId = edgeInfo[1];
    const edgeWeightParity = edgeInfo[2] % 2; // Calculate parity once for clarity
    // Add edge to the source node's adjacency list using an object literal
    graphNodes[sourceNodeId].adjList.push({ target: targetNodeId, parity: edgeWeightParity });
  });

  // Initialize DFS stack with the starting node (node 1)
  const dfsStack = [1];
  // Assign initial color group to the starting node
  graphNodes[1].colorGroup = 0;

  // Perform an iterative Depth-First Search traversal
  while (dfsStack.length > 0) {
    const currentId = dfsStack[dfsStack.length - 1]; // Peek at the top of the stack to get current node ID
    const currentGraphNode = graphNodes[currentId]; // Get the actual GraphNode object

    // Check if the current node has any unprocessed edges in its adjacency list
    if (currentGraphNode.adjList.length === 0) {
      dfsStack.pop(); // All edges from this node have been processed, so backtrack
      continue; // Move to the next iteration of the while loop
    }

    // Get the last added edge from the current node's adjacency list.
    // This mimics the original's specific behavior of processing edges from the end.
    const nextEdgeToProcess = currentGraphNode.adjList[currentGraphNode.adjList.length - 1];
    const neighborId = nextEdgeToProcess.target;
    const edgeParity = nextEdgeToProcess.parity;
    const neighborGraphNode = graphNodes[neighborId];

    // Check if the neighbor node has been visited (colorGroup is -1 if unvisited)
    if (neighborGraphNode.colorGroup === -1) {
      // Neighbor is unvisited: assign its color group based on current node's color and edge parity
      neighborGraphNode.colorGroup = (currentGraphNode.colorGroup ^ edgeParity);
      dfsStack.push(neighborId); // Push the neighbor to the stack to visit it next
    } else {
      // Neighbor has already been visited: this edge is considered processed.
      // Remove it from the current node's adjacency list to avoid re-processing it.
      currentGraphNode.adjList.pop();
    }
  }

  // Collect the final color groups for all nodes (excluding the dummy 0-index)
  const finalColors = graphNodes.slice(1).map(node => node.colorGroup);

  // Output the results, each color group on a new line
  console.log(finalColors.join('\n'));

})(require('fs').readFileSync('/dev/stdin','utf8'));
