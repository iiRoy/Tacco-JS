'use strict'

// Core logic orchestrator for processing input data and calculating results.
class SolutionProcessor {
  // Initiates the data processing pipeline.
  async executeProcessing() {
    // Retrieve initial configuration parameters from the data source.
    const setupValues = dataFetcher.getParsedIntegerArray();
    const selectionCount = setupValues[1]; // The 'k' value from original code
    const allDataEntries = dataFetcher.getIntegerMatrix(setupValues[0]); // The 'table' from original code

    // A map to store calculated scores, indexed by the number of distinct categories.
    // Using an object as a sparse array for simplicity, could also be a Map.
    const calculatedScores = {};

    // Sort entries in descending order based on their second element (value).
    // This combines the original sort and reverse operations.
    allDataEntries.sort((itemA, itemB) => itemB[1] - itemA[1]);

    // Select the top 'k' entries initially.
    const initialSelections = utils.fetchFirstElements(allDataEntries, selectionCount);

    // Track counts of each category ID for the initial selections.
    // Using a Map for better key handling and performance than a plain object.
    const categoryTallies = new Map();
    initialSelections.forEach(entry => {
      const categoryIdentifier = entry[0];
      categoryTallies.set(categoryIdentifier, (categoryTallies.get(categoryIdentifier) || 0) + 1);
    });

    // Determine the number of unique categories present in the initial selections.
    let currentDistinctCategoryCount = categoryTallies.size;
    // Calculate the sum of values for these initial selections.
    let currentOverallScore = initialSelections.reduce((acc, entry) => acc + entry[1], 0);
    // Store this initial score in our results map.
    calculatedScores[currentDistinctCategoryCount] = currentOverallScore;

    // Initialize a max priority queue to manage redundant items.
    // Items with higher values (lower negative priority) will be popped first.
    const surplusItemQueue = new MaxPriorityQueue();
    initialSelections.forEach(entryItem => {
      const categoryId = entryItem[0];
      // If a category appears more than once, its items are candidates for replacement.
      if (categoryTallies.get(categoryId) > 1) {
        // Store negative value to make it a max-heap by value.
        surplusItemQueue.offerElement(-entryItem[1], entryItem);
      }
    });

    // Cursor for iterating through the remaining data entries.
    let currentDataPointer = initialSelections.length;

    // Iterate while there are redundant items to potentially replace and more data to consider.
    while (surplusItemQueue.getSize() > 0 && currentDataPointer < allDataEntries.length) {
      const itemToBeReplaced = surplusItemQueue.pollMaxElement(); // Get the item with the highest value (lowest negative priority)
      const targetCategoryId = itemToBeReplaced[0];

      // Only proceed if the category of the item to be replaced still has duplicates.
      if (categoryTallies.get(targetCategoryId) >= 2) {
        let replacementFound = false;
        // Search for a suitable replacement from the remaining data entries.
        while (currentDataPointer < allDataEntries.length && !replacementFound) {
          const prospectiveReplacement = allDataEntries[currentDataPointer];
          const replacementCategoryId = prospectiveReplacement[0];

          // A suitable replacement is an item whose category is NOT already in our current set of categories.
          if (!categoryTallies.has(replacementCategoryId)) {
            // Found a unique category replacement.
            surplusItemQueue.offerElement(-prospectiveReplacement[1], prospectiveReplacement); // Add new item to queue (its category might become duplicated later)

            currentDistinctCategoryCount++; // Increment distinct category count
            categoryTallies.set(replacementCategoryId, 1); // Add new category to tallies
            categoryTallies.set(targetCategoryId, categoryTallies.get(targetCategoryId) - 1); // Decrement count for the category of the item that was replaced

            // Update the overall score.
            currentOverallScore += prospectiveReplacement[1] - itemToBeReplaced[1];
            calculatedScores[currentDistinctCategoryCount] = currentOverallScore;

            replacementFound = true; // Mark as found to exit inner loop.
          }
          currentDataPointer++; // Move to the next potential replacement.
        }
      }
      // If the category of itemToBeReplaced no longer has >=2 occurrences,
      // it means it became unique through other replacements or was the last duplicate.
      // We simply discard it from consideration if replacementFound was false.
    }

    // Transform the calculated scores into their final evaluation values.
    // This involves iterating through the sparse `calculatedScores` object.
    const finalResultValues = [];
    for (const distinctCountKey in calculatedScores) {
        if (Object.prototype.hasOwnProperty.call(calculatedScores, distinctCountKey)) {
            const numDistinct = parseInt(distinctCountKey, 10);
            const baseScore = calculatedScores[distinctCountKey];
            finalResultValues.push(baseScore + numDistinct * numDistinct);
        }
    }

    // Output the maximum of the final evaluated scores.
    console.log(utils.findMaxElement(finalResultValues));
  }
}

