"use strict";

class Processor {
  // Main processing logic for the task
  processTask() {
    // Retrieve initial configuration values from the data source
    const configValues = dataSource.retrieveIntegerArray();
    // The second value in the configuration array represents the selection limit
    const selectionLimit = configValues[1];
    // Fetch a matrix of integer records based on the first configuration value
    const dataRecords = dataSource.retrieveIntegerMatrix(configValues[0]);
    // Initialize an array to store calculated evaluation scores
    const evaluationResults = [];

    // Sort the data records: first by the second element (value), then reverse to get descending order
    dataRecords.sort(itemEntry => itemEntry[1]).reverse();
    // Select the top 'selectionLimit' elements from the sorted records
    const chosenItems = globalUtil.getFirstElements(dataRecords, selectionLimit);
    // Object to count occurrences of each category (first element of an item)
    const categoryTallies = {};
    // Populate categoryTallies based on chosen items
    chosenItems.forEach(itemEntry => {
      categoryTallies[itemEntry[0]] = (categoryTallies[itemEntry[0]] ? categoryTallies[itemEntry[0]] + 1 : 1);
    });
    // Determine the number of unique categories currently selected
    let distinctCategoryCount = Object.keys(categoryTallies).length;
    // Calculate the initial score based on the sum of values of chosen items
    evaluationResults[distinctCategoryCount] = globalUtil.calculateTotal(chosenItems.map(item => item[1]));

    // Initialize a max-priority queue for managing replaceable items
    const maxQueue = new MaxPriorityQueue();
    // Add items to the priority queue if they have duplicate categories
    chosenItems.forEach(itemEntry => {
      if (categoryTallies[itemEntry[0]] > 1) {
        // Insert with negative value to simulate a min-heap for smallest values, but still a max-heap overall
        maxQueue.insert(-itemEntry[1], itemEntry);
      }
    });

    // Initialize an index to track progress through the full list of data records
    let currentDataIndex = chosenItems.length;
    // Continue processing as long as there are items in the queue and unexamined records
    while (maxQueue.getCurrentElementCount() > 0 && currentDataIndex < dataRecords.length) {
      // Extract the item with the highest priority (smallest negative value, thus largest original value)
      const currentCandidate = maxQueue.extractMax();
      // Check if the extracted item's category has duplicates (is replaceable)
      if (categoryTallies[currentCandidate[0]] >= 2) {
        // Look for a suitable replacement from the remaining data records
        do {
          let nextAvailable = dataRecords[currentDataIndex];
          // If the next available item introduces a new category
          if (!categoryTallies[nextAvailable[0]]) {
            maxQueue.insert(-nextAvailable[1], nextAvailable); // Add the new item to the queue
            ++distinctCategoryCount; // Increment distinct category count
            --categoryTallies[currentCandidate[0]]; // Decrement count for the replaced item's category
            // Update the score for the new distinct category count
            evaluationResults[distinctCategoryCount] = evaluationResults[distinctCategoryCount - 1] + nextAvailable[1] - currentCandidate[1];
            break; // Replacement found, exit inner loop
          }
          ++currentDataIndex; // Move to the next data record
        } while(currentDataIndex < dataRecords.length); // Continue while there are records to check
      }
      else {
        // This item's category count is 1, so it cannot be replaced to increase distinct categories.
        // It is effectively discarded from consideration for replacement.
      }
    }

    // Calculate the final evaluation scores by applying the specific formula (score + index*index)
    const finalEvaluations = evaluationResults.map((valueElement, indexPosition) =>
      valueElement ? (valueElement + indexPosition * indexPosition) : 0
    );
    // Output the maximum calculated evaluation score
    console.log(globalUtil.findMaximum(finalEvaluations));
  }
}

class DataSource {
  /**
   * Initializes the data source by setting the starting position and loading all input.
   * @constructor
   */
  constructor() {
    this.currentPosition = 0; // Tracks the current line being read
    this.loadAllInputData(); // Loads all data from stdin
  }

