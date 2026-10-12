'use strict'; // Maintain strict mode declaration

class Processor { // Renamed Main to Processor
  execute() { // Renamed solve to execute
    // Read the initial numbers from input: N (number of items) and K (limit for selected items)
    const inputNumbers = dataInput.fetchIntegerArray();
    const limitK = inputNumbers[1]; // The K value
    // Read N lines of item data, each with a category and a value
    const itemData = dataInput.fetchIntegerMatrix(inputNumbers[0]);
    const calculatedScores = []; // Array to store scores based on distinct categories

    // Sort the item data by value in descending order
    itemData.sort(itemEntry => itemEntry[1]).reverse();

    // Select the top K items after sorting
    const selectedItems = _util.getFirstElements(itemData, limitK);
    const categoryCounts = {}; // Object to track counts of each category

    // Populate categoryCounts for the initially selected K items
    selectedItems.forEach(itemEntry => {
      categoryCounts[itemEntry[0]] = (categoryCounts[itemEntry[0]] ? categoryCounts[itemEntry[0]] + 1 : 1);
    });

    // Determine the initial number of distinct categories
    let distinctCategories = Object.keys(categoryCounts).length;
    // Calculate the initial score: sum of values of selected items
    calculatedScores[distinctCategories] = _util.calculateSum(selectedItems.map(itemEntry => itemEntry[1]));

    const priorityQueue = new MaxPriorityQueue(); // Initialize a max-priority queue
    // Add items that have duplicate categories to the priority queue
    selectedItems.forEach(itemEntry => {
      if (categoryCounts[itemEntry[0]] > 1) {
        priorityQueue.insertElement(itemEntry[1], itemEntry); // Priority is the item's value
      }
    });

    let currentIndex = selectedItems.length; // Pointer for iterating through the remaining itemData
    // Loop to optimize distinct categories by replacing duplicate items
    while (priorityQueue.size > 0 && currentIndex < itemData.length) {
      const removedItem = priorityQueue.extractMax(); // Get the item with the highest value from duplicates
      // Check if the removed item's category still has duplicates
      if (categoryCounts[removedItem[0]] >= 2) {
        --categoryCounts[removedItem[0]]; // Decrement count for the category of the removed item
        // Search for a new item from the remaining `itemData` to replace the removed one
        do {
          let nextItem = itemData[currentIndex];
          ++currentIndex; // Advance the pointer
          // If the new item's category is not yet present in our selection
          if (!categoryCounts[nextItem[0]]) {
            categoryCounts[nextItem[0]] = 1; // Add this new category
            priorityQueue.insertElement(nextItem[1], nextItem); // Add the new item to the priority queue
            ++distinctCategories; // Increment the count of distinct categories
            // Update the score for the new distinct category count
            calculatedScores[distinctCategories] = calculatedScores[distinctCategories - 1] + nextItem[1] - removedItem[1];
            break; // Found a suitable replacement, exit inner loop
          }
        } while (currentIndex < itemData.length); // Continue searching if more items are available
      }
    }

    // Final score calculation: add the square of the distinct category count to each score
    const finalScores = calculatedScores.map((scoreValue, categoryIndex) => scoreValue ? (scoreValue + categoryIndex * categoryIndex) : 0);
    // Output the maximum final score
    console.log(_util.findMaximum(finalScores));
  }
}

class DataReader { // Renamed Input to DataReader
  constructor() {
    this.readPointer = 0; // Renamed cursor to readPointer
    this.loadAllInput(); // Renamed inputAll to loadAllInput
  }

  loadAllInput() { // Renamed inputAll to loadAllInput
    // Reads all input from stdin and splits it into lines
    this.inputLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n'); // Renamed data to inputLines
    return this.inputLines;
  }

  fetchNextLines(lineCount) { // Renamed nextLine to fetchNextLines, n to lineCount
    // Fetches 'lineCount' number of lines or a single line if 'lineCount' is not provided
    if (lineCount) {
      const retrievedLines = this.inputLines.slice(this.readPointer, this.readPointer + lineCount);
      this.readPointer += lineCount;
      return retrievedLines;
    }
    return this.inputLines[this.readPointer++];
  }

