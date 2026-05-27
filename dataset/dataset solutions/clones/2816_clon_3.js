((rawInputString) => {
  const NEWLINE_SEPARATOR = '\n';
  const SPACE_SEPARATOR = ' ';
  const MIN_VALID_NODE_COUNT = 2;
  const CENTRAL_NODE_IDENTIFIER = 1;
  const NODE_OFFSET_FOR_PAIRS = 2; // Used for nodes 2, 3, ...
  const PAIR_INCREMENT = 1; // For (X, X+1) pairs

  // Helper function to compute the maximum possible K for a given N
  const computeMaxKValue = (currentNValue) => {
    if (currentNValue <= MIN_VALID_NODE_COUNT) {
      return 0;
    }
    const nonCentralNodeCount = currentNValue - CENTRAL_NODE_IDENTIFIER;
    // This formula calculates (N-1)C2, which is the number of pairs
    // among nodes {2, ..., N}. Each such pair (X,Y) has distance 2
    // via X-1-Y if no direct edge exists.
    return (nonCentralNodeCount * (nonCentralNodeCount - PAIR_INCREMENT)) / MIN_VALID_NODE_COUNT;
  };

  const firstInputLine = rawInputString.split(NEWLINE_SEPARATOR)[0];
  const inputSegments = firstInputLine.split(SPACE_SEPARATOR);

  const nodeQuantity = Number(inputSegments[0]); // Corresponds to N
  const targetKValue = Number(inputSegments[1]);   // Corresponds to K

  if (nodeQuantity <= MIN_VALID_NODE_COUNT) {
    console.log('-1');
    return;
  }

  const maximumAchievableK = computeMaxKValue(nodeQuantity);

  // This condition `N > max` is preserved exactly as in the original code,
  // even though it implies specific constraints on N (e.g., N must be >= 5).
  if (nodeQuantity > maximumAchievableK) {
    console.log('-1');
    return;
  }

  // Phase 1: Establish connections from the central node (1) to all other nodes (2 to N)
  const initialConnectionCount = nodeQuantity - CENTRAL_NODE_IDENTIFIER; // N-1 connections
  const primaryEdgeList = Array.from({ length: initialConnectionCount }, (_, indexPosition) => {
    const connectedNodeId = indexPosition + NODE_OFFSET_FOR_PAIRS; // Generates 2, 3, ..., N
    return [CENTRAL_NODE_IDENTIFIER, connectedNodeId];
  });

  // Phase 2: Add additional edges to reduce the count of distance-2 pairs to targetKValue.
  // Each added direct edge (X,Y) where X,Y != 1 reduces the number of distance-2 pairs by one.
  const numberOfEdgesToAppend = maximumAchievableK - targetKValue;
  const secondaryEdgeList = Array.from({ length: numberOfEdgesToAppend }, (_, indexPosition) => {
    const firstNodeOfPair = indexPosition + NODE_OFFSET_FOR_PAIRS; // Generates 2, 3, ..., (numberOfEdgesToAppend + 1)
    const secondNodeOfPair = firstNodeOfPair + PAIR_INCREMENT;      // Generates 3, 4, ..., (numberOfEdgesToAppend + 2)
    return [firstNodeOfPair, secondNodeOfPair];
  });

  const finalEdgeCollection = primaryEdgeList.concat(secondaryEdgeList);

  console.log(finalEdgeCollection.length);
  console.log(finalEdgeCollection.map(edgeTuple => edgeTuple.join(SPACE_SEPARATOR)).join(NEWLINE_SEPARATOR));

})(
  require("fs").readFileSync("/dev/stdin", "utf8")
);