  /**
   * Reads all input data from the standard input stream.
   * Each line is stored as an element in an array.
   * @returns {string[]} An array where each element is a line from the input.
   */
  loadAllInputData() {
    this.sourceLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.sourceLines;
  }

  /**
   * Fetches one or more lines from the input data.
   * @param {number} [numberOfLines] - The count of lines to retrieve. If omitted, one line is returned.
   * @returns {string|string[]} A single line string or an array of line strings.
   */
  fetchNextLine(numberOfLines) {
    if (numberOfLines) {
      const retrievedLines = this.sourceLines.slice(this.currentPosition, this.currentPosition + numberOfLines);
      this.currentPosition += numberOfLines;
      return retrievedLines;
    }
    // Increment position after retrieving a single line
    return this.sourceLines[this.currentPosition++];
  }

  /**
   * Retrieves the next input line and splits it into an array of strings by space.
   * @returns {string[]} An array of string tokens from the line.
   */
  fetchStringArray() {
    return this.fetchNextLine().split(' ');
  }

  /**
   * Retrieves the next input line, splits it by space, and converts each token to an integer.
   * @returns {number[]} An array of integers from the line.
   */
  retrieveIntegerArray() {
    return this.fetchStringArray().map((strVal) => parseInt(strVal));
  }

  /**
   * Fetches a specified number of lines and splits each into an array of strings.
   * @param {number} lineCount - The quantity of lines to retrieve.
   * @returns {string[][]} A 2D array of strings.
   */
  fetchStringMatrix(lineCount) {
    return this.fetchNextLine(lineCount).map((currentLine) => currentLine.split(' '));
  }

  /**
   * Fetches a specified number of lines, splits each by space, and converts tokens to integers.
   * @param {number} lineCount - The quantity of lines to retrieve.
   * @returns {number[][]} A 2D array of integers.
   */
  retrieveIntegerMatrix(lineCount) {
    return this.fetchNextLine(lineCount).map((currentLine) => currentLine.split(' ').map((numStr) => parseInt(numStr)));
  }
}

/* A collection of general-purpose utility methods. */
class UtilityToolkit {
  /**
   * Computes the sum of all numerical elements within an array.
   * @param {number[]} numberCollection - The array containing numbers.
   * @returns {number} The aggregate sum of the numbers.
   */
  calculateTotal(numberCollection) { return numberCollection.reduce((accumulatedValue, currentElement) => accumulatedValue + currentElement); }

  /**
   * Identifies the minimum element in a collection.
   * @param {Array} itemCollection - The array to examine.
   * @param {Function} [comparisonFunction] - An optional function to compare two elements.
   * @returns {*} The smallest element found.
   */
  findMinimum(itemCollection, comparisonFunction) {
    if (comparisonFunction == null) { comparisonFunction = (valueA, valueB) => valueA - valueB; }
    return itemCollection.reduce((smallestSoFar, currentItem) => comparisonFunction(smallestSoFar, currentItem) < 0 ? smallestSoFar : currentItem);
  }

  /**
   * Identifies the maximum element in a collection.
   * @param {Array} itemCollection - The array to examine.
   * @param {Function} [comparisonFunction] - An optional function to compare two elements.
   * @returns {*} The largest element found.
   */
  findMaximum(itemCollection, comparisonFunction) {
    if (comparisonFunction == null) { comparisonFunction = (valueA, valueB) => valueA - valueB; }
    return itemCollection.reduce((largestSoFar, currentItem) => comparisonFunction(largestSoFar, currentItem) > 0 ? largestSoFar : currentItem);
  }

