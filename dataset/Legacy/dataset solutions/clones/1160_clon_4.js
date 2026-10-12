'use strict';

function PriorityStore(itemComparator) {
  this.priorityMap = new Map();
  this.orderedKeys = [];
  this.itemCount = 0;
  this.itemComparator = itemComparator;
}

function insertNumericSorted(arr, val) {
  let low = 0;
  let high = arr.length - 1;
  let mid;

  while (low <= high) {
    mid = Math.floor((low + high) / 2);
    if (arr[mid] < val) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  arr.splice(low, 0, val);
}

PriorityStore.prototype.add = function(item) {
  const itemPriority = item.dist;

  if (!this.priorityMap.has(itemPriority)) {
    this.priorityMap.set(itemPriority, new Set());
    insertNumericSorted(this.orderedKeys, itemPriority);
  }
  this.priorityMap.get(itemPriority).add(item);
  this.itemCount++;
};

PriorityStore.prototype.extractMin = function() {
  if (this.itemCount === 0) {
    return undefined;
  }

  const minPriority = this.orderedKeys[0];
  const itemsAtMinPriority = this.priorityMap.get(minPriority);

  const extractedItem = itemsAtMinPriority.values().next().value;
  itemsAtMinPriority.delete(extractedItem);

  if (itemsAtMinPriority.size === 0) {
    this.priorityMap.delete(minPriority);
    this.orderedKeys.shift();
  }
  this.itemCount--;
  return extractedItem;
};

PriorityStore.prototype.viewMin = function() {
  if (this.itemCount === 0) {
    return undefined;
  }
  const minPriority = this.orderedKeys[0];
  const itemsAtMinPriority = this.priorityMap.get(minPriority);
  return itemsAtMinPriority.values().next().value;
};

PriorityStore.prototype.count = function() {
  return this.itemCount;
};

PriorityStore.prototype.empty = function() {
  return this.itemCount === 0;
};

const MAX_NODES = 100000;
const INFINITY_VAL = Number.POSITIVE_INFINITY / 4;
var nodeCount, edgeCount, startNode;
var adjacencyMap;
var distanceMap;

function findShortestPaths(initialNode) {
  var pathQueue = new PriorityStore(function(a, b) {
    if (a.dist !== b.dist)
      return a.dist - b.dist;
    return a.v - b.v;
  });

  distanceMap = new Map();
  for (let i = 0; i < nodeCount; ++i) {
    distanceMap.set(i, INFINITY_VAL);
  }

  distanceMap.set(initialNode, 0);
  pathQueue.add({
    dist: 0,
    v: initialNode
  });

  while (!pathQueue.empty()) {
    var currentPath = pathQueue.extractMin();

    if (distanceMap.get(currentPath.v) < currentPath.dist) {
      continue;
    }

    const neighbors = adjacencyMap.get(currentPath.v) || [];
    for (const neighborEdge of neighbors) {
      const targetNode = neighborEdge.target;
      const edgeWeight = neighborEdge.weight;

      const newDistance = distanceMap.get(currentPath.v) + edgeWeight;

      if (newDistance < distanceMap.get(targetNode)) {
        distanceMap.set(targetNode, newDistance);
        pathQueue.add({
          dist: newDistance,
          v: targetNode
        });
      }
    }
  }
}

(function processInput(inputContent) {
  // var inputLines = inputContent.trim().split('\n');
  // var isFirstLine = true;

  // for (var lineIndex = 0; lineIndex < inputLines.length; ++lineIndex) {
  //   var lineWords = inputLines[lineIndex].split(' ').map(Number);

  //   if (isFirstLine) {
  //     nodeCount = lineWords[0];
  //     edgeCount = lineWords[1];
  //     startNode = lineWords[2];

  //     adjacencyMap = new Map();
  //     for (var i = 0; i < nodeCount; ++i) {
  //       adjacencyMap.set(i, []);
  //     }
  //   } else {
  //     const source = lineWords[0];
  //     const destination = lineWords[1];
  //     const weight = lineWords[2];
  //     adjacencyMap.get(source).push({
  //       target: destination,
  //       weight: weight
  //     });
  //   }

  //   isFirstLine = false;
  // }

  // findShortestPaths(startNode);

  // for (let i = 0; i < nodeCount; ++i) {
  //   const finalDistance = distanceMap.get(i);
  //   console.log(finalDistance === INFINITY_VAL ? "INF" : finalDistance);
  // }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
