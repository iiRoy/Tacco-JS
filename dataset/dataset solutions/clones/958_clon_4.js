const inputSourceConfiguration = {
  path: '/dev/stdin',
  lineDelimiter: '\n'
};

const acquireAndParseContent = (configurationObject) => {
  const fileSystemModule = require('node:fs');
  const rawText = fileSystemModule.readFileSync(configurationObject.path, { encoding: 'utf8' });
  const segmentedLines = rawText.trim().split(configurationObject.lineDelimiter);
  return segmentedLines;
};

class ElementHeap {
  constructor() {
    this.elements = [];
  }

  insert(priorityValue, itemValue) {
    this.elements.push({ priority: priorityValue, value: itemValue });
    this.reorderUp(this.elements.length - 1);
  }

  extractMin() {
    if (this.isEmpty()) return null;
    const minimum = this.elements[0];
    const lastElement = this.elements.pop();
    if (!this.isEmpty()) {
      this.elements[0] = lastElement;
      this.reorderDown(0);
    }
    return minimum.value;
  }

  isEmpty() {
    return this.elements.length === 0;
  }

  reorderUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.elements[index].priority >= this.elements[parentIndex].priority) break;
      [this.elements[index], this.elements[parentIndex]] = [this.elements[parentIndex], this.elements[index]];
      index = parentIndex;
    }
  }

  reorderDown(index) {
    const totalLength = this.elements.length;
    const currentElement = this.elements[index];
    while (true) {
      const leftChildIdx = 2 * index + 1;
      const rightChildIdx = 2 * index + 2;
      let leftChildItem, rightChildItem;
      let swapPosition = null;

      if (leftChildIdx < totalLength) {
        leftChildItem = this.elements[leftChildIdx];
        if (leftChildItem.priority < currentElement.priority) {
          swapPosition = leftChildIdx;
        }
      }

      if (rightChildIdx < totalLength) {
        rightChildItem = this.elements[rightChildIdx];
        if (
          (swapPosition === null && rightChildItem.priority < currentElement.priority) ||
          (swapPosition !== null && rightChildItem.priority < leftChildItem.priority)
        ) {
          swapPosition = rightChildIdx;
        }
      }

      if (swapPosition === null) break;
      [this.elements[index], this.elements[swapPosition]] = [this.elements[swapPosition], this.elements[index]];
      index = swapPosition;
    }
  }
}

const computeOptimalRoutes = () => {
  const content = acquireAndParseContent(inputSourceConfiguration);

  let nodeQuantity = Number(content.shift());

  const outboundLinks = new Map(); // Map<sourceNode, Map<targetNode, weight>>
  const inboundLinks = new Map();  // Map<targetNode, Map<sourceNode, weight>> (for divergence)

  const registerPath = (mapStructure, origin, destination, value) => {
    if (!mapStructure.has(origin)) {
      mapStructure.set(origin, new Map());
    }
    mapStructure.get(origin).set(destination, value);
  };

  for (let lineIndex = 0; lineIndex < content.length; lineIndex++) {
    const parts = content[lineIndex].split(' ').map(Number);
    const sourceIdentifier = parts[0];
    for (let partsIterator = 2; partsIterator < parts.length; partsIterator += 2) {
      const destinationIdentifier = parts[partsIterator];
      const linkValue = parts[partsIterator + 1];
      registerPath(outboundLinks, sourceIdentifier, destinationIdentifier, linkValue);
      registerPath(inboundLinks, destinationIdentifier, sourceIdentifier, linkValue);
    }
  }

  const finalDistances = new Array(nodeQuantity).fill(Infinity);
  const exploredVertices = new Set();
  const priorityQueue = new ElementHeap();

  finalDistances[0] = 0;
  priorityQueue.insert(0, 0); // [distance, node_id]

  while (!priorityQueue.isEmpty()) {
    const currentVertex = priorityQueue.extractMin();
    const currentVertexDistance = finalDistances[currentVertex];

    if (exploredVertices.has(currentVertex)) {
      continue;
    }
    exploredVertices.add(currentVertex);

    if (outboundLinks.has(currentVertex)) {
      for (const [neighborVertex, weightToNeighbor] of outboundLinks.get(currentVertex).entries()) {
        const potentialNewDistance = currentVertexDistance + weightToNeighbor;

        if (potentialNewDistance < finalDistances[neighborVertex]) {
          finalDistances[neighborVertex] = potentialNewDistance;
          priorityQueue.insert(potentialNewDistance, neighborVertex);
        }
      }
    }
  }

  for (let resultIndex = 0; resultIndex < nodeQuantity; resultIndex++) {
    console.log(resultIndex + ' ' + finalDistances[resultIndex]);
  }
};

computeOptimalRoutes();