class MinPriorityQueue {
  static defaultComparison(itemA, itemB) {
    return itemA < itemB;
  }

  constructor(comparisonFunction = MinPriorityQueue.defaultComparison) {
    this.heapArray = [];
    this.currentSize = 0;
    this.comparisonFunction = comparisonFunction;
  }

  _areEquivalent(valA, valB) {
    return !this.comparisonFunction(valA, valB) && !this.comparisonFunction(valB, valA);
  }

  _removeItemAtIndex(targetIndex) {
    const lastValidIndex = this.currentSize - 1;
    if (targetIndex > lastValidIndex || targetIndex < 0) {
      return undefined;
    }
    this._percolateUp(targetIndex, true);
    return this.extractMin();
  }

  removeValue(targetValue) {
    for (let i = 0; i < this.currentSize; i++) {
      const currentHeapItem = this.heapArray[i];
      if (this._areEquivalent(currentHeapItem, targetValue)) {
        this._removeItemAtIndex(i);
        return true;
      }
    }
    return false;
  }

  _processBatchRemoval(filterCallback, removalLimit) {
    const maxResults = removalLimit ? removalLimit : this.currentSize;
    const removedElements = new Array(maxResults);
    let actualRemovedCount = 0;

    if (typeof filterCallback === 'function' && this.currentSize > 0) {
      let currentScanIndex = 0;
      while (currentScanIndex < this.currentSize && actualRemovedCount < maxResults) {
        const itemToCheck = this.heapArray[currentScanIndex];
        if (filterCallback(itemToCheck)) {
          removedElements[actualRemovedCount] = this._removeItemAtIndex(currentScanIndex);
          actualRemovedCount++;
          currentScanIndex = currentScanIndex >> 1;
        } else {
          currentScanIndex++;
        }
      }
    }
    removedElements.length = actualRemovedCount;
    return removedElements;
  }

  removeFirstMatching(filterCallback) {
    const results = this._processBatchRemoval(filterCallback, 1);
    return results.length > 0 ? results[0] : undefined;
  }

  removeMatchingItems(filterCallback, removalLimit) {
    return this._processBatchRemoval(filterCallback, removalLimit);
  }

  getMin() {
    if (this.currentSize === 0) return undefined;
    return this.heapArray[0];
  }

  extractMin() {
    if (this.currentSize === 0) return undefined;
    const minimumItem = this.heapArray[0];
    if (this.currentSize > 1) {
      this.heapArray[0] = this.heapArray[--this.currentSize];
      this._percolateDown(0);
    } else {
      this.currentSize--;
    }
    return minimumItem;
  }

  replaceRoot(newItemValue) {
    if (this.currentSize === 0) return undefined;
    const oldRootValue = this.heapArray[0];
    this.heapArray[0] = newItemValue;
    this._percolateDown(0);
    return oldRootValue;
  }

  compactStorage() {
    this.heapArray = this.heapArray.slice(0, this.currentSize);
  }

  isQueueEmpty() {
    return this.currentSize === 0;
  }

  traverseQueue(callbackFunction) {
    if (this.isQueueEmpty() || typeof callbackFunction !== 'function') return;
    let iterationCounter = 0;
    const temporaryQueue = this.clone();
    while (!temporaryQueue.isQueueEmpty()) {
      callbackFunction(temporaryQueue.extractMin(), iterationCounter++);
    }
  }

  findKSmallest(kElementsCount) {
    if (this.currentSize === 0) return [];
    const originalComparator = this.comparisonFunction;
    const sourceDataArray = this.heapArray;

    const indexBasedComparator = (idxA, idxB) => originalComparator(sourceDataArray[idxA], sourceDataArray[idxB]);
    const indexPriorityQueue = new MinPriorityQueue(indexBasedComparator);

    const actualK = Math.min(this.currentSize, kElementsCount);
    const smallestResults = new Array(actualK);
    let resultIndex = 0;

    indexPriorityQueue.add(0);
    while (resultIndex < actualK) {
      const currentSmallestIndex = indexPriorityQueue.extractMin();
      smallestResults[resultIndex++] = sourceDataArray[currentSmallestIndex];

      const leftChildIndex = (currentSmallestIndex << 1) + 1;
      const rightChildIndex = leftChildIndex + 1;

      if (leftChildIndex < this.currentSize) {
        indexPriorityQueue.add(leftChildIndex);
      }
      if (rightChildIndex < this.currentSize) {
        indexPriorityQueue.add(rightChildIndex);
      }
    }
    return smallestResults;
  }

