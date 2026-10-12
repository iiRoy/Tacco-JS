((rawData) => {
  const parsedInput = rawData.split('\n')[0].split(' ');

  // Determine the total number of nodes in the graph
  const nodeCount = +parsedInput[0];
  // Identify the desired count of node pairs with a shortest path of 2
  const targetK = +parsedInput[1];

  // If there are too few nodes, it's impossible to satisfy the condition
  if (nodeCount <= 2) {
    console.log('-1');
    return;
  }

  // Calculate the maximum possible number of pairs with shortest path 2
  // This occurs when node 1 is connected to all other nodes, and then
  // additional edges are added between nodes 2, 3, ..., N.
  // The formula (N-2)*(N-1)/2 represents combinations of (N-1) nodes taken 2 at a time,
  // excluding node 1, which would have a path of 2 to each other.
  const maximumPossible = (nodeCount - 2) * (nodeCount - 1) / 2;

  // If the desired K exceeds the maximum possible, it's an invalid scenario
  if (targetK > maximumPossible) {
    console.log('-1');
    return;
  }

  // Initialize connections: connect node 1 to all other nodes (2 through N).
  // This ensures all nodes have a path of 1 to node 1, and a path of 2 to each other
  // (via node 1) if they are not directly connected.
  const connectionList = Array(nodeCount - 1)
    .fill(null)
    .map((_unused, idx) => [1, idx + 2])
    .concat(
      // Add additional edges to reduce the count of shortest paths of length 2.
      // Each direct edge added between two nodes (not involving node 1)
      // reduces the number of pairs with shortest path 2 by one.
      // We need to add (maximumPossible - targetK) such edges.
      Array(maximumPossible - targetK)
        .fill(null)
        .map((_unused, idx) => [idx + 2, idx + 3])
    );

  // Output the total number of edges in the constructed graph
  console.log(connectionList.length);
  // Output each edge on a new line, with node numbers separated by a space
  console.log(connectionList.map(currentConnection => currentConnection.join(' ')).join('\n'));
})(
  require("fs").readFileSync("/dev/stdin", "utf8")
);