  /**
   * Generates a numerical sequence within a specified range.
   * @param {number} [startValue] - The initial value of the sequence.
   * @param {number} [stopValue] - The value at which the sequence terminates (exclusive).
   * @param {number} [stepAmount] - The increment or decrement step between numbers.
   * @returns {number[]} An array representing the generated numerical sequence.
   */
  generateSequence(startValue, stopValue, stepAmount) {
    if (stopValue == null) {
      stopValue = startValue || 0;
      startValue = 0;
    }
    if (!stepAmount) {
      stepAmount = stopValue < startValue ? -1 : 1;
    }
    const sequenceLength = Math.max(Math.ceil((stopValue - startValue) / stepAmount), 0);
    const numberSequence = Array(sequenceLength);

    for (let indexCounter = 0; indexCounter < sequenceLength; indexCounter++, startValue += stepAmount) {
      numberSequence[indexCounter] = startValue;
    }
    return numberSequence;
  }

  /**
   * Retrieves the initial elements from an array.
   * @param {Array} sourceCollection - The array from which to extract elements.
   * @param {number} [itemCount] - The number of elements to retrieve from the beginning.
   * @returns {*|*[]} The first element if `itemCount` is null, otherwise an array of initial elements.
   */
  getFirstElements(sourceCollection, itemCount) {
    if (sourceCollection == null || sourceCollection.length < 1) return itemCount == null ? void 0 : [];
    if (itemCount == null) return sourceCollection[0];
    return this.getInitialElements(sourceCollection, sourceCollection.length - itemCount);
  }

  /**
   * Extracts all elements except the last specified number.
   * @param {Array} sourceCollection - The array to process.
   * @param {number} [elementsToOmit] - The count of elements to exclude from the end.
   * @returns {*[]} A new array containing the initial part of the collection.
   */
  getInitialElements(sourceCollection, elementsToOmit) { return sourceCollection.slice.call(sourceCollection, 0, Math.max(0, sourceCollection.length - (elementsToOmit == null ? 1 : elementsToOmit))); }

  /**
   * Retrieves the trailing elements from an array, starting from a given index.
   * @param {Array} sourceCollection - The array to process.
   * @param {number} [startIndex] - The index from which to start extracting.
   * @returns {*[]} A new array containing the trailing part of the collection.
   */
  getTrailingElements(sourceCollection, startIndex) { return sourceCollection.slice.call(sourceCollection, startIndex == null ? 1 : startIndex); }

  /**
   * Retrieves the last elements from an array.
   * @param {Array} sourceCollection - The array from which to extract elements.
   * @param {number} [itemCount] - The number of elements to retrieve from the end.
   * @returns {*|*[]} The last element if `itemCount` is null, otherwise an array of last elements.
   */
  getLastElement(sourceCollection, itemCount) {
    if (itemCount == null) return sourceCollection[sourceCollection.length - 1];
    return this.getTrailingElements(sourceCollection, Math.max(0, sourceCollection.length - itemCount));
  }

  /**
   * Conducts a binary search on a sorted collection to find the appropriate insertion point.
   * @param {Array} sortedCollection - The array assumed to be sorted.
   * @param {*} searchKey - The value for which to find the position.
   * @param {string} [propertyAccessor] - The key to access a property if elements are objects.
   * @returns {number} The index where the search key should be inserted to maintain order.
   */
  performBinarySearch(sortedCollection, searchKey, propertyAccessor) {
    const propertyExtractor = (targetObject) => (typeof targetObject === 'object') ? targetObject[propertyAccessor] : targetObject;
    const searchTargetValue = propertyExtractor(searchKey);
    let lowerBound = 0, upperBound = sortedCollection.length;
    while (lowerBound < upperBound) {
      let middleIndex = Math.floor((lowerBound + upperBound) / 2);
      if (propertyExtractor(sortedCollection[middleIndex]) < searchTargetValue) lowerBound = middleIndex + 1; else upperBound = middleIndex;
    }
    return lowerBound;
  }
}
const globalUtil = new UtilityToolkit();

/* An implementation of a Max-Heap data structure using a binary tree. */
class MaxPriorityQueue {
  /**
   * Constructs an empty MaxPriorityQueue.
   * @constructor
   */
  constructor() {
    this.internalArray = []; // Stores the heap elements
    this.currentSize = 0; // Keeps track of the number of elements in the heap
  }

