function ProcessInputData(inputString) {
  // Break down the entire incoming text into separate lines.
  inputString = inputString.split("\n");

  // Interpret the first line to extract graph dimensions.
  var graphDimensions = inputString[0].split(" ").map(value => +value);
  var numVertices = graphDimensions[0]; // Represents 'N' in typical graph problems.
  var numEdges = graphDimensions[1];    // Represents 'M' in typical graph problems.

  // Initialize a matrix to track the absence of edges in the original graph.
  // A value of 1 signifies no edge between two vertices (i.e., an edge in the complement graph).
  // A value of 0 signifies an edge exists between two vertices (i.e., no edge in the complement graph).
  var edgeAbsenceMatrix = Array(numVertices).fill(0).map(rowInitializer => Array(numVertices).fill(1));

  // Populate the edge absence matrix based on the provided edge list.
  // Each line after the first describes an edge.
  for (var currentEdgeIterator = 0; currentEdgeIterator < numEdges; currentEdgeIterator++) {
    // Parse the current edge, adjusting to zero-based indexing.
    var currentVertexPair = inputString[currentEdgeIterator + 1].split(" ").map(coordinate => coordinate - 1);
    // Mark the presence of an edge in the original graph by setting matrix entries to 0.
    // This reflects an undirected graph, so both (u,v) and (v,u) are updated.
    edgeAbsenceMatrix[currentVertexPair[0]][currentVertexPair[1]] = 0;
    edgeAbsenceMatrix[currentVertexPair[1]][currentVertexPair[0]] = 0;
  }

  // An array to flag whether a vertex has been visited during component exploration.
  var explorationFlags = Array(numVertices).fill(0);

  // A counter for the number of distinct connected components identified in the complement graph.
  var complementComponentCounter = 0;

  // Arrays to store the sizes of the two partitions (A and B) for each component of the complement graph.
  var componentPartitionA_sizes = [], componentPartitionB_sizes = [];

  // Iterate through all vertices to discover and process connected components of the complement graph.
  for (var currentVertexIndex = 0; currentVertexIndex < numVertices; currentVertexIndex++) {
    // If the current vertex has already been processed as part of another component, skip it.
    if (explorationFlags[currentVertexIndex]) continue;

    // Initialize partition counts for the new component being discovered.
    componentPartitionA_sizes[complementComponentCounter] = 0;
    componentPartitionB_sizes[complementComponentCounter] = 0;

    // Mark the current vertex as visited.
    explorationFlags[currentVertexIndex] = 1;

    // A temporary list to hold vertices that are *not* connected to the current vertex in the original graph (i.e.,
    // connected in the complement graph) and need further exploration.
    var complementNeighbors = [];

    // Search for neighbors of the current vertex in the complement graph.
    for (var potentialNeighborIndex = currentVertexIndex + 1; potentialNeighborIndex < numVertices; potentialNeighborIndex++) {
      // If there's no edge between currentVertexIndex and potentialNeighborIndex in the original graph (edgeAbsenceMatrix is 1),
      // it means they are connected in the complement graph.
      if (edgeAbsenceMatrix[currentVertexIndex][potentialNeighborIndex]) {
        componentPartitionA_sizes[complementComponentCounter] = 1; // Assign current vertex to partition A.
        complementNeighbors.push(potentialNeighborIndex);          // Add neighbor to the list for recursive exploration.
      }
    }

    // If complement neighbors were found, recursively explore this component.
    if (complementNeighbors.length) {
      // The recursive function 'checkBipartiteComponent' returns 1 if the component is not bipartite.
      if (checkBipartiteComponent(complementNeighbors, 1)) {
        console.log(-1); // Output -1 if the complement graph is not bipartite.
        return;          // Terminate execution.
      }
    } else {
      // If no complement neighbors, this vertex forms a trivial component by itself.
      componentPartitionA_sizes[complementComponentCounter] = 1;
    }
    // Advance the component counter.
    complementComponentCounter++;
  }

  // Dynamic programming array to track all possible sums of partition sizes (from componentPartitionA_sizes).
  // 'reachableSums[s] = 1' means that a sum 's' can be formed from combining partition sizes.
  var reachableSums = Array(numVertices).fill(0);

  // Initialize with the sizes of the first component's partitions.
  reachableSums[componentPartitionA_sizes[0]] = 1;
  reachableSums[componentPartitionB_sizes[0]] = 1;

  // Iterate through the remaining components to update reachable sums.
  for (var componentIndex = 1; componentIndex < componentPartitionA_sizes.length; componentIndex++) {
    // Iterate backwards to avoid using the same component's partition sizes multiple times within one step.
    for (var currentSumCheckIndex = numVertices - 1; currentSumCheckIndex >= 0; currentSumCheckIndex--) {
      // If 'currentSumCheckIndex' is a currently reachable sum.
      if (reachableSums[currentSumCheckIndex]) {
        reachableSums[currentSumCheckIndex] = 0; // Temporarily reset to prevent erroneous re-use.

        // Add the current component's partition A size to existing reachable sums.
        reachableSums[currentSumCheckIndex + componentPartitionA_sizes[componentIndex]] = 1;
        // Add the current component's partition B size to existing reachable sums.
        reachableSums[currentSumCheckIndex + componentPartitionB_sizes[componentIndex]] = 1;
      }
    }
  }

  // Determine the optimal partition size 'k' for one of the two cliques.
  // This 'k' minimizes the sum of edges within the two cliques, bringing them closer to N/2.
  var optimalCliqueSize = 0;
  for (var possibleSumValue = 0; possibleSumValue < numVertices; possibleSumValue++) {
    // If 'possibleSumValue' is a reachable sum for one of the cliques.
    if (reachableSums[possibleSumValue]) {
      // Update optimalCliqueSize to be the maximum of its current value and the minimum
      // of (possibleSumValue, numVertices - possibleSumValue).
      optimalCliqueSize = Math.max(optimalCliqueSize, Math.min(possibleSumValue, numVertices - possibleSumValue));
    }
  }

  // Calculate and print the total number of edges in the resulting co-bipartite graph.
  // This is the sum of edges within two complete subgraphs of sizes 'optimalCliqueSize' and 'numVertices - optimalCliqueSize'.
  console.log(optimalCliqueSize * (optimalCliqueSize - 1) / 2 + (numVertices - optimalCliqueSize) * (numVertices - optimalCliqueSize - 1) / 2);

  // Recursive function to explore a connected component of the complement graph.
  // It checks if the component is bipartite and populates partition sizes.
  function checkBipartiteComponent(nodesToProcess, currentPartitionSide) {
    // Base case: If there are no nodes left to process in this recursive call, return.
    if (!nodesToProcess.length) return;

    // List to hold nodes for the next level of recursion, belonging to the opposite partition.
    var nextLevelNodes = [];

    // Iterate through each node in the current batch for processing.
    for (var currentProcessingIndex = 0; currentProcessingIndex < nodesToProcess.length; currentProcessingIndex++) {
      var currentNodeIdentifier = nodesToProcess[currentProcessingIndex];

      // If this node has already been visited, skip to the next.
      if (explorationFlags[currentNodeIdentifier]) continue;

      // Mark the current node as visited.
      explorationFlags[currentNodeIdentifier] = 1;

      // Increment the count for the current partition side of the component.
      if (currentPartitionSide) {
        componentPartitionB_sizes[complementComponentCounter]++;
      } else {
        componentPartitionA_sizes[complementComponentCounter]++;
      }

      // Check for non-bipartite conditions within the current partition.
      // If two nodes within the same partition are connected in the complement graph, it's not bipartite.
      for (var subsequentNodeIndex = currentProcessingIndex + 1; subsequentNodeIndex < nodesToProcess.length; subsequentNodeIndex++) {
        var comparedNodeIdentifier = nodesToProcess[subsequentNodeIndex];
        // Skip if the compared node has already been visited.
        if (explorationFlags[comparedNodeIdentifier]) continue;
        // If there's an edge between currentNodeIdentifier and comparedNodeIdentifier in the complement graph (edgeAbsenceMatrix is 1),
        // it violates bipartiteness.
        if (edgeAbsenceMatrix[currentNodeIdentifier][comparedNodeIdentifier]) return 1; // Signal non-bipartite.
      }

      // Find all neighbors of the currentNodeIdentifier in the complement graph.
      for (var potentialComplementNeighbor = 0; potentialComplementNeighbor < numVertices; potentialComplementNeighbor++) {
        // If there IS an edge between currentNodeIdentifier and potentialComplementNeighbor in the complement graph (edgeAbsenceMatrix is 1).
        if (edgeAbsenceMatrix[currentNodeIdentifier][potentialComplementNeighbor]) {
          nextLevelNodes.push(potentialComplementNeighbor); // Add to the list for the next recursive call (opposite partition).
        }
      }
    }

    // Recursively call for the next set of nodes, flipping the partition side.
    // If the recursive call signals a non-bipartite condition, propagate it.
    if (checkBipartiteComponent(nextLevelNodes, currentPartitionSide ^ 1)) return 1;

    // If no non-bipartite condition was found in this branch, return (implicitly undefined, which is falsy).
  }
}

// Execute the main processing function by reading input from standard input.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));