// Utility for fetching and parsing input data from standard input.
class SourceReader {
  constructor() {
    this.readPointer = 0; // Current line index to read from.
    this.bufferedLines = []; // Stores all lines read from input.
    this.loadSourceData(); // Immediately loads all data upon instantiation.
  }

  // Reads all data from stdin and splits it into an array of lines.
  loadSourceData() {
    this.bufferedLines = require("fs").readFileSync("/dev/stdin", "utf8").split('\n');
  }

  // Retrieves a specified number of lines or a single line.
  // @param {number} [lineCount] - The number of lines to retrieve. If undefined, retrieves one line.
  // @returns {string|string[]} - A single line string or an array of lines.
  retrieveLines(lineCount) {
    if (lineCount) {
      const retrievedBlock = this.bufferedLines.slice(this.readPointer, this.readPointer + lineCount);
      this.readPointer += lineCount;
      return retrievedBlock;
    }
    // If no count specified, return the current line and advance the pointer.
    return this.bufferedLines[this.readPointer++];
  }

  // Parses a single line into an array of strings, splitting by space.
  // @returns {string[]}
  getParsedStringArray() {
    return this.retrieveLines().split(' ');
  }

  // Parses a single line into an array of integers.
  // @returns {number[]}
  getParsedIntegerArray() {
    return this.getParsedStringArray().map(str => parseInt(str, 10));
  }

  // Retrieves multiple lines and parses each into an array of strings.
  // @param {number} rows - The number of rows (lines) to retrieve.
  // @returns {string[][]}
  getStringMatrix(rows) {
    return this.retrieveLines(rows).map(line => line.split(' '));
  }

  // Retrieves multiple lines and parses each into an array of integers.
  // @param {number} rows - The number of rows (lines) to retrieve.
  // @returns {number[][]}
  getIntegerMatrix(rows) {
    return this.retrieveLines(rows).map(line => line.split(' ').map(str => parseInt(str, 10)));
  }
}

// A collection of general-purpose utility methods, inspired by Underscore.js.
class CollectionUtils {
  // Calculates the sum of all numbers in an array.
  // @param {number[]} numericArray - The array of numbers.
  // @returns {number} The sum.
  calculateSumOfElements(numericArray) {
    return numericArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  }

  // Finds the minimum element in an array, optionally using a custom comparison function.
  // @param {Array} collection - The array to search.
  // @param {Function} [comparator] - Optional function `(a, b)` returning <0 if a<b, >0 if a>b, 0 if a==b.
  // @returns {*} The minimum element.
  findMinElement(collection, comparator) {
    const compareFn = comparator || ((a, b) => a - b);
    if (!collection || collection.length === 0) return undefined;
    return collection.reduce((currentMin, item) => compareFn(currentMin, item) < 0 ? currentMin : item);
  }

