const parseLineOfNumbers = (line) => line.split(" ").map(Number);

const calculateCombinations = (n, k) => {
  if (k < 0 || k > n) {
    return 0;
  }
  if (k === 0 || k === n) {
    return 1;
  }
  if (k > n / 2) {
    k = n - k;
  }
  // This problem uses C(n, 2) which is n * (n - 1) / 2
  // We can simplify the combination function for this specific use case
  if (k === 2) {
    return n * (n - 1) / 2;
  }
  return 0; // Should not be reached for this problem's context
};

// This function performs a Breadth-First Search (BFS) to check if a connected component
// (defined by non-adjacency) is bipartite and calculates the sizes of its two partitions.
// It detects bipartiteness based on non-edges: if two nodes are non-adjacent (no edge),
// they must be in different partitions. If they are in the same partition AND non-adjacent,
// the component is not bipartite.
const determineComponentPartitions = (
  startingNode,
  componentId,
  totalNodes,
  nonAdjacentRelationship, // true if no edge, false if edge exists
  nodesVisitedTracker,
  partitionSetASizes,
  partitionSetBSizes,
  nodePartitionColors // 0: unassigned, 1: Set A, 2: Set B
) => {
  const traversalQueue = [];
  traversalQueue.push(startingNode);

  nodesVisitedTracker[startingNode] = true;
  nodePartitionColors[startingNode] = 1; // Assign starting node to Set A
  partitionSetASizes[componentId]++;

  let queuePointer = 0;
  while (queuePointer < traversalQueue.length) {
    const currentNode = traversalQueue[queuePointer++];
    const currentNodeColor = nodePartitionColors[currentNode];
    const nextNodeColor = 3 - currentNodeColor; // Toggles between 1 and 2

    for (let potentialNeighborIdx = 0; potentialNeighborIdx < totalNodes; potentialNeighborIdx++) {
      if (currentNode === potentialNeighborIdx) {
        continue;
      }

      // Check if currentNode and potentialNeighborIdx are non-adjacent (i.e., there is NO edge between them)
      if (nonAdjacentRelationship[currentNode][potentialNeighborIdx]) {
        if (nodePartitionColors[potentialNeighborIdx] === 0) { // If unvisited
          nodesVisitedTracker[potentialNeighborIdx] = true;
          nodePartitionColors[potentialNeighborIdx] = nextNodeColor;
          if (nextNodeColor === 1) {
            partitionSetASizes[componentId]++;
          } else {
            partitionSetBSizes[componentId]++;
          }
          traversalQueue.push(potentialNeighborIdx);
        } else if (nodePartitionColors[potentialNeighborIdx] === currentNodeColor) {
          // Found a non-adjacent pair (no edge) where both nodes are in the same partition.
          // This violates the condition for a bipartite partition based on non-edges.
          return false;
        }
      }
    }
  }
  return true; // Component is bipartite
};

function solveGraphPartitionProblem(rawDataString) {
  const lineFragments = rawDataString.trim().split('\n');
  if (lineFragments.length === 0) {
    return; // Handle empty input
  }

  const [totalVertices, totalEdges] = parseLineOfNumbers(lineFragments[0]);

  // Initialize a matrix where `true` means no edge exists (non-adjacent), `false` means an edge exists (adjacent).
  // Initially, assume all pairs are non-adjacent (no edges).
  const nonAdjacentPairs = Array.from({
    length: totalVertices
  }, () => Array(totalVertices).fill(true));

  // Process actual edges: mark pairs as adjacent (false in nonAdjacentPairs)
  for (let edgeLineIdx = 0; edgeLineIdx < totalEdges; edgeLineIdx++) {
    const [nodeU, nodeV] = parseLineOfNumbers(lineFragments[edgeLineIdx + 1]);
    nonAdjacentPairs[nodeU][nodeV] = false;
    nonAdjacentPairs[nodeV][nodeU] = false;
  }

  const nodesVisitedTracker = Array(totalVertices).fill(false);
  const nodePartitionColors = Array(totalVertices).fill(0); // 0: unassigned, 1: Set A, 2: Set B

  const componentPartitionASizes = [];
  const componentPartitionBSizes = [];
  let currentComponentIdentifier = 0;

  // Iterate through all nodes to find connected components (based on non-adjacency)
  // and check for bipartiteness while counting partition sizes.
  for (let vertexIdx = 0; vertexIdx < totalVertices; vertexIdx++) {
    if (nodesVisitedTracker[vertexIdx]) {
      continue; // Already processed as part of another component
    }

    componentPartitionASizes[currentComponentIdentifier] = 0;
    componentPartitionBSizes[currentComponentIdentifier] = 0;

    // Reset partition colors for the new component's traversal
    nodePartitionColors.fill(0);

    const isCurrentComponentBipartite = determineComponentPartitions(
      vertexIdx,
      currentComponentIdentifier,
      totalVertices,
      nonAdjacentPairs,
      nodesVisitedTracker,
      componentPartitionASizes,
      componentPartitionBSizes,
      nodePartitionColors
    );

    if (!isCurrentComponentBipartite) {
      console.log(-1);
      return;
    }
    currentComponentIdentifier++;
  }

  // Dynamic programming to find all possible sums of partition sizes.
  // We want to select one partition from each component (either Set A or Set B size)
  // such that their total sum is as close to totalVertices / 2 as possible.
  let reachablePartitionSums = new Set([0]); // Start with sum 0

  for (let compIdx = 0; compIdx < currentComponentIdentifier; compIdx++) {
    const currentComponentSumA = componentPartitionASizes[compIdx];
    const currentComponentSumB = componentPartitionBSizes[compIdx];
    const newPossibleSums = new Set();

    for (const existingSum of reachablePartitionSums) {
      newPossibleSums.add(existingSum + currentComponentSumA);
      newPossibleSums.add(existingSum + currentComponentSumB);
    }
    reachablePartitionSums = newPossibleSums;
  }

  let optimalPartitionSize = 0;
  let minDifference = Infinity;

  // Find the sum `s` from `reachablePartitionSums` that minimizes `|s - (totalVertices - s)|`.
  // This is equivalent to minimizing `|2s - totalVertices|`.
  for (const currentSum of reachablePartitionSums) {
    const currentDifference = Math.abs(2 * currentSum - totalVertices);
    if (currentDifference < minDifference) {
      minDifference = currentDifference;
      optimalPartitionSize = currentSum;
    }
  }

  // The final calculation: C(optimalPartitionSize, 2) + C(totalVertices - optimalPartitionSize, 2)
  const result = calculateCombinations(optimalPartitionSize, 2) +
                 calculateCombinations(totalVertices - optimalPartitionSize, 2);

  console.log(result);
}

solveGraphPartitionProblem(require("fs").readFileSync("/dev/stdin", "utf8"));