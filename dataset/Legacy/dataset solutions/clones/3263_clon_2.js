'use strict';

class SolutionProcessor {
  // This method orchestrates the primary logic to solve the given problem.
  executeSolution() {
    // Read the initial pair of numbers from the input stream.
    const inputNumbers = dataReader.fetchIntegerArray();
    // Extract the second number, which represents the 'K' limit.
    const limitK = inputNumbers[1];
    // Read the main dataset, which is a matrix of numbers.
    const itemData = dataReader.fetchIntegerMatrix(inputNumbers[0]);
    // Initialize an array to store calculated scores, indexed by the number of distinct item types.
    const resultScores = [];

    // Sort the item data. The original sort function `e => e[1]` implicitly sorts by the second element
    // in ascending order due to JavaScript's `sort` behavior with a single-argument function.
    // We explicitly sort in ascending order by the second element, then reverse to achieve descending order.
    itemData.sort((itemA, itemB) => itemA[1] - itemB[1]).reverse();
    // Select the top 'K' items from the sorted data.
    const selectedItems = util.getFirstElements(itemData, limitK);
    // Create an object to keep track of the counts for each unique item type (first element).
    const itemCounts = {};
    // Populate the itemCounts object by iterating through the selected items.
    selectedItems.forEach(item => itemCounts[item[0]] = (itemCounts[item[0]] ? itemCounts[item[0]] + 1 : 1));
    // Determine the initial number of distinct item types.
    let distinctItemTypes = Object.keys(itemCounts).length;
    // Calculate and store the initial score, which is the sum of the second elements of selected items.
    resultScores[distinctItemTypes] = util.calculateSum(selectedItems.map(item => item[1]));

    // Initialize a min-priority queue. We will store negative values to simulate a max-heap for item values.
    const minHeap = new PriorityQueue();
    // Add items that have duplicate types (count > 1) to the priority queue.
    selectedItems.forEach(item => {
      if (itemCounts[item[0]] > 1) {
        // Insert the negative of the item's value as priority, and the item itself as the value.
        minHeap.insertElement(-item[1], item);
      }
    });

    // Initialize an index to iterate through the remaining items in the main data table.
    let currentIndex = selectedItems.length;
    // Continue processing as long as there are items in the heap and more items in the main data.
    while (minHeap.size > 0 && currentIndex < itemData.length) {
      // Extract the item with the highest value (smallest negative priority) from the heap.
      const currentItem = minHeap.extractMax();
      // Check if the extracted item still has duplicate types.
      if (itemCounts[currentItem[0]] >= 2) {
        // Loop to find a suitable replacement item from the remaining data.
        do {
          let nextItem = itemData[currentIndex];
          // If the next item introduces a new, previously unseen type.
          if (!itemCounts[nextItem[0]]) {
            // Add the new item to the heap (it might become a duplicate later).
            minHeap.insertElement(-nextItem[1], nextItem);
            // Increment the count of distinct item types.
            ++distinctItemTypes;
            // Decrement the count for the type of the item that was replaced.
            --itemCounts[currentItem[0]];
            // Calculate the new score: previous score + new item's value - replaced item's value.
            resultScores[distinctItemTypes] = resultScores[distinctItemTypes - 1] + nextItem[1] - currentItem[1];
            // A replacement was found, so break out of this inner loop.
            break;
          }
          // Move to the next item in the main data if the current one is not a suitable replacement.
          ++currentIndex;
        } while (currentIndex < itemData.length); // Continue searching if more items are available.
      }
      // If the item's count dropped below 2, it means it's no longer a duplicate,
      // and thus it's effectively removed from consideration for replacement.
      // No explicit action is needed here as it's already out of the heap.
    }

    // Calculate the final scores by adding the square of the distinct item types count to each score.
    const finalScores = resultScores.map((value, index) => value ? (value + index * index) : 0);
    // Output the maximum value found among the final scores.
    console.log(util.findMaximum(finalScores));
  }
}

class DataStreamReader {
  // Constructor initializes the reader's state and loads all input data.
  constructor() {
    this.readPointer = 0; // Pointer to keep track of the current line being read.
    this.loadAllData();   // Load all data from standard input.
  }

  // Loads all lines from standard input into an internal array.
  loadAllData() {
    this.rawDataLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.rawDataLines;
  }

