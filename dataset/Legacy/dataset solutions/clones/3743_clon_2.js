function ProcessInput(rawInput) {
  // Split the input string into lines.
  let inputLines = rawInput.split("\n");

  // Parse the first line to get nodeCount and edgeCount.
  let dimensions = inputLines[0].split(" ").map((val) => Number(val));
  let edgeCount = dimensions[1];
  let nodeCount = dimensions[0];

  // Initialize an adjacency matrix 'missingEdges'.
  // A value of 1 indicates no edge, 0 indicates an edge.
  // Initially, assume all possible edges are missing (no edges exist).
  // This is a bit counter-intuitive, but matches the original logic.
  let missingEdges = new Array(nodeCount).fill(0).map(() => new Array(nodeCount).fill(1));

  // Process each edge from the input.
  // For each given edge, mark it as existing (0) in the matrix.
  for (let idxA = 0; idxA < edgeCount; idxA++) {
    let edgeEndpoints = inputLines[idxA + 1].split(" ").map((val) => parseInt(val, 10) - 1);
    let nodeU = edgeEndpoints[0];
    let nodeV = edgeEndpoints[1];
    missingEdges[nodeU][nodeV] = 0; // Mark edge (U,V) as existing
    missingEdges[nodeV][nodeU] = 0; // Mark edge (V,U) as existing (undirected graph)
  }

  // Array to keep track of visited nodes during component exploration.
  let visitedNodes = new Array(nodeCount).fill(0);

  // Counter for the number of distinct components found.
  let componentIndex = 0;

  // Arrays to store the sizes of the two partitions within each component.
  let partitionOneSizes = [];
  let partitionTwoSizes = [];

  // Iterate through all nodes to find and process connected components.
  for (let idxA = 0; idxA < nodeCount; idxA++) {
    // If the current node has already been visited, skip it.
    if (visitedNodes[idxA]) {
      continue;
    }

    // Initialize partition sizes for the new component.
    partitionOneSizes[componentIndex] = 0;
    partitionTwoSizes[componentIndex] = 0;

    // Mark the current node as visited.
    visitedNodes[idxA] = 1;

    // Temporary array to store nodes that are not connected to the current node 'idxA'.
    let unconnectedNodes = [];

    // Find nodes that are not connected to 'idxA' (i.e., missingEdges[idxA][idxB] is 1).
    // These nodes will be part of the other partition or a different component.
    for (let idxB = idxA + 1; idxB < nodeCount; idxB++) {
      if (missingEdges[idxA][idxB]) {
        partitionOneSizes[componentIndex] = 1; // Increment count for partition one
        unconnectedNodes.push(idxB);
      }
    }

    // If there are nodes not connected to 'idxA', explore them recursively.
    if (unconnectedNodes.length) {
      // The 'exploreComponent' function returns 1 if an invalid configuration is found.
      if (exploreComponent(unconnectedNodes, 1)) {
        console.log(-1); // Output -1 and terminate if an issue is detected.
        return;
      }
    } else {
      // If 'idxA' is connected to all other nodes (or is isolated), it forms a partition of size 1.
      partitionOneSizes[componentIndex] = 1;
    }

    // Move to the next component.
    componentIndex++;
  }

  // Dynamic programming array to find possible sums of partition sizes.
  // 'possibleSums[j]' will be 1 if 'j' can be formed as a sum of partition sizes.
  let possibleSums = new Array(nodeCount).fill(0);

  // Initialize with the sizes of the first component.
  possibleSums[partitionOneSizes[0]] = 1;
  possibleSums[partitionTwoSizes[0]] = 1;

  // Iterate through the remaining components.
  for (let idxA = 1; idxA < partitionOneSizes.length; idxA++) {
    // Iterate backwards through possible sums to avoid using newly set values in the same iteration.
    for (let idxB = nodeCount - 1; idxB >= 0; idxB--) {
      if (possibleSums[idxB]) {
        possibleSums[idxB] = 0; // Reset current sum to prevent double counting
        possibleSums[idxB + partitionOneSizes[idxA]] = 1; // Add partitionOneSize to current sum
        possibleSums[idxB + partitionTwoSizes[idxA]] = 1; // Add partitionTwoSize to current sum
      }
    }
  }

  // Find the optimal partition size 'optimalPartitionSize'.
  // This aims to find a sum 'i' such that min(i, nodeCount - i) is maximized.
  let optimalPartitionSize = 0;
  for (let idxA = 0; idxA < nodeCount; idxA++) {
    if (possibleSums[idxA]) {
      optimalPartitionSize = Math.max(optimalPartitionSize, Math.min(idxA, nodeCount - idxA));
    }
  }

  // Calculate and print the final result.
  // This formula represents the sum of edges in two cliques of sizes 'optimalPartitionSize' and 'nodeCount - optimalPartitionSize'.
  console.log(optimalPartitionSize * (optimalPartitionSize - 1) / 2 + (nodeCount - optimalPartitionSize) * (nodeCount - optimalPartitionSize - 1) / 2);

  // Recursive helper function to explore a component and assign nodes to partitions.
  // 'currentNodes' is an array of nodes to process.
  // 'currentPartitionFlag' determines which partition (0 or 1) to assign nodes to.
  function exploreComponent(currentNodes, currentPartitionFlag) {
    // Base case: if no nodes to process, return.
    if (!currentNodes.length) {
      return;
    }

    // Array to store nodes for the next recursive call.
    let nextNodesToExplore = [];

    // Iterate through the nodes in the current batch.
    for (let idxA = 0; idxA < currentNodes.length; idxA++) {
      let currentNode = currentNodes[idxA];

      // If the node has already been visited, skip it.
      if (visitedNodes[currentNode]) {
        continue;
      }

      // Mark the node as visited.
      visitedNodes[currentNode] = 1;

      // Increment the count for the appropriate partition in the current component.
      if (currentPartitionFlag) {
        partitionTwoSizes[componentIndex]++;
      } else {
        partitionOneSizes[componentIndex]++;
      }

      // Check for invalid configurations within the current batch of nodes.
      // If two nodes in the same partition are not connected (missingEdges[...][...] is 1),
      // then this is an invalid partitioning, so return 1.
      for (let idxB = idxA + 1; idxB < currentNodes.length; idxB++) {
        let otherNode = currentNodes[idxB];
        if (visitedNodes[otherNode]) {
          continue;
        }
        if (missingEdges[currentNode][otherNode]) {
          return 1; // Invalid: two nodes in the same partition are not connected.
        }
      }

      // Find nodes that are not connected to 'currentNode' and add them to 'nextNodesToExplore'.
      // These nodes will be explored in the opposite partition.
      for (let idxB = 0; idxB < nodeCount; idxB++) {
        if (missingEdges[currentNode][idxB]) {
          nextNodesToExplore.push(idxB);
        }
      }
    }

    // Recursively call 'exploreComponent' for the next set of nodes,
    // switching the partition flag (0 becomes 1, 1 becomes 0).
    if (exploreComponent(nextNodesToExplore, currentPartitionFlag ^ 1)) {
      return 1; // Propagate the error if an invalid configuration is found deeper.
    }
  }
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