  fetchStringArray() { // Renamed nextStrArr to fetchStringArray
    // Reads the next line and splits it into an array of strings
    return this.fetchNextLines().split(' ');
  }

  fetchIntegerArray() { // Renamed nextIntArr to fetchIntegerArray
    // Reads the next line, splits it, and converts elements to integers
    return this.fetchStringArray().map((element) => parseInt(element));
  }

  fetchStringMatrix(rowCount) { // Renamed nextStrRange to fetchStringMatrix, n to rowCount
    // Reads 'rowCount' lines and splits each into an array of strings
    return this.fetchNextLines(rowCount).map((lineEntry) => lineEntry.split(' '));
  }

  fetchIntegerMatrix(rowCount) { // Renamed nextIntRange to fetchIntegerMatrix, n to rowCount
    // Reads 'rowCount' lines, splits each, and converts elements to integers
    return this.fetchNextLines(rowCount).map((lineEntry) => lineEntry.split(' ').map((element) => parseInt(element)));
  }
}

/* Collection of utility functions, inspired by Underscore.js */
class UtilityFunctions { // Renamed Underscore to UtilityFunctions
  // Calculates the sum of all numbers in an array
  calculateSum(numberArray) { return numberArray.reduce((accumulator, currentValue) => accumulator + currentValue); }
  // Finds the minimum element in an array using an optional comparison function
  findMinimum(numberArray, comparisonFunc) {
    if (comparisonFunc == null) { comparisonFunc = (valA, valB) => valA - valB; }
    return numberArray.reduce((currentMin, nextValue) => comparisonFunc(currentMin, nextValue) < 0 ? currentMin : nextValue);
  }
  // Finds the maximum element in an array using an optional comparison function
  findMaximum(numberArray, comparisonFunc) {
    if (comparisonFunc == null) { comparisonFunc = (valA, valB) => valA - valB; }
    return numberArray.reduce((currentMax, nextValue) => comparisonFunc(currentMax, nextValue) > 0 ? currentMax : nextValue);
  }

  // Generates an array of numbers within a specified range
  generateRange(rangeStart, rangeEnd, rangeStep) {
    if (rangeEnd == null) {
      rangeEnd = rangeStart || 0;
      rangeStart = 0;
    }
    if (!rangeStep) {
      rangeStep = rangeEnd < rangeStart ? -1 : 1;
    }
    const arrayLength = Math.max(Math.ceil((rangeEnd - rangeStart) / rangeStep), 0);
    const generatedRange = Array(arrayLength);

    for (var indexCounter = 0; indexCounter < arrayLength; indexCounter++, rangeStart += rangeStep) {
      generatedRange[indexCounter] = rangeStart;
    }
    return generatedRange;
  }

  // Retrieves the first 'count' elements from an array
  getFirstElements(inputArray, count) {
    if (inputArray == null || inputArray.length < 1) return count == null ? void 0 : [];
    if (count == null) return inputArray[0];
    return this.getInitialElements(inputArray, inputArray.length - count);
  }

  // Retrieves all elements except the last 'count' elements from an array
  getInitialElements(inputArray, count) { return inputArray.slice.call(inputArray, 0, Math.max(0, inputArray.length - (count == null ? 1 : count))); }

  // Retrieves all elements except the first 'count' elements from an array
  getTailElements(inputArray, count) { return inputArray.slice.call(inputArray, count == null ? 1 : count); }

  // Retrieves the last 'count' elements from an array
  getLastElements(inputArray, count) {
    if (count == null) return inputArray[inputArray.length - 1];
    return this.getTailElements(inputArray, Math.max(0, inputArray.length - count));
  }

  // Performs a binary search on a sorted array
  performBinarySearch(inputArray, searchKey, iteratorFunction) {
    const valueExtractor = (currentObject) => (typeof currentObject === 'object') ? currentObject[iteratorFunction] : currentObject;
    const targetValue = valueExtractor(searchKey);
    let lowerBound = 0, upperBound = inputArray.length;
    while (lowerBound < upperBound) {
      let middleIndex = Math.floor((lowerBound + upperBound) / 2);
      if (valueExtractor(inputArray[middleIndex]) < targetValue) lowerBound = middleIndex + 1; else upperBound = middleIndex;
    }
    return lowerBound;
  }
}
const _util = new UtilityFunctions(); // Global instance of utility functions

