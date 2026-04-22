const processInput = (rawText) => {
  const lines = rawText.trim().split('\n');
  const [nodeQuantity, connectionCount] = lines.shift().split(' ').map(Number);

  const complementGraphConnections = new Array(nodeQuantity).fill(0).map(() => new Set());
  for (let i = 0; i < nodeQuantity; ++i) {
    for (let j = i + 1; j < nodeQuantity; ++j) {
      complementGraphConnections[i].add(j);
      complementGraphConnections[j].add(i);
    }
  }

  for (let i = 0; i < connectionCount; ++i) {
    const [vertexA, vertexB] = lines.shift().split(' ').map(s => Number(s) - 1);
    complementGraphConnections[vertexA].delete(vertexB);
    complementGraphConnections[vertexB].delete(vertexA);
  }

  const exploredNodes = new Set();
  const nodeColors = new Array(nodeQuantity).fill(-1); // -1: uncolored, 0: color A, 1: color B
  const partitionCountsA = [];
  const partitionCountsB = [];
  let currentComponentIndex = 0;

  for (let startNode = 0; startNode < nodeQuantity; ++startNode) {
    if (exploredNodes.has(startNode)) {
      continue;
    }

    let countA = 0;
    let countB = 0;
    const componentQueue = [startNode];
    exploredNodes.add(startNode);
    nodeColors[startNode] = 0; // Assign initial node to color A
    countA++;

    let isBipartite = true;
    let queuePointer = 0;

    while (queuePointer < componentQueue.length) {
      const currentNode = componentQueue[queuePointer++];

      for (const neighbor of complementGraphConnections[currentNode]) {
        if (!exploredNodes.has(neighbor)) {
          exploredNodes.add(neighbor);
          nodeColors[neighbor] = 1 - nodeColors[currentNode];
          if (nodeColors[neighbor] === 0) {
            countA++;
          } else {
            countB++;
          }
          componentQueue.push(neighbor);
        } else if (nodeColors[neighbor] === nodeColors[currentNode]) {
          isBipartite = false;
          break;
        }
      }
      if (!isBipartite) break;
    }

    if (!isBipartite) {
      console.log(-1);
      return;
    }
    
    // Handle isolated nodes properly:
    // If a component has only one node, it's considered bipartite (0 edges in G')
    // The previous loop might not correctly set countA/countB if the component is just a single node.
    // However, the BFS logic above correctly handles isolated nodes.
    // If startNode has no neighbors, queue will only contain startNode, countA=1, countB=0.
    partitionCountsA[currentComponentIndex] = countA;
    partitionCountsB[currentComponentIndex] = countB;
    currentComponentIndex++;
  }

  const possiblePartitionSums = new Set();
  possiblePartitionSums.add(0); // It's possible to have 0 nodes in one partition

  for (let cIdx = 0; cIdx < currentComponentIndex; ++cIdx) {
    const currentCompSizeA = partitionCountsA[cIdx];
    const currentCompSizeB = partitionCountsB[cIdx];
    const temporarySums = new Set();

    for (const previousSum of possiblePartitionSums) {
      // Option 1: Add currentCompSizeA to the sum
      if (previousSum + currentCompSizeA <= nodeQuantity) {
        temporarySums.add(previousSum + currentCompSizeA);
      }
      // Option 2: Add currentCompSizeB to the sum
      if (previousSum + currentCompSizeB <= nodeQuantity) {
        temporarySums.add(previousSum + currentCompSizeB);
      }
    }
    // Merge temporarySums into possiblePartitionSums
    temporarySums.forEach(sum => possiblePartitionSums.add(sum));
  }

  let smallestPartitionSize = 0;
  for (const currentSum of possiblePartitionSums) {
    // currentSum is the size of one partition (e.g., K)
    // nodeQuantity - currentSum is the size of the other partition (N-K)
    // We want to find the K that maximizes the expression K*(K-1)/2 + (N-K)*(N-K-1)/2
    // This expression is minimized when K is closest to N/2.
    // The original code finds `k = Math.max(k, Math.min(i, n - i))`
    // This `k` stores the largest possible value for the smaller partition size.
    // This means it finds the split (K, N-K) that is closest to (N/2, N/2).
    // So the goal is to MINIMIZE the total edges.
    smallestPartitionSize = Math.max(smallestPartitionSize, Math.min(currentSum, nodeQuantity - currentSum));
  }

  const finalResult = (smallestPartitionSize * (smallestPartitionSize - 1) / 2) +
                      ((nodeQuantity - smallestPartitionSize) * (nodeQuantity - smallestPartitionSize - 1) / 2);

  console.log(finalResult);
};

processInput(require("fs").readFileSync("/dev/stdin","utf8"));