  // Finds the maximum element in an array, optionally using a custom comparison function.
  // @param {Array} collection - The array to search.
  // @param {Function} [comparator] - Optional function `(a, b)` returning <0 if a<b, >0 if a>b, 0 if a==b.
  // @returns {*} The maximum element.
  findMaxElement(collection, comparator) {
    const compareFn = comparator || ((a, b) => a - b);
    if (!collection || collection.length === 0) return undefined;
    return collection.reduce((currentMax, item) => compareFn(currentMax, item) > 0 ? currentMax : item);
  }

  // Generates a sequence of numbers.
  // @param {number} start - The starting value.
  // @param {number} [stop] - The stopping value (exclusive). If omitted, `start` becomes `stop` and `start` is 0.
  // @param {number} [step=1] - The increment or decrement step.
  // @returns {number[]} An array of numbers.
  createNumberSequence(start, stop, step) {
    let currentStart = start;
    let currentStop = stop;
    if (currentStop == null) {
      currentStop = currentStart || 0;
      currentStart = 0;
    }
    let currentStep = step;
    if (!currentStep) {
      currentStep = currentStop < currentStart ? -1 : 1;
    }
    const sequenceLength = Math.max(Math.ceil((currentStop - currentStart) / currentStep), 0);
    const resultSequence = Array(sequenceLength);

    for (let index = 0; index < sequenceLength; index++, currentStart += currentStep) {
      resultSequence[index] = currentStart;
    }
    return resultSequence;
  }

  // Retrieves the first 'n' elements of an array.
  // @param {Array} sourceArray - The array to extract from.
  // @param {number} [count] - The number of elements to retrieve. If undefined, returns the first element.
  // @returns {*|Array} The first element or an array of elements.
  fetchFirstElements(sourceArray, count) {
    if (!sourceArray || sourceArray.length === 0) return count == null ? undefined : [];
    if (count == null) return sourceArray[0];
    return this.getLeadingElements(sourceArray, sourceArray.length - count); // Re-uses initial logic
  }

  // Retrieves all elements except the last 'n' elements of an array.
  // @param {Array} sourceArray - The array to extract from.
  // @param {number} [count=1] - The number of elements to exclude from the end.
  // @returns {Array} An array of leading elements.
  getLeadingElements(sourceArray, count) {
    const numToExclude = count == null ? 1 : count;
    return sourceArray.slice(0, Math.max(0, sourceArray.length - numToExclude));
  }

  // Retrieves all elements except the first 'n' elements of an array.
  // @param {Array} sourceArray - The array to extract from.
  // @param {number} [count=1] - The number of elements to exclude from the beginning.
  // @returns {Array} An array of trailing elements.
  getTrailingElements(sourceArray, count) {
    const numToExclude = count == null ? 1 : count;
    return sourceArray.slice(numToExclude);
  }

  // Retrieves the last 'n' elements of an array.
  // @param {Array} sourceArray - The array to extract from.
  // @param {number} [count] - The number of elements to retrieve. If undefined, returns the last element.
  // @returns {*|Array} The last element or an array of elements.
  fetchLastElements(sourceArray, count) {
    if (!sourceArray || sourceArray.length === 0) return count == null ? undefined : [];
    if (count == null) return sourceArray[sourceArray.length - 1];
    return this.getTrailingElements(sourceArray, Math.max(0, sourceArray.length - count));
  }

  // Performs a binary search on a sorted array.
  // @param {Array} sortedArray - The array to search in.
  // @param {*} searchKey - The value to search for.
  // @param {string|Function} [accessor] - A property name string or a function to extract the comparable value from array elements.
  // @returns {number} The index where the key should be inserted to maintain order, or its current index if found.
  locateInSortedArray(sortedArray, searchKey, accessor) {
    const getValue = (obj) => {
      if (typeof accessor === 'function') return accessor(obj);
      if (typeof obj === 'object' && accessor) return obj[accessor];
      return obj;
    };
    const keyToCompare = getValue(searchKey);

    let lowBoundary = 0;
    let highBoundary = sortedArray.length;
    while (lowBoundary < highBoundary) {
      const midPoint = Math.floor((lowBoundary + highBoundary) / 2);
      if (getValue(sortedArray[midPoint]) < keyToCompare) {
        lowBoundary = midPoint + 1;
      } else {
        highBoundary = midPoint;
      }
    }
    return lowBoundary;
  }
}
const utils = new CollectionUtils(); // Instantiate the utility collection.