  // Fetches one or more lines from the loaded data.
  fetchNextLine(lineCount) {
    if (lineCount) {
      const extractedLines = this.rawDataLines.slice(this.readPointer, this.readPointer + lineCount);
      this.readPointer += lineCount;
      return extractedLines;
    }
    // If no lineCount is specified, fetch a single line.
    return this.rawDataLines[this.readPointer++];
  }

  // Fetches a single line and splits it into an array of strings.
  fetchStringArray() {
    return this.fetchNextLine().split(' ');
  }

  // Fetches a single line, splits it, and parses each element into an integer array.
  fetchIntegerArray() {
    return this.fetchStringArray().map((element) => parseInt(element));
  }

  // Fetches multiple lines and splits each line into an array of strings, forming a matrix.
  fetchStringMatrix(lineCount) {
    return this.fetchNextLine(lineCount).map((currentLine) => currentLine.split(' '));
  }

  // Fetches multiple lines, splits each, and parses elements into an integer matrix.
  fetchIntegerMatrix(lineCount) {
    return this.fetchNextLine(lineCount).map((currentLine) => currentLine.split(' ').map((element) => parseInt(element)));
  }
}

/* A collection of general utility functions, inspired by Underscore.js. */
class UtilityFunctions {
  // Calculates the sum of all numeric elements in an array.
  calculateSum(inputArray) { return inputArray.reduce((accumulator, currentValue) => accumulator + currentValue); }
  // Finds the minimum element in an array, using an optional custom comparison function.
  findMinimum(inputArray, comparisonFunc) {
    if (comparisonFunc == null) { comparisonFunc = (valA, valB) => valA - valB; }
    return inputArray.reduce((valA, valB) => comparisonFunc(valA, valB) < 0 ? valA : valB);
  }
  // Finds the maximum element in an array, using an optional custom comparison function.
  findMaximum(inputArray, comparisonFunc) {
    if (comparisonFunc == null) { comparisonFunc = (valA, valB) => valA - valB; }
    return inputArray.reduce((valA, valB) => comparisonFunc(valA, valB) > 0 ? valA : valB);
  }

  // Generates an array of numbers within a specified range.
  generateRange(rangeStart, rangeEnd, rangeStep) {
    if (rangeEnd == null) {
      rangeEnd = rangeStart || 0;
      rangeStart = 0;
    }
    if (!rangeStep) {
      rangeStep = rangeEnd < rangeStart ? -1 : 1;
    }
    const rangeLength = Math.max(Math.ceil((rangeEnd - rangeStart) / rangeStep), 0);
    const generatedRange = Array(rangeLength);

    for (var indexCounter = 0; indexCounter < rangeLength; indexCounter++, rangeStart += rangeStep) {
      generatedRange[indexCounter] = rangeStart;
    }
    return generatedRange;
  }

  // Retrieves the first 'count' elements from an array.
  getFirstElements(targetArray, count) {
    if (targetArray == null || targetArray.length < 1) return count == null ? undefined : [];
    if (count == null) return targetArray[0];
    return this.getInitialElements(targetArray, targetArray.length - count);
  }

  // Retrieves all elements from an array except for the last 'count' elements.
  getInitialElements(targetArray, count) { return targetArray.slice.call(targetArray, 0, Math.max(0, targetArray.length - (count == null ? 1 : count))); }

  // Retrieves all elements from an array except for the first 'count' elements.
  getTailElements(inputArray, count) { return inputArray.slice.call(inputArray, count == null ? 1 : count); }

  // Retrieves the last 'count' elements from an array.
  getLastElements(targetArray, count) {
    if (count == null) return targetArray[targetArray.length - 1];
    return this.getTailElements(targetArray, Math.max(0, targetArray.length - count));
  }

  // Performs a binary search on a sorted array.
  performBinarySearch(targetArray, searchKey, iteratorKey) {
    const getIteratedValue = (currentObject) => (typeof currentObject === 'object') ? currentObject[iteratorKey] : currentObject;
    const searchValue = getIteratedValue(searchKey);
    let lowIndex = 0, highIndex = targetArray.length;
    while (lowIndex < highIndex) {
      let midIndex = Math.floor((lowIndex + highIndex) / 2);
      if (getIteratedValue(targetArray[midIndex]) < searchValue) lowIndex = midIndex + 1; else highIndex = midIndex;
    }
    return lowIndex;
  }
}
const util = new UtilityFunctions(); // Instantiate the utility class for global access.

