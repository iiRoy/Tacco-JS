function Main(inputString) {
  const lines = inputString.split("\n");

  const firstLineNumbers = lines[0].split(" ").map(Number);
  const nodeCount = firstLineNumbers[0];
  const edgeCount = firstLineNumbers[1];

  const noEdgeMap = Array.from({ length: nodeCount }, () => Array(nodeCount).fill(1));

  for (let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
    const currentEdgeNodes = lines[edgeIdx + 1].split(" ").map(val => Number(val) - 1);
    const u = currentEdgeNodes[0];
    const v = currentEdgeNodes[1];
    noEdgeMap[u][v] = 0;
    noEdgeMap[v][u] = 0;
  }

  const visitedNodes = Array(nodeCount).fill(0);

  const partitionASizes = [];
  const partitionBSizes = [];
  let componentCounter = 0;

  function checkBipartiteComponent(nodesToProcess, currentPartition) {
    if (nodesToProcess.length === 0) {
      return;
    }

    const nextNodesForOppositePartition = [];

    for (let i = 0; i < nodesToProcess.length; i++) {
      const currentNode = nodesToProcess[i];

      if (visitedNodes[currentNode]) {
        continue;
      }

      visitedNodes[currentNode] = 1;

      if (currentPartition === 1) {
        partitionBSizes[componentCounter]++;
      } else {
        partitionASizes[componentCounter]++;
      }

      for (let j = i + 1; j < nodesToProcess.length; j++) {
        const otherNode = nodesToProcess[j];
        if (visitedNodes[otherNode]) {
          continue;
        }
        if (noEdgeMap[currentNode][otherNode]) {
          return 1;
        }
      }

      for (let neighborIdx = 0; neighborIdx < nodeCount; neighborIdx++) {
        if (noEdgeMap[currentNode][neighborIdx]) {
          nextNodesForOppositePartition.push(neighborIdx);
        }
      }
    }

    if (checkBipartiteComponent(nextNodesForOppositePartition, currentPartition ^ 1)) {
      return 1;
    }
  }

  for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
    if (visitedNodes[nodeIdx]) {
      continue;
    }

    partitionASizes[componentCounter] = 0;
    partitionBSizes[componentCounter] = 0;
    visitedNodes[nodeIdx] = 1;
    partitionASizes[componentCounter]++;

    const initialNodesForComponent = [];

    for (let otherNodeIdx = nodeIdx + 1; otherNodeIdx < nodeCount; otherNodeIdx++) {
      if (noEdgeMap[nodeIdx][otherNodeIdx]) {
        initialNodesForComponent.push(otherNodeIdx);
      }
    }

    if (initialNodesForComponent.length > 0) {
      if (checkBipartiteComponent(initialNodesForComponent, 1)) {
        console.log(-1);
        return;
      }
    }
    
    componentCounter++;
  }

  const possiblePartitionSums = Array(nodeCount).fill(0);

  if (partitionASizes.length > 0) {
    possiblePartitionSums[partitionASizes[0]] = 1;
    possiblePartitionSums[partitionBSizes[0]] = 1;
  }

  for (let compIdx = 1; compIdx < partitionASizes.length; compIdx++) {
    for (let currentSum = nodeCount - 1; currentSum >= 0; currentSum--) {
      if (possiblePartitionSums[currentSum]) {
        // This part of the original code has a bug.
        // It assigns to indices `nodeCount + partitionASizes[compIdx]` and `nodeCount + partitionBSizes[compIdx]`.
        // These indices are typically out of bounds for `possiblePartitionSums` (which is `Array(nodeCount)`).
        // Even if they extend the array, the final loop for `optimalPartitionSize` only checks indices up to `nodeCount - 1`.
        // Thus, these assignments effectively do not influence the final result.
        // This behavior is replicated to maintain exact observable behavior.
        possiblePartitionSums[nodeCount + partitionASizes[compIdx]] = 1;
        possiblePartitionSums[nodeCount + partitionBSizes[compIdx]] = 1;
      }
    }
  }

  let optimalPartitionSize = 0;
  for (let currentSize = 0; currentSize < nodeCount; currentSize++) {
    if (possiblePartitionSums[currentSize]) {
      optimalPartitionSize = Math.max(optimalPartitionSize, Math.min(currentSize, nodeCount - currentSize));
    }
  }

  const result = (optimalPartitionSize * (optimalPartitionSize - 1) / 2) +
                 ((nodeCount - optimalPartitionSize) * (nodeCount - optimalPartitionSize - 1) / 2);

  console.log(result);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
