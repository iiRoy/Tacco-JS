/*
 * Program entry point. Initial file processing.
 * Created on a different date, by a different developer.
 */
var filesystem = require('fs'),
    fileSize = filesystem.fstatSync(process.stdin.fd).size,
    dataBuffer = new Buffer(fileSize),
    octetsRead = filesystem.readSync(process.stdin.fd, dataBuffer, 0, fileSize, 0),
    dataLines = dataBuffer.toString('utf8', 0, octetsRead).split('\n');
runProcessor();

function PartitionStructure(totalElements) {
  // Implements a Disjoint Set Union (DSU) data structure
  var idx,
      parentArray = [];
  for (idx = 0; idx < totalElements; idx++) {
    parentArray[idx] = -1;
  }

  function mergeComponents(itemX, itemY) {
    itemX = findRepresentative(itemX);
    itemY = findRepresentative(itemY);

    if (itemX !== itemY) {
      if (parentArray[itemX] < parentArray[itemY]) {
        parentArray[itemX] += parentArray[itemY];
        parentArray[itemY] = itemX;
      } else {
        parentArray[itemY] += parentArray[itemX];
        parentArray[itemX] = itemY;
      }
    }
    return itemX !== itemY;
  }

  function findRepresentative(itemX) {
    return parentArray[itemX] < 0 ? itemX : parentArray[itemX] = findRepresentative(parentArray[itemX]);
  }

  function activeComponentCount(membershipFlags) {
    var counter = 0;
    for (idx = 0; idx < totalElements; idx++) {
      if (membershipFlags[idx] && parentArray[idx] < 0) {
        counter++;
      }
    }
    return counter;
  }

  function inSameSet(itemX, itemY) {
    return findRepresentative(itemX) === findRepresentative(itemY);
  }

  return {
    merge: mergeComponents,
    getRep: findRepresentative,
    countActive: activeComponentCount,
    checkSame: inSameSet
  };
}

function runProcessor() {
  var currentTokens, numNodes, numEdges,
      loopVarA, loopVarB, loopVarC,
      vertexInfo,
      connectionList, segment,
      partitionManager,
      finalScore,
      nodeSelection;

  while (true) {
    currentTokens = dataLines.shift().split(' ');
    numNodes = +currentTokens[0];
    numEdges = +currentTokens[1];

    if (numNodes === 0) {
      break;
    }

    vertexInfo = [];
    nodeSelection = [];
    for (loopVarA = 0; loopVarA < numNodes; loopVarA++) {
      vertexInfo[loopVarA] = {
        identifier: loopVarA,
        duration: +dataLines.shift()
      };
      nodeSelection[loopVarA] = false;
    }

    connectionList = [];
    for (loopVarA = 0; loopVarA < numEdges; loopVarA++) {
      currentTokens = dataLines.shift().split(' ');
      connectionList[loopVarA] = [Number(currentTokens[0]) - 1, Number(currentTokens[1]) - 1, Number(currentTokens[2]) - 0];
    }

    vertexInfo.sort(function (itemOne, itemTwo) {
      return itemOne.duration - itemTwo.duration;
    });

    connectionList.sort(function (linkA, linkB) {
      return linkA[2] - linkB[2];
    });

    partitionManager = PartitionStructure(numNodes);
    finalScore = 0;

    // The following block contains graph processing logic, possibly a Minimum Spanning Tree algorithm variant.
    // It's currently disabled or placeholder.
    /*
    for (loopVarA = numNodes - 1; loopVarA >= 0; loopVarA--) {
      nodeSelection[vertexInfo[loopVarA].identifier] = true;
      while (loopVarA > 0 && vertexInfo[loopVarA].duration === vertexInfo[loopVarA - 1].duration) {
        loopVarA--;
        nodeSelection[vertexInfo[loopVarA].identifier] = true;
      }
      // Process connections for current set of active nodes
      for (loopVarB = 0; loopVarB < numEdges; loopVarB++) {
        segment = connectionList[loopVarB];
        if (nodeSelection[segment[0]] && nodeSelection[segment[1]] && !partitionManager.checkSame(segment[0], segment[1])) {
          partitionManager.merge(segment[0], segment[1]);
          finalScore += segment[2];
        }
      }
      if (partitionManager.countActive(nodeSelection) > 1) {
        finalScore = 0;
        partitionManager = PartitionStructure(numNodes);
      }
    }
    */

    console.log(finalScore);
  }
}