/* A custom implementation of a binary tree-based Max-Priority Queue. */
class PriorityQueue {
  constructor() {
    this._heapElements = []; // Internal array to store the heap elements.
    this._elementCount = 0;  // Tracks the current number of elements in the heap.
  }

  /* Adds a new element to the priority queue with its associated priority and value. */
  insertElement(elementPriority, elementValue) {
    const heapArray = this._heapElements;
    // Add the new element as the last leaf.
    heapArray.push({ itemPriority: elementPriority, itemValue: elementValue });
    let currentIndex = this._elementCount;
    let parentIndex = (currentIndex - 1) >> 1; // Calculate the parent's index.
    // Perform an up-heap (swim) operation to restore the heap property.
    while (parentIndex >= 0 && heapArray[parentIndex].itemPriority < heapArray[currentIndex].itemPriority) {
      const tempStorage = heapArray[currentIndex];
      heapArray[currentIndex] = heapArray[parentIndex];
      heapArray[parentIndex] = tempStorage;
      currentIndex = parentIndex;
      parentIndex = (currentIndex - 1) >> 1;
    }
    ++this._elementCount; // Increment the total element count.
  }

  /* Removes and returns the element with the highest priority from the queue. */
  extractMax() {
    if (this.size <= 0) {
      return null; // Return null if the heap is empty.
    }
    const currentLength = this._elementCount - 1;
    const heapArray = this._heapElements;
    const _topValue = this.peekMax; // Store the value of the root element before removal.
    // Move the last element to the root position.
    heapArray[0] = heapArray[currentLength];
    heapArray.pop(); // Remove the now-duplicated last element.
    let currentIndex = 0;
    let childOneIndex = (currentIndex << 1) + 1; // Index of the left child.
    let childTwoIndex = (currentIndex << 1) + 2; // Index of the right child.
    // Perform a down-heap (sink) operation to restore the heap property.
    let priorityZero, priorityOne, priorityTwo;
    while (childOneIndex < currentLength) {
      if (childTwoIndex < currentLength) {
        // Both children exist.
        priorityZero = heapArray[currentIndex].itemPriority;
        priorityOne = heapArray[childOneIndex].itemPriority;
        priorityTwo = heapArray[childTwoIndex].itemPriority;
        if ((priorityOne < priorityTwo) && (priorityZero < priorityTwo)) {
          // If the right child has a higher priority than the left, AND the right child's priority
          // is also higher than the parent's, swap the parent with the right child.
          const tempStorage = heapArray[currentIndex];
          heapArray[currentIndex] = heapArray[childTwoIndex];
          heapArray[childTwoIndex] = tempStorage;
          currentIndex = childTwoIndex;
        } else {
          // Otherwise (if the above condition is false), unconditionally swap the parent with the left child.
          // This replicates the original's specific down-heap logic.
          const tempStorage = heapArray[currentIndex];
          heapArray[currentIndex] = heapArray[childOneIndex];
          heapArray[childOneIndex] = tempStorage;
          currentIndex = childOneIndex;
        }
        // Recalculate child indices for the next iteration of the loop.
        childOneIndex = (currentIndex << 1) + 1;
        childTwoIndex = (currentIndex << 1) + 2;
      } else {
        // Only the left child exists.
        priorityZero = heapArray[currentIndex].itemPriority;
        priorityOne = heapArray[childOneIndex].itemPriority;
        if (priorityZero < priorityOne) {
          // If the left child has a higher priority than the parent, swap them.
          const tempStorage = heapArray[currentIndex];
          heapArray[currentIndex] = heapArray[childOneIndex];
          heapArray[childOneIndex] = tempStorage;
        }
        break; // No more children to compare with, so the down-heap is complete.
      }
    }

    this._elementCount = currentLength; // Update the total element count.
    return _topValue; // Return the value of the element that was extracted.
  }

  /* Getter property to retrieve the value of the element with the highest priority without removing it. */
  get peekMax() {
    // Returns the 'itemValue' part of the root element.
    return this._heapElements[0].itemValue;
  }

  /* Getter property to retrieve the current number of elements in the priority queue. */
  get size() {
    return this._elementCount;
  }
}

// Instantiate the data reader to handle input.
const dataReader = new DataStreamReader();
// Create an instance of the main solution processor and execute its solution method.
(new SolutionProcessor()).executeSolution();
