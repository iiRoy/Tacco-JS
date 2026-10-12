'use strict';

var standardComparison = function(firstItem, secondItem) {
  return firstItem < secondItem;
};

// the provided comparisonFunction function should take a, b and return *true* when a < b
function PriorityQueueEngine(comparisonFunction) {
  if (!(this instanceof PriorityQueueEngine)) return new PriorityQueueEngine(comparisonFunction);
  this.array = []; // Preserved name for console.log output
  this.size = 0;   // Preserved name for console.log output
  this.compare = comparisonFunction || standardComparison; // Preserved name for console.log output
}

// Helper function for bubbling up an element (recursive)
function bubbleUpElement(currentIdx, elementToBubble, forceFlag, dataArr, comparisonFn) {
  if (currentIdx === 0) {
    dataArr[currentIdx] = elementToBubble;
    return;
  }
  const parentIdx = (currentIdx - 1) >> 1;
  const parentVal = dataArr[parentIdx];

  if (forceFlag || comparisonFn(elementToBubble, parentVal)) {
    dataArr[currentIdx] = parentVal; // Move parent down
    bubbleUpElement(parentIdx, elementToBubble, forceFlag, dataArr, comparisonFn); // Recurse
  } else {
    dataArr[currentIdx] = elementToBubble; // Found spot, place element
  }
}

// Helper function for sinking down an element (recursive)
function sinkDownElement(currentIdx, elementToSink, dataArr, currentSize, comparisonFn) {
  const leftChildIdx = (currentIdx << 1) + 1;
  const rightChildIdx = leftChildIdx + 1;
  let bestChildIdx = currentIdx; // Assume current element is in correct place

  // Find the child with higher priority
  if (leftChildIdx < currentSize && comparisonFn(dataArr[leftChildIdx], elementToSink)) {
    bestChildIdx = leftChildIdx;
  }
  // If right child exists and has higher priority than current best (either elementToSink or leftChild)
  if (rightChildIdx < currentSize && comparisonFn(dataArr[rightChildIdx], dataArr[bestChildIdx])) {
    bestChildIdx = rightChildIdx;
  }

  // If a child has higher priority, swap and recurse
  if (bestChildIdx !== currentIdx) {
    dataArr[currentIdx] = dataArr[bestChildIdx]; // Move child up
    sinkDownElement(bestChildIdx, elementToSink, dataArr, currentSize, comparisonFn); // Recurse
  } else {
    dataArr[currentIdx] = elementToSink; // Found spot, place element
  }
}

// copy the priority queue into another, and return it. Queue items are shallow-copied.
// Runs in `O(n)` time.
PriorityQueueEngine.prototype.clone = function() {
  var newQueue = new PriorityQueueEngine(this.compare);
  newQueue.size = this.size;
  for (var i = 0; i < this.size; i++) {
    newQueue.array.push(this.array[i]);
  }
  return newQueue;
};

// Add an element into the queue
// runs in O(log n) time
PriorityQueueEngine.prototype.add = function(itemValue) {
  this.array[this.size] = itemValue;
  this.size += 1;
  bubbleUpElement(this.size - 1, itemValue, false, this.array, this.compare);
};

// replace the content of the heap by provided array and "heapify it"
PriorityQueueEngine.prototype.heapify = function(inputArray) {
  this.array = inputArray;
  this.size = inputArray.length;
  var loopCounter;
  for (loopCounter = this.size >> 1; loopCounter >= 0; loopCounter--) {
    sinkDownElement(loopCounter, this.array[loopCounter], this.array, this.size, this.compare);
  }
};

// internal
PriorityQueueEngine.prototype.extractAtIndex = function(indexPosition) {
  if (indexPosition > this.size - 1 || indexPosition < 0) return undefined;

  // impl2:
  bubbleUpElement(indexPosition, this.array[indexPosition], true, this.array, this.compare);
  return this.poll();
};

// remove(itemValue) will remove an item matching the provided value from the
// queue, checked for equality by using the queue's comparator.
// return true if removed, false otherwise.
PriorityQueueEngine.prototype.remove = function(itemValue) {
  for (var i = 0; i < this.size; i++) {
    if (!this.compare(this.array[i], itemValue) && !this.compare(itemValue, this.array[i])) {
      // items match, comparator returns false both ways, remove item
      this.extractAtIndex(i);
      return true;
    }
  }
  return false;
};

// internal
// removes and returns items for which the callback returns true.
PriorityQueueEngine.prototype.processBatchRemoval = function(callbackFunction, limitCount) {
  // initialize return array with max size of the limit or current queue size
  var resultArr = new Array(limitCount ? limitCount : this.size);
  var removedCount = 0;

  if (typeof callbackFunction === 'function' && this.size) {
    var currentIdx = 0;
    while (currentIdx < this.size && removedCount < resultArr.length) {
      if (callbackFunction(this.array[currentIdx])) {
        resultArr[removedCount] = this.extractAtIndex(currentIdx);
        removedCount++;
        // move up a level in the heap if we remove an item
        currentIdx = currentIdx >> 1;
      } else {
        currentIdx++;
      }
    }
  }
  resultArr.length = removedCount;
  return resultArr;
}

