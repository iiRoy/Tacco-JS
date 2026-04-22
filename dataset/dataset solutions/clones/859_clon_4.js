const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = rawData.trim().split('\n');

const [numNodes, numEdges] = lines.shift().split(' ').map(Number);
const connections = lines.map(line => line.split(' ').map(Number));

function constructNetwork(nodeTotal, allConnections) {
  const network = new Map();
  for (let k = 0; k < nodeTotal; k++) {
    network.set(k, new Set());
  }
  allConnections.forEach(([from, to]) => {
    network.get(from - 1).add(to - 1);
  });
  return network;
}

function pruneLink(originalNetwork, specificLink) {
  const [fromNode, toNode] = specificLink.map(n => n - 1);
  const clonedNetwork = new Map();
  originalNetwork.forEach((targets, source) => {
    clonedNetwork.set(source, new Set(targets));
  });
  if (clonedNetwork.has(fromNode)) {
    clonedNetwork.get(fromNode).delete(toNode);
  }
  return clonedNetwork;
}

function assessNetworkDepth(networkMap, totalNodes) {
  const memoizationTable = new Array(totalNodes).fill(0);

  function computeNodeDepth(currentVertex) {
    if (memoizationTable[currentVertex] !== 0) {
      return memoizationTable[currentVertex];
    }

    let maximumDepth = 1;
    const neighbors = networkMap.get(currentVertex);

    if (neighbors) {
      for (const neighbor of neighbors) {
        maximumDepth = Math.max(maximumDepth, 1 + computeNodeDepth(neighbor));
      }
    }

    memoizationTable[currentVertex] = maximumDepth;
    return maximumDepth;
  }

  let overallMaximumDepth = 0;
  for (let k = 0; k < totalNodes; k++) {
    overallMaximumDepth = Math.max(overallMaximumDepth, computeNodeDepth(k));
  }
  return overallMaximumDepth;
}

const initialNetwork = constructNetwork(numNodes, connections);
const baselineDepth = assessNetworkDepth(initialNetwork, numNodes);

let foundCritical = false;
for (let k = 0; k < numEdges; k++) {
  const currentConnection = connections[k];
  const alteredNetwork = pruneLink(initialNetwork, currentConnection);
  const currentDepth = assessNetworkDepth(alteredNetwork, numNodes);

  if (currentDepth < baselineDepth) {
    console.log(k + 1);
    foundCritical = true;
  }
}

if (!foundCritical) {
  console.log(-1);
}