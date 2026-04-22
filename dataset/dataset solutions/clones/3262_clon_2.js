'use strict'

class Processor {
  // Initiates the primary processing sequence for the given data.
  execute() {
    const initialValues = dataFetcher.retrieveIntArray();
    const selectionLimit = initialValues[1];
    const itemData = dataFetcher.retrieveIntMatrix(initialValues[0]);
    const performanceRecords = [];

    // Sort the items based on their second component in descending order.
    itemData
      .sort(entry => entry[1])
      .reverse();

    const topSelections = utilities.getHeadElements(itemData, selectionLimit);
    const categoryTally = {};

    // Count occurrences of each category among the selected items.
    topSelections.forEach(selectionItem => categoryTally[selectionItem[0]] = (categoryTally[selectionItem[0]] ? categoryTally[selectionItem[0]] + 1 : 1));

    let distinctCategories = Object.keys(categoryTally).length;
    // Calculate initial score based on unique categories and sum of selected item values.
    performanceRecords[distinctCategories] = utilities.calculateSum(topSelections.map(item => item[1]));

    const priorityStore = new PriorityQueue();
    // Populate the priority queue with items having duplicate categories.
    topSelections.forEach(selectedEntry => {
      if (categoryTally[selectedEntry[0]] > 1) {
        priorityStore.insertElement(selectedEntry[1], selectedEntry);
      }
    });

    let currentPosition = topSelections.length;
    // Iterate while there are items in the priority queue and unexamined items in the main data.
    while (priorityStore.size > 0 && currentPosition < itemData.length) {
      const extractedEntry = priorityStore.extractMax(); // Get item with highest priority (value)

      // If the extracted item's category has duplicates, attempt replacement.
      if (categoryTally[extractedEntry[0]] >= 2) {
        --categoryTally[extractedEntry[0]]; // Decrement count for the category.

        // Find a suitable replacement item.
        do {
          let incomingItem = itemData[currentPosition];
          ++currentPosition;

          // If the incoming item introduces a new category.
          if (!categoryTally[incomingItem[0]]) {
            categoryTally[incomingItem[0]] = 1; // Mark as new category.
            priorityStore.insertElement(incomingItem[1], incomingItem); // Add to priority queue.
            ++distinctCategories; // Increment count of unique categories.
            // Update performance record for the new category count.
            performanceRecords[distinctCategories] = performanceRecords[distinctCategories - 1] + incomingItem[1] - extractedEntry[1];
            break; // Found a replacement, exit inner loop.
          }
        } while (currentPosition < itemData.length); // Continue searching if more items are available.
      }
    }

    // Compute final scores by adding the square of the category count to each record.
    const computedResults = performanceRecords.map((resultValue, resultIndex) => resultValue ? (resultValue + resultIndex * resultIndex) : 0);
    // Output the maximum final score.
    console.log(utilities.findMaximum(computedResults));
  }
}

class DataSource {
  // Initializes the data source with a read pointer.
  constructor() {
    this.readPointer = 0;
    this.loadAllData();
  }

  // Reads all input from stdin and stores it.
  loadAllData() {
    this.fileContent = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.fileContent;
  }

  // Retrieves one or more lines of input.
  retrieveLine(count) {
    if (count) {
      const retrievedLines = this.fileContent.slice(this.readPointer, this.readPointer + count);
      this.readPointer += count;
      return retrievedLines;
    }
    // Retrieve a single line and advance the pointer.
    return this.fileContent[this.readPointer++];
  }

  // Fetches a line and splits it into an array of strings.
  retrieveStringArray() {
    return this.retrieveLine().split(' ');
  }

  // Fetches a line, splits it, and converts elements to integers.
  retrieveIntArray() {
    return this.retrieveStringArray().map((strValue) => parseInt(strValue));
  }

  // Reads multiple lines and splits each into an array of strings.
  retrieveStringMatrix(rowCount) {
    return this.retrieveLine(rowCount).map((textLine) => textLine.split(' '));
  }

  // Reads multiple lines, splits each, and converts elements to integers.
  retrieveIntMatrix(rowCount) {
    return this.retrieveLine(rowCount).map((textLine) => textLine.split(' ').map((itemString) => parseInt(itemString)));
  }
}

/* A collection of common utility functions */
class UtilityBelt {
  // Computes the sum of all numbers in an array.
  calculateSum(collection) { return collection.reduce((accumulator, currentValue) => accumulator + currentValue); }

  // Finds the minimum element in an array, optionally using a custom comparison function.
  findMinimum(collection, comparisonFunc) {
    if (comparisonFunc == null) { comparisonFunc = (a, b) => a - b }
    return collection.reduce((currentMin, nextVal) => comparisonFunc(currentMin, nextVal) < 0 ? currentMin : nextVal);
  }

  // Finds the maximum element in an array, optionally using a custom comparison function.
  findMaximum(collection, comparisonFunc) {
    if (comparisonFunc == null) { comparisonFunc = (a, b) => a - b }
    return collection.reduce((currentMax, nextVal) => comparisonFunc(currentMax, nextVal) > 0 ? currentMax : nextVal);
  }

  // Generates a sequence of numbers within a specified range.
  generateSequence(beginValue, endValue, incrementStep) {
    if (endValue == null) {
      endValue = beginValue || 0;
      beginValue = 0;
    }
    if (!incrementStep) {
      incrementStep = endValue < beginValue ? -1 : 1;
    }
    const sequenceLength = Math.max(Math.ceil((endValue - beginValue) / incrementStep), 0);
    const generatedSequence = Array(sequenceLength);

    for (var currentIdx = 0; currentIdx < sequenceLength; currentIdx++, beginValue += incrementStep) {
      generatedSequence[currentIdx] = beginValue;
    }
    return generatedSequence;
  }