// removeOne(callback) will execute the callback function for each item of the queue
// and will remove the first item for which the callback will return true.
// return the removed item, or undefined if nothing is removed.
PriorityQueueEngine.prototype.removeOne = function(callbackFunction) {
  var removedItems = this.processBatchRemoval(callbackFunction, 1);
  return removedItems.length > 0 ? removedItems[0] : undefined;
};

// remove(callback[, limit]) will execute the callback function for each item of
// the queue and will remove each item for which the callback returns true, up to
// a max limit of removed items if specified or no limit if unspecified.
// return an array containing the removed items.
PriorityQueueEngine.prototype.removeMany = function(callbackFunction, limitCount) {
  return this.processBatchRemoval(callbackFunction, limitCount);
};

// Look at the top of the queue (one of the smallest elements) without removing it
// executes in constant time
//
// Calling peek on an empty priority queue returns
// the "undefined" value.
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/undefined
//
PriorityQueueEngine.prototype.peek = function() {
  if (this.size == 0) return undefined;
  return this.array[0];
};

// remove the element on top of the heap (one of the smallest elements)
// runs in logarithmic time
//
// If the priority queue is empty, the function returns the
// "undefined" value.
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/undefined
//
// For long-running and large priority queues, or priority queues
// storing large objects, you may  want to call the trim function
// at strategic times to recover allocated memory.
PriorityQueueEngine.prototype.poll = function() {
  if (this.size == 0) return undefined;
  var result = this.array[0];
  if (this.size > 1) {
    this.array[0] = this.array[--this.size];
    sinkDownElement(0, this.array[0], this.array, this.size, this.compare);
  } else {
    this.size -= 1;
  }
  return result;
};

// This function adds the provided value to the heap, while removing
// and returning one of the smallest elements (like poll). The size of the queue
// thus remains unchanged.
PriorityQueueEngine.prototype.replaceTop = function(itemValue) {
  if (this.size == 0) return undefined;
  var result = this.array[0];
  this.array[0] = itemValue;
  sinkDownElement(0, this.array[0], this.array, this.size, this.compare);
  return result;
};

// recover unused memory (for long-running priority queues)
PriorityQueueEngine.prototype.trim = function() {
  this.array = this.array.slice(0, this.size);
};

// Check whether the heap is empty
PriorityQueueEngine.prototype.isEmpty = function() {
  return this.size === 0;
};

// iterate over the items in order, pass a callback that receives (item, index) as args.
PriorityQueueEngine.prototype.forEach = function(callbackFunction) {
  if (this.isEmpty() || typeof callbackFunction != 'function') return;
  var loopIndex = 0;
  var clonedQueue = this.clone();
  while (!clonedQueue.isEmpty()) {
    callbackFunction(clonedQueue.poll(), loopIndex++);
  }
};

// return the k 'smallest' elements of the queue
// runs in O(k log k) time
// this is the equivalent of repeatedly calling poll, but
// it has a better computational complexity, which can be
// important for large data sets.
PriorityQueueEngine.prototype.kSmallest = function(kCount) {
  if (this.size == 0) return [];
  var comparisonFn = this.compare;
  var dataArr = this.array
  var tempQueue = new PriorityQueueEngine(function(idxA, idxB){
   return comparisonFn(dataArr[idxA], dataArr[idxB]);
  });
  kCount = Math.min(this.size, kCount);
  var smallestElements = new Array(kCount);
  var resultIndex = 0;
  tempQueue.add(0);
  while (resultIndex < kCount) {
    var smallestIdx = tempQueue.poll();
    smallestElements[resultIndex++] = this.array[smallestIdx];
    var leftChild = (smallestIdx << 1) + 1;
    var rightChild = leftChild + 1;
    if (leftChild < this.size) tempQueue.add(leftChild);
    if (rightChild < this.size) tempQueue.add(rightChild);
  }
  return smallestElements;
}


function findLargestIndex(inputArray) {
  let maximumValue = -1
  let maximumIndex = -1
  for(let i = 0; i < inputArray.length; i++) {
    if (maximumValue < inputArray[i]) {
      maximumIndex = i
      maximumValue = inputArray[i]
    }
  }
  return maximumIndex
}

function processInput(rawInput) {
  const inputLines = rawInput.split('\n')
  const [totalElements] = inputLines[0].split(' ').map(Number)
  const initialValues = inputLines[1].split(' ').map(Number)

  const descendingValues = initialValues.sort((a, b) => b - a)

  let currentValue = descendingValues.shift()
  let activeQueue = new PriorityQueueEngine(function (a, b) {
    return a > b
  })
  activeQueue.add(currentValue)
  let accumulatedSum = currentValue
  for(let loopIndex = 1; loopIndex < totalElements ; loopIndex++) {
    const nextValue = descendingValues.shift()
    const extractedValue = activeQueue.poll()
    console.log('number:', nextValue, 'v:', extractedValue)
    accumulatedSum += extractedValue
    activeQueue.add(nextValue)
    activeQueue.add(nextValue)
    console.log(activeQueue)
  }
  console.log(accumulatedSum)
}


processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim())
