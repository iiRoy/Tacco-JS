const InputParserModule = (function() {
  /**
   * Represents a line-by-line input data processor.
   * It handles reading various formats of input from a raw string.
   * @param {string} rawInputString - The complete input string, typically from a file.
   */
  function LineInputProcessor(rawInputString) {
    // Process the input string: trim leading/trailing whitespace and split into individual lines.
    // Each line in this array is a string.
    this._sourceLines = rawInputString.trim().split('\n');
    // Keep track of the current line being processed. This index increments as lines are consumed.
    this._currentLineIndex = 0;
    // A temporary buffer to hold tokens (words) from the current line when reading single values.
    // This allows for multiple `readNextToken` calls on the same line.
    this._currentLineTokens = [];
  }

  /**
   * Internal helper method to advance the processor to the next line.
   * This clears any remaining tokens from the previous line.
   */
  LineInputProcessor.prototype._moveToNextLine = function() {
    this._currentLineIndex++;
    this._currentLineTokens = []; // Clear tokens for the new line
  };

  /**
   * Reads a single value (token) from the input.
   * If the current line's tokens are exhausted, it automatically moves to the next line and processes it.
   * @param {boolean} [returnAsString=false] - If true, returns the value as a string; otherwise, attempts to convert to a number.
   * @returns {string|number} The parsed single value.
   * @throws {Error} If an attempt is made to read beyond the end of the input data.
   */
  LineInputProcessor.prototype.readNextToken = function(returnAsString = false) {
    // If the token buffer for the current line is empty, we need to populate it.
    if (this._currentLineTokens.length === 0) {
      if (this._currentLineIndex >= this._sourceLines.length) {
        // All lines have been read. No more input available.
        throw new Error("InputProcessor: Attempted to read past the end of available input.");
      }
      // Split the current line by spaces and store tokens.
      // The original code reversed the array and popped. We will just pop from the end of a non-reversed array.
      this._currentLineTokens = this._sourceLines[this._currentLineIndex].split(' ');
    }

    // Extract the last token from the buffer. This is a Type III change from reversing.
    const extractedToken = this._currentLineTokens.pop();

    // If no more tokens remain on this line after popping, advance to the next line.
    if (this._currentLineTokens.length === 0) {
      this._moveToNextLine();
    }

    // Return the token, either as a string or converted to a number.
    return returnAsString ? extractedToken : Number(extractedToken);
  };

  /**
   * Reads an entire line of space-separated values.
   * The line pointer is advanced after reading.
   * @param {boolean} [returnAsStrings=false] - If true, returns values as strings; otherwise, attempts to convert to numbers.
   * @returns {Array<string|number>} An array containing all parsed values from the line.
   * @throws {Error} If an attempt is made to read beyond the end of the input data.
   */
  LineInputProcessor.prototype.readValuesInLine = function(returnAsStrings = false) {
    if (this._currentLineIndex >= this._sourceLines.length) {
      throw new Error("InputProcessor: Attempted to read past the end of input for line values.");
    }
    const currentLineContent = this._sourceLines[this._currentLineIndex];
    this._moveToNextLine(); // Advance to the next line immediately after reading this one.

    const values = currentLineContent.split(' ');
    return returnAsStrings ? values : values.map(val => Number(val));
  };

  /**
   * Reads a specified number of lines and parses them into a 2D array (matrix).
   * Each line is split by spaces. The line pointer is advanced by `numLines`.
   * @param {number} numLines - The number of lines to read for the matrix.
   * @param {boolean} [returnAsStrings=false] - If true, returns values as strings; otherwise, attempts to convert to numbers.
   * @returns {Array<Array<string|number>>} A 2D array representing the matrix data.
   * @throws {Error} If there are not enough lines remaining in the input.
   */
  LineInputProcessor.prototype.readMatrixOfValues = function(numLines, returnAsStrings = false) {
    // Add a guard clause for invalid input.
    if (numLines <= 0) {
      console.warn("InputProcessor: Requested to read 0 or negative lines for matrix. Returning an empty array.");
      return [];
    }
    if (this._currentLineIndex + numLines > this._sourceLines.length) {
      throw new Error(`InputProcessor: Not enough lines remaining to read a matrix of ${numLines} lines.`);
    }

    const matrixData = [];
    for (let i = 0; i < numLines; i++) {
      const line = this._sourceLines[this._currentLineIndex + i];
      const parsedLine = line.split(' ');
      matrixData.push(returnAsStrings ? parsedLine : parsedLine.map(val => Number(val)));
    }
    this._currentLineIndex += numLines; // Advance the line pointer by the number of lines read.
    this._currentLineTokens = []; // Clear token buffer as we've moved past lines.
    return matrixData;
  };

  /**
   * Reads a specified number of lines, treating each line as a single value, and returns them as a 1D array.
   * The line pointer is advanced by `numLines`.
   * @param {number} numLines - The number of lines to read.
   * @param {boolean} [returnAsStrings=false] - If true, returns values as strings; otherwise, attempts to convert to numbers.
   * @returns {Array<string|number>} A 1D array of values.
   * @throws {Error} If there are not enough lines remaining in the input.
   */
  LineInputProcessor.prototype.readLinesAsFlatArray = function(numLines, returnAsStrings = false) {
    if (numLines <= 0) {
      console.warn("InputProcessor: Requested to read 0 or negative lines for flat array. Returning an empty array.");
      return [];
    }
    if (this._currentLineIndex + numLines > this._sourceLines.length) {
      throw new Error(`InputProcessor: Not enough lines remaining to read a flat array of ${numLines} lines.`);
    }

    const flatArray = [];
    for (let i = 0; i < numLines; i++) {
      const line = this._sourceLines[this._currentLineIndex + i];
      flatArray.push(returnAsStrings ? line : Number(line));
    }
    this._currentLineIndex += numLines; // Advance the line pointer.
    this._currentLineTokens = []; // Clear token buffer.
    return flatArray;
  };

  // The factory function that creates and returns new instances of LineInputProcessor.
  return function(inputContent) {
    return new LineInputProcessor(inputContent);
  };
})();

