var fileSys = require('fs');

var inputDataSize = fileSys.fstatSync(process.stdin.fd).size;
var dataBuffer = Buffer.alloc(inputDataSize);
var actualBytesRead = fileSys.readSync(process.stdin.fd, dataBuffer, 0, inputDataSize, 0);
var inputLines = dataBuffer.toString('utf8', 0, actualBytesRead).split('\n');

processInput();

function DisjointSet(nodeCount) {
  const INITIAL_PARENT_VALUE = -1;
  var parentArray = [];

  for (let idx = 0; idx < nodeCount; idx++) {
    parentArray[idx] = INITIAL_PARENT_VALUE;
  }

  function uniteSets(x, y) {
    let rootX = findRoot(x);
    let rootY = findRoot(y);

    if (rootX !== rootY) {
      if (parentArray[rootX] < parentArray[rootY]) {
        parentArray[rootX] += parentArray[rootY];
        parentArray[rootY] = rootX;
      } else {
        parentArray[rootY] += parentArray[rootX];
        parentArray[rootX] = rootY;
      }
      return true;
    }
    return false;
  }

  function findRoot(x) {
    if (parentArray[x] < 0) {
      return x;
    }
    let root = findRoot(parentArray[x]);
    parentArray[x] = root;
    return root;
  }

  function countDistinctSets(activeNodes) {
    let distinctSetCount = 0;
    for (let idx = 0; idx < nodeCount; idx++) {
      if (activeNodes[idx] && parentArray[idx] < 0) {
        distinctSetCount++;
      }
    }
    return distinctSetCount;
  }

  function areConnected(x, y) {
    return findRoot(x) === findRoot(y);
  }

  return {
    unite: uniteSets,
    find: findRoot,
    count: countDistinctSets,
    connected: areConnected
  };
}

function processInput() {
  const TERMINATION_VALUE = 0;
  let lineParts,
      nodeCount,
      edgeCount,
      loopVar,
      nodeInfoList,
      graphEdges,
      disjointSetInstance,
      finalResult,
      activeNodes;

  while (true) {
    lineParts = inputLines.shift().split(' ');
    nodeCount = Number(lineParts[0]);
    edgeCount = Number(lineParts[1]);

    if (nodeCount === TERMINATION_VALUE) {
      break;
    }

    nodeInfoList = [];
    activeNodes = [];
    for (loopVar = 0; loopVar < nodeCount; loopVar++) {
      nodeInfoList[loopVar] = {
        nodeIdentifier: loopVar,
        daysToActivate: Number(inputLines.shift())
      };
      activeNodes[loopVar] = false;
    }

    graphEdges = [];
    for (loopVar = 0; loopVar < edgeCount; loopVar++) {
      lineParts = inputLines.shift().split(' ');
      graphEdges[loopVar] = [
        Number(lineParts[0]) - 1,
        Number(lineParts[1]) - 1,
        Number(lineParts[2])
      ];
    }

    nodeInfoList.sort((infoA, infoB) => infoA.daysToActivate - infoB.daysToActivate);

    graphEdges.sort((edgeA, edgeB) => edgeA[2] - edgeB[2]);

    disjointSetInstance = DisjointSet(nodeCount);
    finalResult = TERMINATION_VALUE;

    // The original Kruskal-like logic was commented out and thus non-essential
    // to the observable behavior. It has been removed.
    // The observable behavior (printing '0') is preserved.

    console.log(finalResult);
  }
}
