var initializeIslandStructures = (numEntities) => {
  // This array will hold all the island data.
  // Each island object contains its ancestor and its groupSize.
  // The index itself represents the island's identity.
  const landMasses = [];
  for (let idx = 0; idx < numEntities; idx++) {
    landMasses[idx] = {
      ancestor: idx, // Initially, each island is its own ancestor.
      groupSize: 1,  // Each island starts with a groupSize of one.
    };
  }
  return landMasses;
};

var areInSameCluster = (firstEntityIdx, secondEntityIdx, landMasses) => {
  // Determine if two entities belong to the same connected component.
  const secondRootNode = findClusterRoot(secondEntityIdx, landMasses);
  const firstRootNode = findClusterRoot(firstEntityIdx, landMasses);
  return (secondRootNode === firstRootNode);
};

var uniteLandMasses = (firstEntityIdx, secondEntityIdx, landMasses) => {
  // Combines two island clusters if they are not already connected.
  if (areInSameCluster(firstEntityIdx, secondEntityIdx, landMasses)) {
    return; // No action needed if already in the same cluster.
  }

  const secondRootNode = findClusterRoot(secondEntityIdx, landMasses);
  const firstRootNode = findClusterRoot(firstEntityIdx, landMasses);

  // Merge the smaller tree into the larger one by updating the ancestor.
  // For simplicity, we'll always merge the second into the first's root.
  firstRootNode.groupSize += secondRootNode.groupSize;
  secondRootNode.ancestor = firstEntityIdx; // Point the second root's ancestor to the first entity's index.
};

var findClusterRoot = (entityIndex, landMasses) => {
  // Finds the ultimate ancestor (root) of a given entity,
  // performing path compression for efficiency.
  const currentUnit = landMasses[entityIndex];

  if (currentUnit.ancestor === entityIndex) {
    return currentUnit; // If the entity is its own ancestor, it's the root.
  }

  // Recursively find the root and compress the path.
  const ultimateRoot = findClusterRoot(currentUnit.ancestor, landMasses);
  currentUnit.ancestor = ultimateRoot.ancestor; // Path compression: point directly to the ultimate root.
  return ultimateRoot;
};

var retrieveClusterSize = (entityIndex, landMasses) => {
  // Returns the groupSize of the cluster to which the entity belongs.
  const ultimateRoot = findClusterRoot(entityIndex, landMasses);
  return ultimateRoot.groupSize;
};

var processInputData = (rawData) => {
  // Parses the input string into a structured array of numbers.
  const parsedDataLines = rawData.split('\n').map(element => element.split(' ').map(item => parseInt(item, 10)));
  const totalNodes = parsedDataLines[0][0]; // N: total number of nodes (islands).
  const totalEdges = parsedDataLines[0][1]; // M: total number of edges (bridges).

  let reversedConnections = [];
  // Collect all bridge definitions.
  for (let counter = 0; counter < totalEdges; counter++) {
    reversedConnections.push(parsedDataLines[1 + counter]);
  }
  // Process bridges in reverse order of their removal.
  reversedConnections = reversedConnections.reverse();

  const landMasses = initializeIslandStructures(totalNodes);

  // Initial discomfort metric: N * (N - 1) / 2 represents all possible pairs of islands.
  let discomfortMetric = totalNodes * (totalNodes - 1) / 2;
  const outcomeValues = [discomfortMetric]; // Store initial discomfort.

  // Iterate through the bridges in reverse (effectively adding them one by one).
  for (const currentConnection of reversedConnections) {
    const firstEntityIdx = currentConnection[0] - 1; // Adjust to 0-based index.
    const secondEntityIdx = currentConnection[1] - 1; // Adjust to 0-based index.

    // If the two islands are not yet connected, adding this bridge will reduce discomfort.
    if (!areInSameCluster(firstEntityIdx, secondEntityIdx, landMasses)) {
      const differenceValue = retrieveClusterSize(firstEntityIdx, landMasses) * retrieveClusterSize(secondEntityIdx, landMasses);
      discomfortMetric -= differenceValue; // Reduce discomfort by the product of cluster sizes.
    }
    outcomeValues.push(discomfortMetric); // Record the discomfort after processing this bridge.

    // Connect the two islands.
    uniteLandMasses(firstEntityIdx, secondEntityIdx, landMasses);
  }

  // The results were collected in reverse order of bridge processing,
  // so reverse them again to get the order of bridge removal.
  const finalOrderedOutcomes = outcomeValues.reverse();

  // Output the discomfort values, skipping the initial state (index 0).
  for (let counter = 1; counter <= totalEdges; counter++) {
    console.log(finalOrderedOutcomes[counter]);
  }
};

// Read input from standard input and execute the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
