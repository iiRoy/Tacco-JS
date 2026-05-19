'use strict';

class MinHeapQueue {
  static defaultComparator(valA, valB) {
    return valA < valB;
  }

  constructor(customComparator) {
    this.heapArr = [];
    this.currentSize = 0;
    this.compFn = customComparator || MinHeapQueue.defaultComparator;
  }

  clone() {
    const clonedQueue = new MinHeapQueue(this.compFn);
    clonedQueue.currentSize = this.currentSize;
    for (let i = 0; i < this.currentSize; i++) {
      clonedQueue.heapArr.push(this.heapArr[i]);
    }
    return clonedQueue;
  }

  add(elementValue) {
    let currentIdx = this.currentSize;
    this.heapArr[this.currentSize] = elementValue;
    this.currentSize++;
    let parentIdx;
    let parentVal;
    while (currentIdx > 0) {
      parentIdx = (currentIdx - 1) >> 1;
      parentVal = this.heapArr[parentIdx];
      if (!this.compFn(elementValue, parentVal)) {
        break;
      }
      this.heapArr[currentIdx] = parentVal;
      currentIdx = parentIdx;
    }
    this.heapArr[currentIdx] = elementValue;
  }

  heapify(sourceArray) {
    this.heapArr = sourceArray;
    this.currentSize = sourceArray.length;
    for (let i = this.currentSize >> 1; i >= 0; i--) {
      this._percolateDown(i);
    }
  }

  _percolateUp(initialIdx, forcePercolation) {
    const elementValue = this.heapArr[initialIdx];
    let currentIdx = initialIdx;
    let parentIdx;
    let parentVal;
    while (currentIdx > 0) {
      parentIdx = (currentIdx - 1) >> 1;
      parentVal = this.heapArr[parentIdx];
      if (!forcePercolation && !this.compFn(elementValue, parentVal)) {
        break;
      }
      this.heapArr[currentIdx] = parentVal;
      currentIdx = parentIdx;
    }
    this.heapArr[currentIdx] = elementValue;
  }

  _percolateDown(initialIdx) {
    const queueSize = this.currentSize;
    const halfSize = queueSize >>> 1;
    let currentIdx = initialIdx;
    const currentElement = this.heapArr[currentIdx];
    let leftChildIdx;
    let rightChildIdx;
    let bestChildVal;
    let targetChildIdx;

    while (currentIdx < halfSize) {
      leftChildIdx = (currentIdx << 1) + 1;
      rightChildIdx = leftChildIdx + 1;
      bestChildVal = this.heapArr[leftChildIdx];
      targetChildIdx = leftChildIdx;

      if (rightChildIdx < queueSize) {
        if (this.compFn(this.heapArr[rightChildIdx], bestChildVal)) {
          targetChildIdx = rightChildIdx;
          bestChildVal = this.heapArr[rightChildIdx];
        }
      }
      if (!this.compFn(bestChildVal, currentElement)) {
        break;
      }
      this.heapArr[currentIdx] = bestChildVal;
      currentIdx = targetChildIdx;
    }
    this.heapArr[currentIdx] = currentElement;
  }

  _removeAt(targetIndex) {
    if (targetIndex >= this.currentSize || targetIndex < 0) return undefined;
    this._percolateUp(targetIndex, true);
    return this.poll();
  }

  _areElementsEqual(val1, val2) {
    return !this.compFn(val1, val2) && !this.compFn(val2, val1);
  }

  remove(elementValue) {
    for (let i = 0; i < this.currentSize; i++) {
      if (this._areElementsEqual(this.heapArr[i], elementValue)) {
        this._removeAt(i);
        return true;
      }
    }
    return false;
  }

  _batchRemove(callbackFn, limitCount) {
    if (!this.currentSize) return [];

    const removedItems = new Array(limitCount ? limitCount : this.currentSize);
    let removedCount = 0;

    if (typeof callbackFn === 'function') {
      let currentScanIdx = 0;
      while (currentScanIdx < this.currentSize && removedCount < removedItems.length) {
        if (callbackFn(this.heapArr[currentScanIdx])) {
          removedItems[removedCount++] = this._removeAt(currentScanIdx);
          currentScanIdx = currentScanIdx >> 1;
        } else {
          currentScanIdx++;
        }
      }
    }
    removedItems.length = removedCount;
    return removedItems;
  }

  removeOne(callbackFn) {
    const removedArr = this._batchRemove(callbackFn, 1);
    return removedArr.length > 0 ? removedArr[0] : undefined;
  }

  removeMany(callbackFn, limitCount) {
    return this._batchRemove(callbackFn, limitCount);
  }

  peek() {
    if (this.currentSize === 0) return undefined;
    return this.heapArr[0];
  }

  poll() {
    if (this.currentSize === 0) return undefined;
    let resultElement = this.heapArr[0];
    if (this.currentSize > 1) {
      this.heapArr[0] = this.heapArr[--this.currentSize];
      this._percolateDown(0);
    } else {
      this.currentSize--;
    }
    return resultElement;
  }

  replaceTop(elementValue) {
    if (this.currentSize === 0) return undefined;
    let resultElement = this.heapArr[0];
    this.heapArr[0] = elementValue;
    this._percolateDown(0);
    return resultElement;
  }

  trim() {
    this.heapArr = this.heapArr.slice(0, this.currentSize);
  }

  isEmpty() {
    return this.currentSize === 0;
  }

  forEach(callbackFn) {
    if (this.isEmpty() || typeof callbackFn !== 'function') return;
    let iterationIndex = 0;
    const clonedQueue = this.clone();
    while (!clonedQueue.isEmpty()) {
      callbackFn(clonedQueue.poll(), iterationIndex++);
    }
  }

  kSmallest(kCount) {
    if (this.currentSize === 0) return [];
    const heapArrayRef = this.heapArr;
    const indexComparator = (idxA, idxB) => this.compFn(heapArrayRef[idxA], heapArrayRef[idxB]);
    const indexMinHeap = new MinHeapQueue(indexComparator);

    const actualK = Math.min(this.currentSize, kCount);
    const smallestElements = new Array(actualK);
    let fillCount = 0;

    indexMinHeap.add(0);
    while (fillCount < actualK) {
      const currentSmallestIdx = indexMinHeap.poll();
      smallestElements[fillCount++] = heapArrayRef[currentSmallestIdx];

      const leftChild = (currentSmallestIdx << 1) + 1;
      const rightChild = leftChild + 1;

      if (leftChild < this.currentSize) indexMinHeap.add(leftChild);
      if (rightChild < this.currentSize) indexMinHeap.add(rightChild);
    }
    return smallestElements;
  }
}

function processInput(inputData) {
  const inputLines = inputData.split('\n');
  const firstLineParts = inputLines[0].split(' ');
  const totalElements = Number(firstLineParts[0]);
  const secondLineParts = inputLines[1].split(' ');
  const inputArray = secondLineParts.map(val => Number(val));

  const descSortedInput = [...inputArray].sort((a, b) => b - a);

  let initialNum = descSortedInput.shift();
  const processingQueue = new MinHeapQueue((a, b) => a > b);
  processingQueue.add(initialNum);
  let totalSum = initialNum;

  for (let i = 1; i < totalElements; i++) {
    const currentNum = descSortedInput.shift();
    const extractedVal = processingQueue.poll();
    console.log('number:', currentNum, 'v:', extractedVal);
    totalSum += extractedVal;
    processingQueue.add(currentNum);
    processingQueue.add(currentNum);
    console.log(processingQueue);
  }
  console.log(totalSum);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