/* Max-Heap implementation using a binary tree structure */
class MaxPriorityQueue { // Renamed BinaryHeap to MaxPriorityQueue
  constructor() {
    this._heapElements = []; // Renamed _data to _heapElements
    this._elementCount = 0; // Renamed _length to _elementCount
  }

  /* Adds an element to the priority queue based on its priority and value */
  insertElement(elementPriority, elementValue) { // Renamed push to insertElement
    const heapData = this._heapElements;
    heapData.push({ priorityVal: elementPriority, actualVal: elementValue }); // Renamed p to priorityVal, v to actualVal
    let currentIndex = this._elementCount;
    let parentIndex = (currentIndex - 1) >> 1; // Calculate parent index
    // Up-heap operation: move element up to maintain heap property
    while (parentIndex >= 0 && heapData[parentIndex].priorityVal < heapData[currentIndex].priorityVal) {
      const tempHolder = heapData[currentIndex]; heapData[currentIndex] = heapData[parentIndex]; heapData[parentIndex] = tempHolder;
      currentIndex = parentIndex;
      parentIndex = (currentIndex - 1) >> 1;
    }
    ++this._elementCount;
  }

  /* Extracts and returns the element with the highest priority */
  extractMax() { // Renamed pop to extractMax
    if (this.size <= 0) {
      return null;
    }
    const currentLength = this._elementCount - 1;
    const heapData = this._heapElements;
    const _maxValue = this.peekMax; // Store the value of the element to be returned
    heapData[0] = heapData[currentLength]; // Move the last element to the root
    heapData.pop(); // Remove the last element (which was moved to root)
    let currentIndex = 0;
    let leftChildIndex = (currentIndex << 1) + 1;
    let rightChildIndex = (currentIndex << 1) + 2;
    // Down-heap operation: move element down to maintain heap property
    let parentPriority, child1Priority, child2Priority;
    while (leftChildIndex < currentLength) {
      if (rightChildIndex < currentLength) {
        // Both children exist
        parentPriority = heapData[currentIndex].priorityVal;
        child1Priority = heapData[leftChildIndex].priorityVal;
        child2Priority = heapData[rightChildIndex].priorityVal;

        // Original logic: If right child is strictly greater than left, AND right child is strictly greater than parent
        if ((child1Priority < child2Priority) && (parentPriority < child2Priority)) {
          // Swap parent with right child
          const tempHolder = heapData[currentIndex]; heapData[currentIndex] = heapData[rightChildIndex]; heapData[rightChildIndex] = tempHolder;
          currentIndex = rightChildIndex;
        }
        else {
          // Otherwise (if right child is not strictly greater than left, OR right child is not strictly greater than parent),
          // the original code always swaps with the left child.
          const tempHolder = heapData[currentIndex]; heapData[currentIndex] = heapData[leftChildIndex]; heapData[leftChildIndex] = tempHolder;
          currentIndex = leftChildIndex;
        }
        leftChildIndex = (currentIndex << 1) + 1;
        rightChildIndex = (currentIndex << 1) + 2;
      }
      else {
        // Only left child exists (right child does not)
        parentPriority = heapData[currentIndex].priorityVal;
        child1Priority = heapData[leftChildIndex].priorityVal;
        if (parentPriority < child1Priority) {
          // Swap parent with left child if parent is smaller
          const tempHolder = heapData[currentIndex]; heapData[currentIndex] = heapData[leftChildIndex]; heapData[leftChildIndex] = tempHolder;
        }
        break; // Heap property satisfied or no more children to compare
      }
    }

    this._elementCount = currentLength; // Update element count
    return _maxValue;
  }

  /* Returns the element with the highest priority without removing it */
  get peekMax() { // Renamed top to peekMax
    return this._heapElements[0].actualVal;
  }

  /* Returns the number of elements currently in the priority queue */
  get size() { // Renamed length to size
    return this._elementCount;
  }
}

const dataInput = new DataReader(); // Global instance of DataReader
(new Processor()).execute(); // Create and execute the main processor
