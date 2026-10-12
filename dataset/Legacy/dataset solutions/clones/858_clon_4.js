function findLongestSequenceRecursive(
  currentPoint,
  groupPoints,
  connectionsMap,
  excludedPair,
  memoizationCache
) {
  if (memoizationCache.has(currentPoint)) {
    return memoizationCache.get(currentPoint);
  }

  let maxLength = 1;

  const outgoingPoints = connectionsMap.get(currentPoint) || new Set();

  for (const nextPoint of outgoingPoints) {
    if (excludedPair && currentPoint === excludedPair[0] && nextPoint === excludedPair[1]) {
      continue;
    }

    if (groupPoints.has(nextPoint)) {
      maxLength = Math.max(
        maxLength,
        1 + findLongestSequenceRecursive(nextPoint, groupPoints, connectionsMap, excludedPair, memoizationCache)
      );
    }
  }

  memoizationCache.set(currentPoint, maxLength);
  return maxLength;
}

function calculateComponentMaxChain(groupPoints, connectionsMap, excludedPair = null) {
  const memoizationCache = new Map();
  let maxChain = 0;

  if (groupPoints.size === 0) {
      return 0;
  }

  for (const point of groupPoints) {
    maxChain = Math.max(
      maxChain,
      findLongestSequenceRecursive(point, groupPoints, connectionsMap, excludedPair, memoizationCache)
    );
  }
  return maxChain;
}

function identifyConnectedComponents(totalPoints, allOriginalLinks) {
  const visitedPoints = new Set();
  const componentGroups = [];

  const undirectedMap = new Map();
  for (let i = 0; i < totalPoints; i++) {
    undirectedMap.set(i, new Set());
  }
  for (const [src, tgt] of allOriginalLinks) {
    undirectedMap.get(src).add(tgt);
    undirectedMap.get(tgt).add(src);
  }

  for (let i = 0; i < totalPoints; i++) {
    if (!visitedPoints.has(i)) {
      const currentComponent = new Set();
      const stack = [i];
      visitedPoints.add(i);
      currentComponent.add(i);

      while (stack.length > 0) {
        const current = stack.pop();
        const neighbors = undirectedMap.get(current) || new Set();

        for (const neighbor of neighbors) {
          if (!visitedPoints.has(neighbor)) {
            visitedPoints.add(neighbor);
            currentComponent.add(neighbor);
            stack.push(neighbor);
          }
        }
      }
      componentGroups.push(currentComponent);
    }
  }
  return componentGroups;
}

const fileSystem = require('fs');

const inputSize = fileSystem.fstatSync(process.stdin.fd).size;
const dataBuffer = Buffer.alloc(inputSize);
const bytesProcessed = fileSystem.readSync(process.stdin.fd, dataBuffer, 0, inputSize, 0);
const rawLines = dataBuffer.toString('utf8', 0, bytesProcessed).split('\n');

const lineData = rawLines.shift().split(' ').map(Number);
const totalNodes = lineData[0];
const totalLinks = lineData[1];

const allLinks = [];
const nodeConnections = new Map();

for (let i = 0; i < totalNodes; i++) {
  nodeConnections.set(i, new Set());
}

for (let i = 0; i < totalLinks; i++) {
  const linkPair = rawLines[i].split(' ').map(Number);
  const sourceNode = linkPair[0] - 1;
  const targetNode = linkPair[1] - 1;
  allLinks.push([sourceNode, targetNode]);
  nodeConnections.get(sourceNode).add(targetNode);
}

const allComponentGroups = identifyConnectedComponents(totalNodes, allLinks);

const componentChainLengths = allComponentGroups.map(group =>
  calculateComponentMaxChain(group, nodeConnections)
);

const peakChainLength = Math.max(...componentChainLengths);

const peakGroupIndices = componentChainLengths.reduce((acc, currentLength, idx) => {
  if (currentLength === peakChainLength) {
    acc.push(idx);
  }
  return acc;
}, []);

if (peakGroupIndices.length > 1) {
  console.log(-1);
} else {
  const targetComponentIndex = peakGroupIndices[0];
  const targetComponentNodes = allComponentGroups[targetComponentIndex];

  let foundSolution = false;
  let solutionLinkIndex = -1;

  for (let i = 0; i < totalLinks; i++) {
    const currentLink = allLinks[i];
    const linkSource = currentLink[0];

    if (targetComponentNodes.has(linkSource)) {
      const modifiedChainLength = calculateComponentMaxChain(
        targetComponentNodes,
        nodeConnections,
        currentLink
      );

      if (modifiedChainLength < peakChainLength) {
        solutionLinkIndex = i + 1;
        foundSolution = true;
        break;
      }
    }
  }

  if (foundSolution) {
    console.log(solutionLinkIndex);
  } else {
    console.log(-1);
  }
}