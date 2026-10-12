function OrderedElementStore(comparisonFn) {
  this.storageArray = [];
  this.comparisonFn = comparisonFn;
}

OrderedElementStore.prototype._bubbleUp = function(currentIndex) {
  if (currentIndex === 0) {
    return;
  }
  const parentIndex = Math.floor((currentIndex - 1) / 2);
  if (this.comparisonFn(this.storageArray[parentIndex], this.storageArray[currentIndex]) > 0) {
    [this.storageArray[parentIndex], this.storageArray[currentIndex]] = [this.storageArray[currentIndex], this.storageArray[parentIndex]];
    this._bubbleUp(parentIndex);
  }
};

OrderedElementStore.prototype.addValue = function(incomingValue) {
  this.storageArray.push(incomingValue);
  this._bubbleUp(this.storageArray.length - 1);
};

OrderedElementStore.prototype._bubbleDown = function(currentIndex) {
  const leftChildIdx = 2 * currentIndex + 1;
  const rightChildIdx = 2 * currentIndex + 2;
  let smallestChildIdx = currentIndex;

  if (leftChildIdx < this.storageArray.length && this.comparisonFn(this.storageArray[leftChildIdx], this.storageArray[smallestChildIdx]) < 0) {
    smallestChildIdx = leftChildIdx;
  }
  if (rightChildIdx < this.storageArray.length && this.comparisonFn(this.storageArray[rightChildIdx], this.storageArray[smallestChildIdx]) < 0) {
    smallestChildIdx = rightChildIdx;
  }

  if (smallestChildIdx !== currentIndex) {
    [this.storageArray[currentIndex], this.storageArray[smallestChildIdx]] = [this.storageArray[smallestChildIdx], this.storageArray[currentIndex]];
    this._bubbleDown(smallestChildIdx);
  }
};

OrderedElementStore.prototype.extractMinimum = function() {
  if (this.storageArray.length === 0) {
    return undefined;
  }
  if (this.storageArray.length === 1) {
    return this.storageArray.pop();
  }

  const minimumValue = this.storageArray[0];
  this.storageArray[0] = this.storageArray.pop();
  this._bubbleDown(0);

  return minimumValue;
};

OrderedElementStore.prototype.viewMinimum = function() {
  return this.storageArray.length === 0 ? undefined : this.storageArray[0];
};

OrderedElementStore.prototype.countElements = function() {
  return this.storageArray.length;
};

OrderedElementStore.prototype.hasNoElements = function() {
  return this.countElements() === 0;
};

const MAX_NODES_LIMIT = 100000;
const PATH_INFINITY_VALUE = Number.POSITIVE_INFINITY / 4;
let nodeCount, edgeCount, startNodeIdentifier;
let graphAdjacency;
let distanceMap;

function calculateShortestPaths(sourceNodeIdentifier) {
  const priorityStore = new OrderedElementStore(function(itemA, itemB) {
    if (itemA.pathCost !== itemB.pathCost) {
      return itemA.pathCost - itemB.pathCost;
    }
    return itemA.vertexIdentifier - itemB.vertexIdentifier;
  });

  distanceMap[sourceNodeIdentifier] = 0;
  priorityStore.addValue({
    pathCost: 0,
    vertexIdentifier: sourceNodeIdentifier
  });

  while (!priorityStore.hasNoElements()) {
    const {
      pathCost: currentCost,
      vertexIdentifier: currentVertex
    } = priorityStore.extractMinimum();

    if (distanceMap[currentVertex] < currentCost) {
      continue;
    }

    graphAdjacency[currentVertex].forEach(currentEdge => {
      const {
        destinationNode: neighbor,
        edgeWeight: weight
      } = currentEdge;

      if (distanceMap[neighbor] > distanceMap[currentVertex] + weight) {
        distanceMap[neighbor] = distanceMap[currentVertex] + weight;
        priorityStore.addValue({
          pathCost: distanceMap[neighbor],
          vertexIdentifier: neighbor
        });
      }
    });
  }
}

(function processGraphInput(rawData) {
  const inputLines = rawData.trim().split('\n');
  let isFirstLineProcessed = false;

  inputLines.forEach(lineContent => {
    const parsedNumbers = lineContent.split(' ').map(Number);

    if (!isFirstLineProcessed) {
      [nodeCount, edgeCount, startNodeIdentifier] = parsedNumbers;

      graphAdjacency = Array.from({
        length: nodeCount
      }, () => []);
      distanceMap = Array(nodeCount).fill(PATH_INFINITY_VALUE);
      isFirstLineProcessed = true;
    } else {
      const [fromNode, toNode, weight] = parsedNumbers;
      graphAdjacency[fromNode].push({
        destinationNode: toNode,
        edgeWeight: weight
      });
    }
  });

  calculateShortestPaths(startNodeIdentifier);

  distanceMap.forEach(value => {
    console.log(value === PATH_INFINITY_VALUE ? "INF" : value);
  });
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