// Implements a max-heap (priority queue) data structure.
// Elements are stored as { priority: number, value: any }.
// Higher priority means higher value (for max-heap).
class MaxPriorityQueue {
  constructor() {
    this.heapStorage = []; // Underlying array to store heap elements.
    this.currentSize = 0; // Number of elements currently in the heap.
  }

  // Helper function to swap two elements in the heap array.
  _swap(idx1, idx2) {
    [this.heapStorage[idx1], this.heapStorage[idx2]] = [this.heapStorage[idx2], this.heapStorage[idx1]];
  }

  // Adds a new element with a given priority and value to the heap.
  // @param {number} elementPriority - The priority of the element.
  // @param {*} elementValue - The actual value of the element.
  offerElement(elementPriority, elementValue) {
    this.heapStorage.push({ priority: elementPriority, value: elementValue });
    let currentIndex = this.currentSize;
    let parentIndex = Math.floor((currentIndex - 1) / 2); // Calculate parent index.

    // Perform up-heap (swim) operation: move the element up until heap property is restored.
    while (currentIndex > 0 && this.heapStorage[parentIndex].priority < this.heapStorage[currentIndex].priority) {
      this._swap(currentIndex, parentIndex);
      currentIndex = parentIndex;
      parentIndex = Math.floor((currentIndex - 1) / 2);
    }
    this.currentSize++;
  }

  // Removes and returns the element with the highest priority (the root).
  // @returns {*} The value of the highest priority element, or null if the heap is empty.
  pollMaxElement() {
    if (this.currentSize === 0) {
      return null;
    }
    const maxElementValue = this.heapStorage[0].value;
    const lastElement = this.heapStorage.pop();
    this.currentSize--;

    if (this.currentSize > 0) { // If heap is not empty after pop
      this.heapStorage[0] = lastElement;
      let currentIndex = 0;

      // Perform down-heap (sink) operation: move the element down until heap property is restored.
      while (true) {
        const leftChildIndex = 2 * currentIndex + 1;
        const rightChildIndex = 2 * currentIndex + 2;
        let largestPriorityIndex = currentIndex;

        // Check if left child has higher priority.
        if (leftChildIndex < this.currentSize && this.heapStorage[leftChildIndex].priority > this.heapStorage[largestPriorityIndex].priority) {
          largestPriorityIndex = leftChildIndex;
        }

        // Check if right child has higher priority than current largest.
        if (rightChildIndex < this.currentSize && this.heapStorage[rightChildIndex].priority > this.heapStorage[largestPriorityIndex].priority) {
          largestPriorityIndex = rightChildIndex;
        }

        // If the largest priority is not at the current index, swap and continue sinking.
        if (largestPriorityIndex !== currentIndex) {
          this._swap(currentIndex, largestPriorityIndex);
          currentIndex = largestPriorityIndex;
        } else {
          break; // Heap property restored.
        }
      }
    }
    return maxElementValue;
  }

  // Returns the value of the highest priority element without removing it.
  // @returns {*} The value of the highest priority element, or undefined if empty.
  peekMaxElement() {
    if (this.currentSize === 0) {
      return undefined;
    }
    return this.heapStorage[0].value;
  }

  // Returns the number of elements in the heap.
  // @returns {number} The size of the heap.
  getSize() {
    return this.currentSize;
  }
}

// Global instantiation of data fetcher and execution of the solution.
const dataFetcher = new SourceReader();
(new SolutionProcessor()).executeProcessing();