  // Retrieves the first 'count' elements from an array.
  getHeadElements(sourceArray, elementCount) {
    if (sourceArray == null || sourceArray.length < 1) return elementCount == null ? void 0 : [];
    if (elementCount == null) return sourceArray[0];
    return this.getInitialElements(sourceArray, sourceArray.length - elementCount);
  };

  // Gets all elements except the last 'count' from an array.
  getInitialElements(sourceArray, elementCount) { return sourceArray.slice.call(sourceArray, 0, Math.max(0, sourceArray.length - (elementCount == null ? 1 : elementCount))); }

  // Retrieves all elements from an array starting from the 'count'-th element.
  getTailElements(collection, elementCount) { return collection.slice.call(collection, elementCount == null ? 1 : elementCount); }

  // Retrieves the last 'count' elements from an array.
  getEndElements(sourceArray, elementCount) {
    if (elementCount == null) return sourceArray[sourceArray.length - 1];
    return this.getTailElements(sourceArray, Math.max(0, sourceArray.length - elementCount));
  }

  // Performs a binary search to find the insertion index for a key in a sorted array.
  locateIndex(sourceArray, searchKey, keyExtractor) {
    const extractValue = (dataObject) => (typeof dataObject === 'object') ? dataObject[keyExtractor] : dataObject;
    const targetValue = extractValue(searchKey);
    let lowerBound = 0, upperBound = sourceArray.length;
    while (lowerBound < upperBound) {
      let middlePoint = Math.floor((lowerBound + upperBound) / 2);
      if (extractValue(sourceArray[middlePoint]) < targetValue) lowerBound = middlePoint + 1; else upperBound = middlePoint;
    }
    return lowerBound;
  };
}
const utilities = new UtilityBelt();

/* An implementation of a binary max-priority queue */
class PriorityQueue {
  // Initializes an empty priority queue.
  constructor() {
    this.internalStorage = [];
    this.currentSize = 0;
  }

  /* Adds a new element with its priority and value */
  insertElement(itemPriority, itemValue) {
    const storage = this.internalStorage;
    storage.push({ pri: itemPriority, val: itemValue }); // Store as an object with priority and value.
    let insertionIndex = this.currentSize;
    let parentIndex = (insertionIndex - 1) >> 1; // Calculate parent index.

    // Perform up-heap operation to maintain heap property.
    while (parentIndex >= 0 && storage[parentIndex].pri < storage[insertionIndex].pri) {
      const tempElement = storage[insertionIndex];
      storage[insertionIndex] = storage[parentIndex];
      storage[parentIndex] = tempElement;
      insertionIndex = parentIndex;
      parentIndex = (insertionIndex - 1) >> 1;
    }
    ++this.currentSize;
  }

  /* Removes and returns the element with the highest priority */
  extractMax() {
    if (this.size <= 0) {
      return null;
    }
    const effectiveSize = this.currentSize - 1;
    const storage = this.internalStorage;
    const highestValue = this.peekMax; // Get the value of the root element.

    storage[0] = storage[effectiveSize]; // Move the last element to the root.
    storage.pop(); // Remove the last element.

    let currentIdx = 0;
    let leftChildIdx = (currentIdx << 1) + 1;
    let rightChildIdx = (currentIdx << 1) + 2;

    // Perform down-heap operation to restore heap property.
    let rootPriority, leftPriority, rightPriority;
    while (leftChildIdx < effectiveSize) {
      if (rightChildIdx < effectiveSize) {
        // Both children exist.
        rootPriority = storage[currentIdx].pri;
        leftPriority = storage[leftChildIdx].pri;
        rightPriority = storage[rightChildIdx].pri;

        if ((leftPriority < rightPriority) && (rootPriority < rightPriority)) {
          // Right child is larger and larger than parent, swap with right child.
          const temporary = storage[currentIdx];
          storage[currentIdx] = storage[rightChildIdx];
          storage[rightChildIdx] = temporary;
          currentIdx = rightChildIdx;
        } else if (rootPriority < leftPriority) {
          // Left child is larger than parent, swap with left child.
          const temporary = storage[currentIdx];
          storage[currentIdx] = storage[leftChildIdx];
          storage[leftChildIdx] = temporary;
          currentIdx = leftChildIdx;
        } else {
          break; // Heap property satisfied.
        }
        leftChildIdx = (currentIdx << 1) + 1;
        rightChildIdx = (currentIdx << 1) + 2;
      } else {
        // Only left child exists.
        rootPriority = storage[currentIdx].pri;
        leftPriority = storage[leftChildIdx].pri;
        if (rootPriority < leftPriority) {
          // Left child is larger, swap.
          const temporary = storage[currentIdx];
          storage[currentIdx] = storage[leftChildIdx];
          storage[leftChildIdx] = temporary;
        }
        break; // End of heap or heap property satisfied.
      }
    }

    this.currentSize = effectiveSize;
    return highestValue;
  }

  /* Retrieves the value of the element with the highest priority without removing it. */
  get peekMax() {
    // Returns the value part of the object at the root.
    return this.internalStorage[0].val;
  }

  /* Returns the number of elements currently in the queue. */
  get size() {
    return this.currentSize;
  }
}

const dataFetcher = new DataSource();
(new Processor()).execute();