  /**
   * Inserts a new element with its associated priority into the queue.
   * The heap property is maintained after insertion.
   * @param {number} priorityValue - The priority of the element (higher value means higher priority).
   * @param {*} elementValue - The actual data element to store.
   */
  insert(priorityValue, elementValue) {
    const heapStorage = this.internalArray;
    heapStorage.push({ priority: priorityValue, content: elementValue });
    let currentIdx = this.currentSize;
    let parentIdx = (currentIdx - 1) >> 1; // Calculate parent index
    // Perform up-heap operation
    while (parentIdx >= 0 && heapStorage[parentIdx].priority < heapStorage[currentIdx].priority) {
      const tempHolder = heapStorage[currentIdx];
      heapStorage[currentIdx] = heapStorage[parentIdx];
      heapStorage[parentIdx] = tempHolder;
      currentIdx = parentIdx;
      parentIdx = (currentIdx - 1) >> 1;
    }
    ++this.currentSize;
  }

  /**
   * Removes and returns the element with the highest priority from the queue.
   * The heap property is maintained after extraction.
   * @returns {*} The element with the highest priority, or null if the queue is empty.
   */
  extractMax() {
    if (this.currentElementCount <= 0) {
      return null;
    }
    const newLength = this.currentSize - 1;
    const heapStorage = this.internalArray;
    const extractedTopElement = this.highestPriorityElement;
    // Move the last element to the root position
    heapStorage[0] = heapStorage[newLength];
    heapStorage.pop(); // Remove the now-duplicated last element

    let currentIdx = 0;
    let child1Idx = (currentIdx << 1) + 1;
    let child2Idx = (currentIdx << 1) + 2;

    // Perform down-heap operation
    let priority0, priority1, priority2;
    while (child1Idx < newLength) {
      if (child2Idx < newLength) {
        // Both left and right children exist
        priority0 = heapStorage[currentIdx].priority;
        priority1 = heapStorage[child1Idx].priority;
        priority2 = heapStorage[child2Idx].priority;

        // If child1's priority is less than child2's, AND parent's priority is less than child2's
        if ((priority1 < priority2) && (priority0 < priority2)) {
          // Swap parent with the right child (since right child is greater)
          const tempHolder = heapStorage[currentIdx];
          heapStorage[currentIdx] = heapStorage[child2Idx];
          heapStorage[child2Idx] = tempHolder;
          currentIdx = child2Idx; // Move down to the right child
        }
        else {
          // Otherwise, (if child1 >= child2 OR parent >= child2), swap with left child
          // This implicitly handles cases where child1 is greater than child2, and parent is smaller than child1
          const tempHolder = heapStorage[currentIdx];
          heapStorage[currentIdx] = heapStorage[child1Idx];
          heapStorage[child1Idx] = tempHolder;
          currentIdx = child1Idx; // Move down to the left child
        }
        child1Idx = (currentIdx << 1) + 1; // Recalculate child indices
        child2Idx = (currentIdx << 1) + 2;
      }
      else {
        // Only the left child exists
        priority0 = heapStorage[currentIdx].priority;
        priority1 = heapStorage[child1Idx].priority;
        if (priority0 < priority1) {
          // If parent's priority is less than the left child's, swap them
          const tempHolder = heapStorage[currentIdx];
          heapStorage[currentIdx] = heapStorage[child1Idx];
          heapStorage[child1Idx] = tempHolder;
        }
        break; // No more children to compare with
      }
    }

    this.currentSize = newLength;
    return extractedTopElement;
  }

  /**
   * Retrieves the element with the highest priority without removing it from the queue.
   * @returns {*} The element at the top of the heap.
   */
  get highestPriorityElement() {
    return this.internalArray[0].content;
  }

  /**
   * Returns the current number of elements stored in the queue.
   * @returns {number} The count of elements.
   */
  get currentElementCount() {
    return this.currentSize;
  }
}

// Instantiate the data source for input operations
const dataSource = new DataSource();
// Create an instance of the main processor and execute its task
(new Processor()).processTask();