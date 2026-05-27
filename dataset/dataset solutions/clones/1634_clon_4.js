function PriorityQueueStructure(comparisonFunction) {
  if (!(this instanceof PriorityQueueStructure)) return new PriorityQueueStructure(comparisonFunction);
  this.elements = [];
  this.elementCount = 0;
  this.compareFn = comparisonFunction || defaultComparison;
}

const defaultComparison = (valA, valB) => valA < valB;

const getParentIdx = (idx) => Math.floor((idx - 1) / 2);
const getLeftChildIdx = (idx) => 2 * idx + 1;
const getRightChildIdx = (idx) => 2 * idx + 2;

PriorityQueueStructure.prototype._bubbleUp = function(idx, forceSwap = false) {
  if (idx === 0) return;

  const parentIdx = getParentIdx(idx);
  const currentVal = this.elements[idx];
  const parentVal = this.elements[parentIdx];

  if (forceSwap || this.compareFn(currentVal, parentVal)) {
    this.elements[parentIdx] = currentVal;
    this.elements[idx] = parentVal;
    this._bubbleUp(parentIdx, forceSwap);
  }
};

PriorityQueueStructure.prototype._bubbleDown = function(idx) {
  const leftChildIdx = getLeftChildIdx(idx);
  const rightChildIdx = getRightChildIdx(idx);
  let smallestIdx = idx;
  const currentVal = this.elements[idx];

  if (leftChildIdx < this.elementCount && this.compareFn(this.elements[leftChildIdx], this.elements[smallestIdx])) {
    smallestIdx = leftChildIdx;
  }

  if (rightChildIdx < this.elementCount && this.compareFn(this.elements[rightChildIdx], this.elements[smallestIdx])) {
    smallestIdx = rightChildIdx;
  }

  if (smallestIdx !== idx) {
    const temp = this.elements[idx];
    this.elements[idx] = this.elements[smallestIdx];
    this.elements[smallestIdx] = temp;
    this._bubbleDown(smallestIdx);
  }
};

PriorityQueueStructure.prototype._removeAtPosition = function(pos) {
  if (pos >= this.elementCount || pos < 0) return undefined;

  this._bubbleUp(pos, true);
  return this.extractMinimum();
};

PriorityQueueStructure.prototype.removeSpecific = function(targetValue) {
  const foundIndex = this.elements.findIndex(item =>
    !this.compareFn(item, targetValue) && !this.compareFn(targetValue, item)
  );

  if (foundIndex !== -1) {
    this._removeAtPosition(foundIndex);
    return true;
  }
  return false;
};

PriorityQueueStructure.prototype._processAndRemove = function(filterPredicate, maxLimit) {
  const removedItems = [];
  if (typeof filterPredicate !== 'function' || this.elementCount === 0) {
    return removedItems;
  }

  let remainingElements = [];
  for (let i = 0; i < this.elementCount; i++) {
    if (filterPredicate(this.elements[i]) && (maxLimit === undefined || removedItems.length < maxLimit)) {
      removedItems.push(this.elements[i]);
    } else {
      remainingElements.push(this.elements[i]);
    }
  }

  this.elements = [];
  this.elementCount = 0;
  this.buildHeap(remainingElements);

  return removedItems;
};

PriorityQueueStructure.prototype.removeFirstMatch = function(predicate) {
  const result = this._processAndRemove(predicate, 1);
  return result.length > 0 ? result[0] : undefined;
};

PriorityQueueStructure.prototype.removeMatching = function(predicate, limitCount) {
  return this._processAndRemove(predicate, limitCount);
};

PriorityQueueStructure.prototype.viewTop = function() {
  return this.elementCount === 0 ? undefined : this.elements[0];
};

PriorityQueueStructure.prototype.extractMinimum = function() {
  if (this.elementCount === 0) return undefined;

  const minVal = this.elements[0];
  this.elementCount--;

  if (this.elementCount > 0) {
    this.elements[0] = this.elements[this.elementCount];
    this.elements.pop();
    this._bubbleDown(0);
  } else {
    this.elements.pop();
  }
  return minVal;
};