  clone() {
    const newPriorityQueue = new MinPriorityQueue(this.comparisonFunction);
    newPriorityQueue.currentSize = this.currentSize;
    newPriorityQueue.heapArray = Array.from(this.heapArray);
    return newPriorityQueue;
  }

  add(newItemValue) {
    let insertionIndex = this.currentSize;
    this.heapArray[this.currentSize] = newItemValue;
    this.currentSize++;

    while (insertionIndex > 0) {
      const parentNodeIndex = (insertionIndex - 1) >> 1;
      const parentNodeValue = this.heapArray[parentNodeIndex];
      if (!this.comparisonFunction(newItemValue, parentNodeValue)) {
        break;
      }
      this.heapArray[insertionIndex] = parentNodeValue;
      insertionIndex = parentNodeIndex;
    }
    this.heapArray[insertionIndex] = newItemValue;
  }

  heapify(inputArray) {
    this.heapArray = inputArray;
    this.currentSize = inputArray.length;
    for (let i = this.currentSize >> 1; i >= 0; i--) {
      this._percolateDown(i);
    }
  }

  _percolateUp(currentIndex, forceUp = false) {
    const valueToPercolate = this.heapArray[currentIndex];
    while (currentIndex > 0) {
      const parentIndex = (currentIndex - 1) >> 1;
      const parentValue = this.heapArray[parentIndex];
      if (!forceUp && !this.comparisonFunction(valueToPercolate, parentValue)) {
        break;
      }
      this.heapArray[currentIndex] = parentValue;
      currentIndex = parentIndex;
    }
    this.heapArray[currentIndex] = valueToPercolate;
  }

  _percolateDown(currentIndex) {
    const totalHeapSize = this.currentSize;
    const halfHeapSize = totalHeapSize >>> 1;
    const rootElementValue = this.heapArray[currentIndex];

    while (currentIndex < halfHeapSize) {
      let leftChildIdx = (currentIndex << 1) + 1;
      let rightChildIdx = leftChildIdx + 1;
      let bestChildIdx = leftChildIdx;

      if (rightChildIdx < totalHeapSize && this.comparisonFunction(this.heapArray[rightChildIdx], this.heapArray[leftChildIdx])) {
        bestChildIdx = rightChildIdx;
      }

      const bestChildValue = this.heapArray[bestChildIdx];

      if (!this.comparisonFunction(bestChildValue, rootElementValue)) {
        break;
      }

      this.heapArray[currentIndex] = bestChildValue;
      currentIndex = bestChildIdx;
    }
    this.heapArray[currentIndex] = rootElementValue;
  }
}

const parseNumberFromString = (str) => Number(str);

const checkFeasibility = (itemsArray, maxOperationsAllowed, currentAverage) => {
  let totalOperationsNeeded = 0;
  for (let itemIdx = 0; itemIdx < itemsArray.length; itemIdx++) {
    totalOperationsNeeded += Math.ceil(itemsArray[itemIdx] / currentAverage) - 1;
    if (totalOperationsNeeded > maxOperationsAllowed) {
      return false;
    }
  }
  return true;
};

(async () => {
  const rawInputLines = [];
  const inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  inputReader.on('line', (lineContent) => {
    rawInputLines.push(lineContent);
  });

  inputReader.on('close', () => {
    const [numItemsStr, maxOperationsStr] = rawInputLines[0].split(" ");
    const numItems = parseNumberFromString(numItemsStr);
    const maxOperations = parseNumberFromString(maxOperationsStr);

    const sortedItems = rawInputLines[1].split(" ").map(parseNumberFromString).sort((a, b) => b - a);

    let lowerBound = 1;
    let upperBound = sortedItems[0];
    let finalAnswer = upperBound;

    while (lowerBound <= upperBound) {
      const currentAverage = Math.ceil((lowerBound + upperBound) / 2);

      if (checkFeasibility(sortedItems, maxOperations, currentAverage)) {
        finalAnswer = currentAverage;
        upperBound = currentAverage - 1;
      } else {
        lowerBound = currentAverage + 1;
      }
    }
    console.log(finalAnswer);
  });

  process.stdin.resume();
  process.stdin.setEncoding('utf8');
})();
