function LinkNode(valEntry) {
  this.value = valEntry;
  this.next = null;
}

function OrderedCollection(comparisonLogic) {
  this.head = null;
  this.logic = comparisonLogic;
  this.totalElements = 0;
}

OrderedCollection.prototype.addEntry = function(newEntry) {
  var newNode = new LinkNode(newEntry);

  if (this.head === null || this.logic(newEntry, this.head.value) < 0) {
    newNode.next = this.head;
    this.head = newNode;
  } else {
    var current = this.head;
    while (current.next !== null && this.logic(newEntry, current.next.value) >= 0) {
      current = current.next;
    }
    newNode.next = current.next;
    current.next = newNode;
  }
  this.totalElements++;
};

OrderedCollection.prototype.fetchSmallest = function() {
  if (this.head === null) {
    return undefined;
  }
  var smallest = this.head.value;
  this.head = this.head.next;
  this.totalElements--;
  return smallest;
};

OrderedCollection.prototype.examineTop = function() {
  return this.head === null ? undefined : this.head.value;
};

OrderedCollection.prototype.elementCount = function() {
  return this.totalElements;
};

OrderedCollection.prototype.noElements = function() {
  return this.totalElements === 0;
};

const BIG_VAL = 999999999;
const MAX_NODE_ID = 100000;

function calculatePathCosts(inputData) {
  const rawLines = inputData.trim().split('\n');

  let nodeCount, edgeCount, sourceNode;
  let firstLineParsed = false;
  let adjacencyStructure = new Map();
  let currentDistances = new Map();

  for (let lineIndex = 0; lineIndex < rawLines.length; ++lineIndex) {
    const numericParts = rawLines[lineIndex].split(' ').map(Number);

    if (!firstLineParsed) {
      nodeCount = numericParts[0];
      edgeCount = numericParts[1];
      sourceNode = numericParts[2];

      for (let i = 0; i < nodeCount; ++i) {
        adjacencyStructure.set(i, new Map());
        currentDistances.set(i, BIG_VAL);
      }
      firstLineParsed = true;
    } else {
      const origin = numericParts[0];
      const destination = numericParts[1];
      const weight = numericParts[2];
      adjacencyStructure.get(origin).set(destination, weight);
    }
  }

  const minHeapAlternative = new OrderedCollection(function(itemA, itemB) {
    if (itemA.distanceVal !== itemB.distanceVal)
      return itemA.distanceVal - itemB.distanceVal;
    return itemA.nodeId - itemB.nodeId;
  });

  currentDistances.set(sourceNode, 0);
  minHeapAlternative.addEntry({ distanceVal: 0, nodeId: sourceNode });

  while (!minHeapAlternative.noElements()) {
    const currentPath = minHeapAlternative.fetchSmallest();
    
    const processingNode = currentPath.nodeId;
    const pathValue = currentPath.distanceVal;

    if (currentDistances.get(processingNode) < pathValue) {
      continue;
    }

    const neighborEdges = adjacencyStructure.get(processingNode);
    if (neighborEdges) {
      for (const [neighborId, edgeCost] of neighborEdges.entries()) {
        const newCalculatedDistance = currentDistances.get(processingNode) + edgeCost;

        if (newCalculatedDistance < currentDistances.get(neighborId)) {
          currentDistances.set(neighborId, newCalculatedDistance);
          minHeapAlternative.addEntry({ distanceVal: newCalculatedDistance, nodeId: neighborId });
        }
      }
    }
  }

  let outputLines = [];
  for (let i = 0; i < nodeCount; ++i) {
    const finalDistance = currentDistances.get(i);
    outputLines.push(finalDistance === BIG_VAL ? "INF" : finalDistance);
  }
  return outputLines.join('\n');
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const finalOutput = calculatePathCosts(fileContent);
process.stdout.write(finalOutput);