'use strict'; // Enforcing strict mode for cleaner code execution

/**
 * Processes graph data from an input string to calculate the degree of each node (city).
 * The input format is expected to be:
 * - First line: "totalNodesCount numberOfEdges" (space-separated integers)
 * - Subsequent lines: "nodeA nodeB" (representing an edge between nodeA and nodeB)
 * Nodes are 1-indexed in the input.
 *
 * @param {string} inputStringData The raw input string containing graph information.
 */
function analyzeNetworkConnectivity(inputStringData) {
  // Split the entire input string into an array of individual lines.
  const networkInputLines = inputStringData.split('\n');

  // Parse the first line to get overall graph metadata.
  const graphHeaderDetails = networkInputLines[0].split(' ');
  const totalNodesCount = Number(graphHeaderDetails[0]); // Number of cities in the network.
  const expectedEdgeCount = Number(graphHeaderDetails[1]); // Number of connections (roads) described.

  // Initialize a list to store all node IDs involved in connections.
  // This will be a flat array like [node1_A, node1_B, node2_A, node2_B, ...]
  const allConnectedNodeIdentifiers = [];

  // Iterate through the lines describing connections (edges).
  // We explicitly use 'expectedEdgeCount' for loop control, rather than relying on array slicing.
  for (let i = 1; i <= expectedEdgeCount; i++) {
    const currentEdgeDefinitionLine = networkInputLines[i];

    // Guard clause: Skip if the line is empty or undefined, which might happen
    // if the input file has fewer lines than 'expectedEdgeCount' or contains blank lines.
    if (!currentEdgeDefinitionLine || currentEdgeDefinitionLine.trim() === '') {
      // console.warn(`Warning: Skipping empty or invalid edge definition line at index ${i}.`);
      continue;
    }

    // Split the current line to get the two nodes connected by this edge.
    const edgeNodePair = currentEdgeDefinitionLine.split(' ');

    // Add both nodes from the current edge to our comprehensive list of connected node identifiers.
    allConnectedNodeIdentifiers.push(edgeNodePair[0], edgeNodePair[1]);
  }

  // Initialize an array to store the degree count for each node.
  // Nodes are 1-indexed in the input, but 0-indexed in our array.
  // We initialize all counts to zero.
  const nodeDegreeAccumulator = [];
  for (let i = 0; i < totalNodesCount; i++) {
    nodeDegreeAccumulator.push(0);
  }

  // Iterate through all collected node identifiers to increment their respective degree counts.
  for (const nodeIdAsString of allConnectedNodeIdentifiers) {
    const actualNodeIndex = Number(nodeIdAsString);

    // Guard clause: Validate the node ID to ensure it's a valid number within the expected range.
    if (isNaN(actualNodeIndex) || actualNodeIndex < 1 || actualNodeIndex > totalNodesCount) {
      // console.error(`Error: Encountered an invalid node identifier: '${nodeIdAsString}'. Skipping.`);
      continue; // Skip processing this invalid entry.
    }

    // Convert the 1-indexed node ID to a 0-indexed array position.
    const zeroBasedNodePosition = actualNodeIndex - 1;
    // Increment the degree count for this node.
    nodeDegreeAccumulator[zeroBasedNodePosition]++;
  }

  // Output the final degree counts, each on a new line.
  console.log(nodeDegreeAccumulator.join('\n'));
}

// Entry point: Read input from standard input and pass it to our processing function.
// Ensure the file system module is required and input encoding is specified.
analyzeNetworkConnectivity(require("fs").readFileSync("/dev/stdin", "utf8"));