// Create an instance of the input parser, reading content from standard input.
const dataReader = InputParserModule(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Internal recursive helper function to build multi-dimensional arrays.
 * @param {number} currentDepth - The current dimension being constructed (0-indexed).
 * @param {Array<number>} arrayDimensions - An array specifying the size of each dimension.
 * @param {*} defaultValue - The value to fill the innermost array elements with.
 * @returns {Array} A multi-dimensional array segment.
 */
function _buildNestedArray(currentDepth, arrayDimensions, defaultValue) {
  // Base case: If we're at the innermost dimension, create a simple array filled with the default value.
  if (currentDepth === arrayDimensions.length - 1) {
    return Array(arrayDimensions[currentDepth]).fill(defaultValue);
  } else {
    // Recursive step: Create an array, and for each element, recursively call to build the next dimension.
    return Array(arrayDimensions[currentDepth]).fill(null).map(() => _buildNestedArray(currentDepth + 1, arrayDimensions, defaultValue));
  }
}

/**
 * Creates a multi-dimensional array with specified dimensions and an initial fill value.
 * This function replaces the original `xArray` which used `eval`.
 * Example: `constructMultiDimensionalArray(0, 2, 3)` creates a 2x3 array filled with 0s.
 * @param {*} initialFillValue - The value to fill the array elements with.
 * @param {...number} dimensions - The sizes of each dimension as separate arguments.
 * @returns {Array} A multi-dimensional array.
 */
function constructMultiDimensionalArray(initialFillValue, ...dimensions) {
  // Guard clause for no dimensions provided.
  if (!dimensions || dimensions.length === 0) {
    console.warn("ConstructMultiDimensionalArray: No dimensions provided. Returning a single value array.");
    return [initialFillValue];
  }
  // Start the recursive building process from the first dimension (depth 0).
  return _buildNestedArray(0, dimensions, initialFillValue);
}

// Implements a Min-Heap data structure for managing prioritized elements.
const MinValueHeapFactory = (function() {

  /**
   * Represents a Min-Heap.
   * Elements stored in this heap are expected to be arrays, where the first element `[0]`
   * is the priority key. A lower numerical priority key indicates a higher priority
   * (meaning smaller values are extracted first).
   */
  function MinValueHeap() {
    // The underlying array that stores all heap elements.
    this._elements = [];
    // A separate counter for the number of elements, which can also be derived from `this._elements.length`.
    this._elementCount = 0;
  }

  /**
   * Swaps two elements within the heap's internal array.
   * @param {number} index1 - The index of the first element.
   * @param {number} index2 - The index of the second element.
   */
  MinValueHeap.prototype._swapElements = function(index1, index2) {
    // Using array destructuring for a concise swap.
    [this._elements[index1], this._elements[index2]] = [this._elements[index2], this._elements[index1]];
  };

  /**
   * Calculates the index of the parent node for a given child node index.
   * @param {number} childIndex - The index of the child node.
   * @returns {number} The index of the parent node.
   */
  MinValueHeap.prototype._getParentIndex = function(childIndex) {
    return Math.floor((childIndex - 1) / 2);
  };

  /**
   * Calculates the index of the left child node for a given parent node index.
   * @param {number} parentIndex - The index of the parent node.
   * @returns {number} The index of the left child node.
   */
  MinValueHeap.prototype._getLeftChildIndex = function(parentIndex) {
    return (2 * parentIndex) + 1;
  };

  /**
   * Calculates the index of the right child node for a given parent node index.
   * @param {number} parentIndex - The index of the parent node.
   * @returns {number} The index of the right child node.
   */
  MinValueHeap.prototype._getRightChildIndex = function(parentIndex) {
    return (2 * parentIndex) + 2;
  };

  /**
   * Adds a new element to the heap, ensuring the min-heap property is maintained.
   * @param {Array} item - The element to add. Expected format: `[priority_value, ...data]`.
   */
  MinValueHeap.prototype.insertElement = function(item) {
    this._elements.push(item); // Add the new item to the end of the array.
    this._elementCount++; // Increment the element count.
    this._bubbleUpLastElement(); // Restore the heap property by moving the new element upwards.
  };

  /**
   * Restores the min-heap property by moving the last inserted element upwards
   * until its correct position is found (i.e., it's smaller than its parent).
   */
  MinValueHeap.prototype._bubbleUpLastElement = function() {
    let currentElementIndex = this._elementCount - 1; // Start from the last element.
    while (currentElementIndex > 0) {
      const parentIndex = this._getParentIndex(currentElementIndex);
      // If the parent's priority is less than or equal to the current element's priority,
      // the heap property is satisfied at this level.
      if (this._elements[parentIndex][0] <= this._elements[currentElementIndex][0]) {
        break;
      }
      // Otherwise, swap the current element with its parent and continue bubbling up.
      this._swapElements(currentElementIndex, parentIndex);
      currentElementIndex = parentIndex;
    }
  };

  /**
   * Removes and returns the element with the smallest priority from the heap (the root element).
   * @returns {Array|undefined} The element with the smallest priority, or `undefined` if the heap is empty.
   */
  MinValueHeap.prototype.extractMin = function() {
    if (this.isEmpty()) {
      return undefined; // Heap is empty, nothing to extract.
    }
    if (this._elementCount === 1) {
      this._elementCount--;
      return this._elements.pop(); // Only one element, simply remove and return it.
    }

    const minimumItem = this._elements[0]; // The root is always the minimum element.
    this._elements[0] = this._elements.pop(); // Move the last element to the root position.
    this._elementCount--; // Decrement the element count.
    this._sinkDownRootElement(); // Restore the heap property from the new root.

    return minimumItem;
  };

  /**
   * Restores the min-heap property by moving the root element downwards
   * until its correct position is found (i.e., it's smaller than its children).
   */
  MinValueHeap.prototype._sinkDownRootElement = function() {
    let currentElementIndex = 0; // Start from the root.
    const lastValidIndex = this._elementCount - 1;

    while (true) {
      const leftChildIndex = this._getLeftChildIndex(currentElementIndex);
      const rightChildIndex = this._getRightChildIndex(currentElementIndex);
      let smallestChildIndex = currentElementIndex; // Assume current element is the smallest.

      // Check if left child exists and has a smaller priority.
      if (leftChildIndex <= lastValidIndex && this._elements[leftChildIndex][0] < this._elements[smallestChildIndex][0]) {
        smallestChildIndex = leftChildIndex;
      }
      // Check if right child exists and has an even smaller priority.
      if (rightChildIndex <= lastValidIndex && this._elements[rightChildIndex][0] < this._elements[smallestChildIndex][0]) {
        smallestChildIndex = rightChildIndex;
      }

      // If the smallest child is the current element itself, the heap property is satisfied.
      if (smallestChildIndex === currentElementIndex) {
        break;
      }

      // Otherwise, swap with the smallest child and continue sinking down.
      this._swapElements(currentElementIndex, smallestChildIndex);
      currentElementIndex = smallestChildIndex;
    }
  };

  /**
   * Checks if the heap currently contains no elements.
   * @returns {boolean} True if the heap is empty, false otherwise.
   */
  MinValueHeap.prototype.isEmpty = function() {
    return this._elementCount === 0;
  };

  /**
   * Returns the element with the smallest priority without removing it from the heap.
   * @returns {Array|undefined} The element with the smallest priority, or `undefined` if the heap is empty.
   */
  MinValueHeap.prototype.peekMin = function() {
    return this._elements[0];
  };

  /**
   * A getter property to retrieve the current number of elements in the heap.
   * @returns {number} The current size of the heap.
   */
  Object.defineProperty(MinValueHeap.prototype, 'size', {
    get: function() {
      return this._elementCount;
    }
  });

  // The factory function for creating new MinValueHeap instances.
  return function() {
    return new MinValueHeap();
  };
})();

/**
 * Helper function for calculating circular array indices.
 * Ensures that an index wraps around within the bounds of an array.
 * @param {number} index - The desired index.
 * @param {number} arrayLength - The total length of the array.
 * @returns {number} The adjusted circular index.
 */
const getCircularIndex = (index, arrayLength) => {
  // The expression `(index % arrayLength + arrayLength) % arrayLength` correctly handles
  // both positive and negative `index` values to ensure a positive modulo result.
  return (index % arrayLength + arrayLength) % arrayLength;
};

/**
 * Solves the core problem logic: determining the minimum number of operations
 * to transform an array `currentValues` into `initialValues` under specific rules.
 * This function reads input, initializes a priority queue, and iteratively applies operations.
 * @returns {number} The minimum total number of operations, or -1 if the transformation is impossible.
 */
function calculateMinimumOperations() {
  // Read the number of elements (N) from the input processor.
  const numElements = dataReader.readNextToken();

  // Guard clause: Ensure N is a positive integer.
  if (numElements <= 0) {
    console.error("Error: Number of elements (N) must be a positive integer.");
    return -1;
  }

  // Read the target array (a) and the current state array (b) from input.
  const initialValues = dataReader.readValuesInLine();
  const currentValues = dataReader.readValuesInLine();

  // Initialize a min-heap. Elements are stored as `[-value, index]`.
  // Using `-value` effectively turns the min-heap into a max-heap for `value`,
  // ensuring that elements with larger `currentValues` are processed first.
  const processingHeap = MinValueHeapFactory();

  // First pass: Populate the heap with elements that need reduction and perform initial checks.
  for (let idx = 0; idx < numElements; ++idx) {
    // If an element is already at its target value, no initial operation is needed for it.
    if (initialValues[idx] === currentValues[idx]) {
      continue;
    }
    // Critical check: If a current value is already greater than its target initial value,
    // it's an impossible state because operations only reduce values.
    if (initialValues[idx] > currentValues[idx]) {
      // console.debug(`Impossible: initialValues[${idx}] (${initialValues[idx]}) > currentValues[${idx}] (${currentValues[idx]})`);
      return -1; // Indicate impossibility with -1.
    }
    // If the element needs reduction, add it to the heap.
    // Store its current value (negated for max-heap behavior) and its index.
    processingHeap.insertElement([-currentValues[idx], idx]);
  }

  let totalOperations = 0; // Accumulator for the total count of operations.

  // Main processing loop: Continue as long as there are elements in the heap.
  while (!processingHeap.isEmpty()) {
    const heapEntry = processingHeap.extractMin();
    const elementIndex = heapEntry[1];
    const valueWhenPushedToHeap = -heapEntry[0]; // This is the value of currentValues[elementIndex] when it was added to the heap.

    // Type III addition: Handle stale entries.
    // If the current value of the element has changed since it was pushed to the heap,
    // it means a neighboring operation likely affected it.
    if (currentValues[elementIndex] !== valueWhenPushedToHeap) {
        // If the element is now equal to its target, this heap entry is stale and resolved.
        if (currentValues[elementIndex] === initialValues[elementIndex]) {
            continue;
        }
        // If the element's current value has dropped below its target, it's an impossible state.
        if (currentValues[elementIndex] < initialValues[elementIndex]) {
            // console.debug(`Impossible: currentValues[${elementIndex}] (${currentValues[elementIndex]}) went below initialValues[${elementIndex}] (${initialValues[elementIndex]}) due to neighbor ops.`);
            return -1;
        }
        // If the element still needs reduction (current > initial), re-add it with its updated current value.
        // This ensures the heap always processes the most current state.
        if (currentValues[elementIndex] > initialValues[elementIndex]) {
            processingHeap.insertElement([-currentValues[elementIndex], elementIndex]);
            continue;
        }
    }

    // Calculate the sum of the values of its neighbors, using circular indexing.
    const neighborSum =
      currentValues[getCircularIndex(elementIndex - 1, numElements)] +
      currentValues[getCircularIndex(elementIndex + 1, numElements)];

    let operationsForThisElement = 0;
    // Guard against division by zero.
    if (neighborSum > 0) {
        // Calculate the number of operations required for this element to reach its target.
        // Integer division is used (`| 0`).
        operationsForThisElement = (currentValues[elementIndex] - initialValues[elementIndex]) / neighborSum | 0;
    } else {
        // If neighborSum is 0, no operations can reduce this element via its neighbors.
        // If it's still above its target, transformation is impossible.
        if (currentValues[elementIndex] > initialValues[elementIndex]) {
            // console.debug(`Impossible: neighborSum is 0, but currentValues[${elementIndex}] (${currentValues[elementIndex]}) > initialValues[${elementIndex}] (${initialValues[elementIndex]}).`);
            return -1;
        }
        // If neighborSum is 0 and it's already at or below target, it's resolved (or an earlier impossibility check failed).
        continue;
    }

    // If zero or negative operations are calculated but the element is still above its target,
    // it means it cannot be reduced further by the current neighbor sum (e.g., current < neighborSum).
    if (operationsForThisElement <= 0) {
        if (currentValues[elementIndex] > initialValues[elementIndex]) {
            // console.debug(`Impossible: Calculated zero/negative ops for currentValues[${elementIndex}] (${currentValues[elementIndex]}) while still above target (${initialValues[elementIndex]}). Neighbor sum: ${neighborSum}.`);
            return -1;
        }
        continue; // Element is resolved or cannot be processed further.
    }

    // Apply the calculated operations:
    totalOperations += operationsForThisElement;
    currentValues[elementIndex] -= operationsForThisElement * neighborSum;

    // After applying operations, re-check the state of the element.
    if (currentValues[elementIndex] === initialValues[elementIndex]) {
      continue; // Element is now resolved to its target value.
    }
    // If the element's value is still greater than its target, it needs further processing.
    // Re-add it to the heap with its new, reduced value.
    if (currentValues[elementIndex] > initialValues[elementIndex]) {
      processingHeap.insertElement([-currentValues[elementIndex], elementIndex]);
    } else {
      // If the element's value dropped below its target, it's an impossible state.
      // console.debug(`Impossible: currentValues[${elementIndex}] (${currentValues[elementIndex]}) dropped below initialValues[${elementIndex}] (${initialValues[elementIndex]}).`);
      return -1;
    }
  }

  // Final validation: After the loop, ensure all elements in `currentValues` precisely match `initialValues`.
  // This catches any edge cases where the heap might empty but not all conditions are met.
  for (let idx = 0; idx < numElements; ++idx) {
    if (initialValues[idx] !== currentValues[idx]) {
      // console.debug(`Final check failed: initialValues[${idx}] (${initialValues[idx]}) !== currentValues[${idx}] (${currentValues[idx]})`);
      return -1; // Not all values could be transformed to their targets.
    }
  }

  // If all checks pass and the loop completes, return the total number of operations.
  return totalOperations;
}

// Execute the main problem-solving function and print its result to the console.
console.log(calculateMinimumOperations());