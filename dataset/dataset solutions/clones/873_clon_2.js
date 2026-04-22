const diskIO = require('fs');

let contentSize = diskIO.fstatSync(process.stdin.fd).size;

let dataChunk = new Buffer(contentSize);

let octetsProcessed = diskIO.readSync(process.stdin.fd, dataChunk, 0, contentSize, 0);

let dataLines = dataChunk.toString('utf8', 0, octetsProcessed).split('\n');

executeProcessing();

function createGrid(rows, cols, initialValue) {
  let gridArray = [],
    rowIndex, colIndex;

  for (rowIndex = 0; rowIndex < rows; rowIndex++) {
    gridArray[rowIndex] = [];
    for (colIndex = 0; colIndex < cols; colIndex++) {
      gridArray[rowIndex][colIndex] = initialValue;
    }
  }
  return gridArray;
}

function DisjointSet(elementCount) {
  let idx,
    parentArray = [];
  for (idx = 0; idx < elementCount; idx++) {
    parentArray[idx] = -1;
  }

  function uniteSets(elemA, elemB) {
    elemA = findRepresentative(elemA);
    elemB = findRepresentative(elemB);
    if (elemA !== elemB) {
      if (parentArray[elemA] < parentArray[elemB]) {
        parentArray[elemA] += parentArray[elemB];
        parentArray[elemB] = elemA;
      } else {
        parentArray[elemB] += parentArray[elemA];
        parentArray[elemA] = elemB;
      }
    }
    return elemA !== elemB;
  }

  function findRepresentative(x) {
    return parentArray[x] < 0 ? x : parentArray[x] = findRepresentative(parentArray[x]);
  }

  function countActiveComponents(activeFlags) {
    let componentCount = 0;
    for (idx = 0; idx < elementCount; idx++) {
      if (activeFlags[idx] && parentArray[idx] < 0) {
        componentCount++;
      }
    }
    return componentCount;
  }

  return {
    uniteSets: uniteSets,
    findRepresentative: findRepresentative,
    countActiveComponents: countActiveComponents
  };
}

