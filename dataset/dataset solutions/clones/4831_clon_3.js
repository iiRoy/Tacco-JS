const parseNumericLine = (lineStr) => lineStr.split(' ').map(Number);

function solveProblem(inputDataLines) {
  const firstLineValues = parseNumericLine(inputDataLines[0]);
  const numNodes = firstLineValues[0];
  const numRoadConnections = firstLineValues[1];
  const numRailConnections = firstLineValues[2];

  const SENTINEL_VALUE = numNodes + 1;
  let roadNetworkGroups = new Array(numNodes).fill(SENTINEL_VALUE);
  let railNetworkGroups = new Array(numNodes).fill(SENTINEL_VALUE);
  let componentSizes = new Array(numNodes).fill(0);

  for (let connectionIdx = 1; connectionIdx <= numRoadConnections; connectionIdx++) {
    const [roadNodeA, roadNodeB] = parseNumericLine(inputDataLines[connectionIdx]);
    const idxA = roadNodeA - 1;
    const idxB = roadNodeB - 1;
    const representativeValue = Math.min(roadNetworkGroups[idxA], roadNetworkGroups[idxB], roadNodeA);
    roadNetworkGroups[idxA] = representativeValue;
    roadNetworkGroups[idxB] = representativeValue;
  }

  const railConnectionsStartIdx = numRoadConnections + 1;
  const railConnectionsEndIdx = numRoadConnections + numRailConnections;
  for (let connectionIdx = railConnectionsStartIdx; connectionIdx <= railConnectionsEndIdx; connectionIdx++) {
    const [railNodeA, railNodeB] = parseNumericLine(inputDataLines[connectionIdx]);
    const idxA = railNodeA - 1;
    const idxB = railNodeB - 1;
    const representativeValue = Math.min(railNetworkGroups[idxA], railNetworkGroups[idxB], railNodeA);
    railNetworkGroups[idxA] = representativeValue;
    railNetworkGroups[idxB] = representativeValue;
  }

  let currentConnectedComponent = [];

  for (let nodeIndex = 0; nodeIndex < numNodes; nodeIndex++) {
    if (componentSizes[nodeIndex] === 0) {
      currentConnectedComponent = [nodeIndex];
      const currentRoadGroup = roadNetworkGroups[nodeIndex];
      const currentRailGroup = railNetworkGroups[nodeIndex];

      const isNodeFullyConnected = (currentRoadGroup !== SENTINEL_VALUE && currentRailGroup !== SENTINEL_VALUE);

      if (isNodeFullyConnected) {
        for (let otherNodeIndex = nodeIndex + 1; otherNodeIndex < numNodes; otherNodeIndex++) {
          if (currentRoadGroup === roadNetworkGroups[otherNodeIndex] &&
              currentRailGroup === railNetworkGroups[otherNodeIndex]) {
            currentConnectedComponent.push(otherNodeIndex);
          }
        }
      } else {
        // If a node is not part of both networks (i.e., isolated in one or both),
        // it can only form a component with other nodes that are also isolated
        // in the *same* way and have the same group representatives (which would be SENTINEL_VALUE
        // for the isolated network, and a specific value for the connected one).
        // The original logic `a[i] == a[j] && b[i] == b[j]` correctly handles this
        // even if `a[i]` or `b[i]` is `N+1`.
        // The `if (a[i] <= N && b[i] <= N)` was an optimization to skip the inner loop
        // if the current node `i` was isolated in either network.
        // Re-introducing the full scan for correctness and behavioral equivalence
        // when `isNodeFullyConnected` is false, but with the original condition.
        // This means the `isNodeFullyConnected` guard is actually an optimization
        // that can be removed if we just rely on the `a[i] == a[j] && b[i] == b[j]`
        // which works for SENTINEL_VALUE as well.
        // Let's revert to the original structure for this part to ensure exact equivalence
        // without over-optimizing or changing the core comparison.
        // The original `if (a[i] <= N && b[i] <= N)` was a guard for the inner loop.
        // If it's false, `c` remains `[i]`, and `results[i]` becomes 1.
        // My `isNodeFullyConnected` does the same.
        // So, the current structure is correct.
      }

      const componentSize = currentConnectedComponent.length;
      for (let memberIndex = 0; memberIndex < componentSize; memberIndex++) {
        componentSizes[currentConnectedComponent[memberIndex]] = componentSize;
      }
    }
  }

  console.log(componentSizes.join(' '));
}

solveProblem(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n'));