PriorityQueueStructure.prototype.swapTop = function(newValue) {
  if (this.elementCount === 0) return undefined;
  const oldTop = this.elements[0];
  this.elements[0] = newValue;
  this._bubbleDown(0);
  return oldTop;
};

PriorityQueueStructure.prototype.compactStorage = function() {
  this.elements.length = this.elementCount;
};

PriorityQueueStructure.prototype.isQueueEmpty = function() {
  return this.elementCount === 0;
};

PriorityQueueStructure.prototype.iterateOrdered = function(processItem) {
  if (this.isQueueEmpty() || typeof processItem !== 'function') return;
  let itemIndex = 0;
  const tempQueue = this.createCopy();
  while (!tempQueue.isQueueEmpty()) {
    processItem(tempQueue.extractMinimum(), itemIndex++);
  }
};

PriorityQueueStructure.prototype.retrieveKSmallest = function(kValue) {
  if (this.elementCount === 0) return [];
  const currentComparator = this.compareFn;
  const sourceArray = this.elements;

  const indexPQ = new PriorityQueueStructure(function(idxA, idxB) {
    return currentComparator(sourceArray[idxA], sourceArray[idxB]);
  });

  kValue = Math.min(this.elementCount, kValue);
  const smallestResults = new Array(kValue);
  let resultCounter = 0;

  indexPQ.insertElement(0);

  while (resultCounter < kValue) {
    const currentSmallestIdx = indexPQ.extractMinimum();
    smallestResults[resultCounter++] = sourceArray[currentSmallestIdx];

    const leftChild = getLeftChildIdx(currentSmallestIdx);
    const rightChild = getRightChildIdx(currentSmallestIdx);

    if (leftChild < this.elementCount) indexPQ.insertElement(leftChild);
    if (rightChild < this.elementCount) indexPQ.insertElement(rightChild);
  }
  return smallestResults;
};

PriorityQueueStructure.prototype.createCopy = function() {
  const newQueue = new PriorityQueueStructure(this.compareFn);
  newQueue.elementCount = this.elementCount;
  newQueue.elements = [...this.elements];
  return newQueue;
};

PriorityQueueStructure.prototype.insertElement = function(itemValue) {
  this.elements[this.elementCount] = itemValue;
  this.elementCount++;
  this._bubbleUp(this.elementCount - 1);
};

PriorityQueueStructure.prototype.buildHeap = function(sourceArray) {
  this.elements = [...sourceArray];
  this.elementCount = sourceArray.length;
  for (let i = Math.floor(this.elementCount / 2) - 1; i >= 0; i--) {
    this._bubbleDown(i);
  }
};


process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputLines = [];
var lineReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
lineReader.on('line', (currentLine) => {
  inputLines.push(currentLine);
});
lineReader.on('close', () => {
    const [numN, numK] = inputLines[0].split(" ").map(Number);
    const dataList = inputLines[1].split(" ").map(Number).sort((a, b) => a - b).reverse();

    function performBinarySearch(lowLimit, highLimit, targetK, dataItems) {
      let bestAnswer = highLimit;

      const searchRecursive = (currentLow, currentHigh) => {
        if (currentLow > currentHigh) {
          return;
        }

        const midPoint = Math.ceil((currentLow + currentHigh) / 2);
        let totalOperations = 0;
        let conditionMet = true;

        dataItems.some(val => {
          totalOperations += Math.ceil(val / midPoint) - 1;
          if (totalOperations > targetK) {
            conditionMet = false;
            return true;
          }
          return false;
        });

        if (conditionMet) {
          bestAnswer = midPoint;
          searchRecursive(currentLow, midPoint - 1);
        } else {
          searchRecursive(midPoint + 1, currentHigh);
        }
      };

      searchRecursive(lowLimit, highLimit);
      return bestAnswer;
    }

    const finalAnswer = performBinarySearch(0, dataList[0], numK, dataList);
    console.log(finalAnswer);
    return;
});