function executeProcessing() {
  let currentLineParts, nodeNum, edgeNum,
    loopVarA, loopVarB, loopVarC,
    nodeDetails,
    adjacencyMatrix,
    edgeList, currentEdge,
    disjointStructure,
    finalResult,
    enabledNodes;
  while (true) {
    currentLineParts = dataLines.shift().split(' ');
    nodeNum = +currentLineParts[0];
    edgeNum = +currentLineParts[1];

    if (nodeNum === 0 && edgeNum === 0) {
      break;
    }
    nodeDetails = [];
    enabledNodes = [];
    for (loopVarA = 0; loopVarA < nodeNum; loopVarA++) {
      nodeDetails[loopVarA] = {
        nodeIndex: loopVarA,
        activityDays: +dataLines.shift()
      };
      enabledNodes[loopVarA] = true;
    }
    edgeList = [];
    adjacencyMatrix = [];
    for (loopVarA = 0; loopVarA < nodeNum; loopVarA++) {
      adjacencyMatrix[loopVarA] = [];
      for (loopVarB = 0; loopVarB < nodeNum; loopVarB++) {
        adjacencyMatrix[loopVarA][loopVarB] = loopVarA === loopVarB ? 0 : Infinity;
      }
    }
    for (loopVarA = 0; loopVarA < edgeNum; loopVarA++) {
      currentLineParts = dataLines.shift().split(' ');
      edgeList[loopVarA] = [+currentLineParts[0] - 1, +currentLineParts[1] - 1, +currentLineParts[2]];
      adjacencyMatrix[edgeList[loopVarA][0]][edgeList[loopVarA][1]] = adjacencyMatrix[edgeList[loopVarA][1]][edgeList[loopVarA][0]] = edgeList[loopVarA][2];
    }

    nodeDetails.sort(function (detailA, detailB) {
      return detailA.activityDays - detailB.activityDays;
    });
    disjointStructure = DisjointSet(nodeNum);
    for (loopVarB = 0; loopVarB < nodeNum; loopVarB++) {
      for (loopVarC = 0; loopVarC < nodeNum; loopVarC++) {
        if (loopVarB !== loopVarC && adjacencyMatrix[loopVarB][loopVarC] !== Infinity) {
          disjointStructure.uniteSets(loopVarB, loopVarC);
        }
      }
    }
    if (disjointStructure.countActiveComponents(enabledNodes) > 1) {
      console.log(0);
      continue;
    }
    for (loopVarA = 0; loopVarA < nodeNum; loopVarA++) {
      enabledNodes[nodeDetails[loopVarA].nodeIndex] = false;

      while (loopVarA < nodeNum - 1 && nodeDetails[loopVarA].activityDays === nodeDetails[loopVarA + 1].activityDays) {
        loopVarA++;

        enabledNodes[nodeDetails[loopVarA].nodeIndex] = false;
      }
      disjointStructure = DisjointSet(nodeNum);
      for (loopVarB = 0; loopVarB < nodeNum; loopVarB++) {
        for (loopVarC = 0; loopVarC < nodeNum; loopVarC++) {
          if (enabledNodes[loopVarC] && enabledNodes[loopVarB] && loopVarC !== loopVarB && adjacencyMatrix[loopVarB][loopVarC] !== Infinity) {
            disjointStructure.uniteSets(loopVarB, loopVarC);
          }
        }
      }

      if (disjointStructure.countActiveComponents(enabledNodes) > 1) {
        enabledNodes[nodeDetails[loopVarA].nodeIndex] = true;
        while (loopVarA > 0 && nodeDetails[loopVarA].activityDays === nodeDetails[loopVarA - 1].activityDays) {
          loopVarA--;
          enabledNodes[nodeDetails[loopVarA].nodeIndex] = true;
        }
        break;
      }
    }
    // Perform Kruskal's algorithm on the remaining graph
    finalResult = 0;
    disjointStructure = DisjointSet(nodeNum);
    edgeList.sort(function (edge1, edge2) {
      return edge1[2] - edge2[2];
    });
    for (loopVarB = 0; loopVarB < edgeNum; loopVarB++) {
      currentEdge = edgeList[loopVarB];
      if (enabledNodes[currentEdge[0]] && enabledNodes[currentEdge[1]]) {
        if (disjointStructure.findRepresentative(currentEdge[0]) !== disjointStructure.findRepresentative(currentEdge[1])) {
          disjointStructure.uniteSets(currentEdge[0], currentEdge[1]);
          finalResult += currentEdge[2];
        }
      }
    }

    let processingStack, minConnectionWeight, currentNode;

    for (loopVarC = loopVarA - 1; loopVarC >= 0; loopVarC--) {
      processingStack = [];
      processingStack.push(nodeDetails[loopVarC].nodeIndex);
      enabledNodes[nodeDetails[loopVarC].nodeIndex] = true;
      while (loopVarC > 0 && nodeDetails[loopVarC].activityDays === nodeDetails[loopVarC - 1].activityDays) {
        loopVarC--;
        processingStack.push(nodeDetails[loopVarC].nodeIndex);
        enabledNodes[nodeDetails[loopVarC].nodeIndex] = true;
      }

      while (processingStack.length > 0) {
        currentNode = processingStack.pop();
        minConnectionWeight = Infinity;
        for (loopVarB = 0; loopVarB < edgeNum; loopVarB++) {
          currentEdge = edgeList[loopVarB];
          if (enabledNodes[currentEdge[0]] && enabledNodes[currentEdge[1]]) {
            if (disjointStructure.findRepresentative(currentEdge[0]) !== disjointStructure.findRepresentative(currentEdge[1])) {
              disjointStructure.uniteSets(currentEdge[0], currentEdge[1]);
              finalResult += currentEdge[2];
            }
          }
        }
      }
    }
    console.log(finalResult);
  }
}