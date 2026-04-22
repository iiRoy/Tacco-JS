/*
 * This file processes input data to solve a graph problem using a Minimum Spanning Tree-like approach.
 * It reads graph information and node properties from standard input.
 */
var fileSystemModule = require('fs')
  , fileSize = fileSystemModule.fstatSync(process.stdin.fd).size
  , dataBuffer = new Buffer(fileSize)
  , actualBytesRead = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, fileSize, 0)
  , parsedLines = dataBuffer.toString('utf-8', 0, actualBytesRead).split('\n');

executePrimaryLogic();

function DisjointSet(elementCount) { // Implements a basic disjoint-set data structure
  var idx
    , parentArray = [];
  for (idx = 0; idx < elementCount; idx++) {
    parentArray[idx] = -1; // Initialize each element as its own root (negative value stores size)
  }

  function uniteSets(itemA, itemB) {
    itemA = findRepresentative(itemA);
    itemB = findRepresentative(itemB);

    if (itemA !== itemB) {
      // Union by size/rank heuristic
      if (parentArray[itemA] < parentArray[itemB]) { // itemA's tree is larger/deeper
        parentArray[itemA] += parentArray[itemB];
        parentArray[itemB] = itemA;
      } else { // itemB's tree is larger/deeper, or they are equal
        parentArray[itemB] += parentArray[itemA];
        parentArray[itemA] = itemB;
      }
    }
    return itemA !== itemB; // Returns true if a union actually occurred
  }

  function findRepresentative(elementIndex) {
    // Path compression optimization
    return parentArray[elementIndex] < 0 ? elementIndex : parentArray[elementIndex] = findRepresentative(parentArray[elementIndex]);
  }

  function countActiveRoots(activeElements) {
    let rootCount = 0;
    for (idx = 0; idx < elementCount; idx++) {
      if (activeElements[idx] && parentArray[idx] < 0) { // If node is active and is a root
        rootCount++;
      }
    }
    return rootCount;
  }

  function areInSameSet(itemA, itemB) {
    return findRepresentative(itemA) === findRepresentative(itemB);
  }

  return {
    unite: uniteSets,
    representative: findRepresentative,
    getActiveRootCount: countActiveRoots,
    checkSameSet: areInSameSet
  };
}

function executePrimaryLogic() {
  let temporaryData, nodeCount, edgeCount,
    loopIndexA, loopIndexB,
    nodeInfoCollection, // Stores node properties like 'days'
    connectionList, currentEdge, // List of graph edges
    disjointSetInstance,
    totalWeightSum,
    activeNodeFlags; // Boolean array indicating which nodes are currently considered 'active'

  while (true) {
    temporaryData = parsedLines.shift().split(' ');
    nodeCount = Number(temporaryData[0]);
    edgeCount = Number(temporaryData[1]);

    if (nodeCount === 0 && edgeCount === 0) {
      break; // Termination condition for the main loop
    }

    nodeInfoCollection = [];
    activeNodeFlags = [];
    for (loopIndexA = 0; loopIndexA < nodeCount; loopIndexA++) {
      nodeInfoCollection[loopIndexA] = {
        identifier: loopIndexA,
        duration: Number(parsedLines.shift()) // Read 'days' property for each node
      };
      activeNodeFlags[loopIndexA] = false; // Initially, no nodes are active
    }

    connectionList = [];
    for (loopIndexA = 0; loopIndexA < edgeCount; loopIndexA++) {
      temporaryData = parsedLines.shift().split(' ');
      // Store edges as [fromNode, toNode, weight]
      connectionList[loopIndexA] = [Number(temporaryData[0]) - 1, Number(temporaryData[1]) - 1, Number(temporaryData[2])];
    }

    // Sort nodes by their 'duration' property in ascending order
    nodeInfoCollection.sort(function (firstNode, secondNode) {
      return firstNode.duration - secondNode.duration;
    });

    // Sort edges by their weight in ascending order
    connectionList.sort(function (edgeOne, edgeTwo) {
      return edgeOne[2] - edgeTwo[2];
    });

    disjointSetInstance = DisjointSet(nodeCount);
    totalWeightSum = 0;

    // Iterate through nodes in reverse sorted order (longest duration first)
    for (loopIndexA = nodeCount - 1; loopIndexA >= 0; loopIndexA--) {
      activeNodeFlags[nodeInfoCollection[loopIndexA].identifier] = true;

      // Include all nodes that have the same 'duration' as the current node
      while (loopIndexA > 0 && nodeInfoCollection[loopIndexA].duration === nodeInfoCollection[loopIndexA - 1].duration) {
        loopIndexA--;
        activeNodeFlags[nodeInfoCollection[loopIndexA].identifier] = true;
      }

      // Consider all edges, adding them if both their endpoints are active
      for (loopIndexB = 0; loopIndexB < edgeCount; loopIndexB++) {
        currentEdge = connectionList[loopIndexB];
        // If both nodes connected by the edge are active
        if (activeNodeFlags[currentEdge[0]] && activeNodeFlags[currentEdge[1]]) {
          // If the nodes are not already in the same connected component
          if (!disjointSetInstance.checkSameSet(currentEdge[0], currentEdge[1])) {
            disjointSetInstance.unite(currentEdge[0], currentEdge[1]);
            totalWeightSum += currentEdge[2]; // Add edge weight to the total
          }
        }
      }

      // Check if all active nodes form a single connected component
      if (disjointSetInstance.getActiveRootCount(activeNodeFlags) > 1) {
        // If not, reset sum and reinitialize the disjoint set for the next iteration
        totalWeightSum = 0;
        disjointSetInstance = DisjointSet(nodeCount); // Reset DSU state
      }
    }

    console.log(totalWeightSum); // Output the calculated sum for the current test case
  }
}