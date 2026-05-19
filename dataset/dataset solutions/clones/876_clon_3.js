const fileSystem = require('fs');

const inputLength = fileSystem.fstatSync(process.stdin.fd).size;
const dataBuffer = Buffer.alloc(inputLength);
const readBytesCount = fileSystem.readSync(process.stdin.fd, dataBuffer, 0, inputLength, 0);
let inputLines = dataBuffer.toString('utf8', 0, readBytesCount).split('\n');

executeMainLogic();

function createDisjointSet(totalElements) {
  const parentArray = [];
  for (let elementIndex = 0; elementIndex < totalElements; elementIndex++) {
    parentArray[elementIndex] = -1;
  }

  function uniteSets(x, y) {
    let rootX = findRepresentative(x);
    let rootY = findRepresentative(y);

    if (rootX !== rootY) {
      const sizeX = parentArray[rootX];
      const sizeY = parentArray[rootY];

      if (sizeX < sizeY) {
        parentArray[rootX] += sizeY;
        parentArray[rootY] = rootX;
      } else {
        parentArray[rootY] += sizeX;
        parentArray[rootX] = rootY;
      }
      return true;
    }
    return false;
  }

  function findRepresentative(x) {
    const parentOfX = parentArray[x];
    if (parentOfX < 0) {
      return x;
    }
    const representative = findRepresentative(parentOfX);
    parentArray[x] = representative; // Path compression
    return representative;
  }

  function countActiveComponents(activeFlags) {
    let componentCount = 0;
    for (let elementIndex = 0; elementIndex < totalElements; elementIndex++) {
      const isRoot = parentArray[elementIndex] < 0;
      if (activeFlags[elementIndex] && isRoot) {
        componentCount++;
      }
    }
    return componentCount;
  }

  function areElementsInSameSet(x, y) {
    return findRepresentative(x) === findRepresentative(y);
  }

  return {
    uniteSets: uniteSets,
    findRepresentative: findRepresentative,
    countActiveComponents: countActiveComponents,
    areElementsInSameSet: areElementsInSameSet
  };
}

function executeMainLogic() {
  let currentLineParts;
  let nodeCount, edgeCount;
  let nodeIdx, edgeIdx;
  let nodeDetailsArray;
  let graphEdges;
  let disjointSetManager;
  let totalMinimumCost;
  let nodeActiveFlags;

  while (true) {
    currentLineParts = inputLines.shift().split(' ');
    nodeCount = Number(currentLineParts[0]);
    edgeCount = Number(currentLineParts[1]);

    const isTerminationCondition = (nodeCount === 0 && edgeCount === 0);
    if (isTerminationCondition) {
      break;
    }

    nodeDetailsArray = [];
    nodeActiveFlags = [];
    for (nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
      const daysValue = Number(inputLines.shift());
      nodeDetailsArray[nodeIdx] = {
        identifier: nodeIdx,
        daysRequired: daysValue
      };
      nodeActiveFlags[nodeIdx] = false;
    }

    graphEdges = [];
    for (edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
      currentLineParts = inputLines.shift().split(' ');
      const sourceNode = Number(currentLineParts[0]) - 1;
      const targetNode = Number(currentLineParts[1]) - 1;
      const edgeWeight = Number(currentLineParts[2]);
      graphEdges[edgeIdx] = [sourceNode, targetNode, edgeWeight];
    }

    nodeDetailsArray.sort(function (detailA, detailB) {
      return detailA.daysRequired - detailB.daysRequired;
    });

    graphEdges.sort(function (edgeA, edgeB) {
      return edgeA[2] - edgeB[2];
    });

    disjointSetManager = createDisjointSet(nodeCount);
    totalMinimumCost = 0;

    for (nodeIdx = nodeCount - 1; nodeIdx >= 0; nodeIdx--) {
      const currentNodeIdentifier = nodeDetailsArray[nodeIdx].identifier;
      nodeActiveFlags[currentNodeIdentifier] = true;

      const currentDaysValue = nodeDetailsArray[nodeIdx].daysRequired;
      while (nodeIdx > 0 && nodeDetailsArray[nodeIdx - 1].daysRequired === currentDaysValue) {
        nodeIdx--;
        nodeActiveFlags[nodeDetailsArray[nodeIdx].identifier] = true;
      }

      for (edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
        const currentEdgeData = graphEdges[edgeIdx];
        const u = currentEdgeData[0];
        const v = currentEdgeData[1];
        const weight = currentEdgeData[2];

        const areBothNodesActive = nodeActiveFlags[u] && nodeActiveFlags[v];
        const areNodesInDifferentSets = !disjointSetManager.areElementsInSameSet(u, v);

        if (areBothNodesActive && areNodesInDifferentSets) {
          disjointSetManager.uniteSets(u, v);
          totalMinimumCost += weight;
        }
      }

      const componentCount = disjointSetManager.countActiveComponents(nodeActiveFlags);
      if (componentCount > 1) {
        totalMinimumCost = 0;
        disjointSetManager = createDisjointSet(nodeCount);
      }
    }
    console.log(totalMinimumCost);
  }
}
