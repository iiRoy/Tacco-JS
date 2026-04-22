// This module provides an implementation of a Max Binary Heap data structure.
// A Max Heap is a specialized tree-based data structure that satisfies the heap property:
// the value of each node is greater than or equal to the value of its children.
// This allows for efficient retrieval of the maximum element.

class BinaryMaxHeap {
  // Constructs a new instance of the BinaryMaxHeap.
  // An optional array of initial numeric values can be provided to populate the heap.
  constructor(initialCollection = []) {
    /**
     * @private
     * @type {number[]} storageArray - The internal array representing the heap.
     * Heap elements are stored in a level-order traversal fashion.
     */
    this.storageArray = [];

    // If an initial collection of elements is provided, add them to the heap.
    // Each element is added individually to maintain the heap property.
    if (Array.isArray(initialCollection) && initialCollection.length > 0) {
      for (const item of initialCollection) {
        this.addElement(item);
      }
    }
  }

  /**
   * Calculates the index of the parent node for a given child node index.
   * @private
   * @param {number} childNodeIndex - The index of the child node.
   * @returns {number} The index of the parent node.
   */
  _computeParentIndex(childNodeIndex) {
    // For a child at index i, its parent is at floor((i - 1) / 2).
    // Using bitwise right shift (>>) is an efficient way to perform integer division by 2.
    return (childNodeIndex - 1) >> 1;
  }

  /**
   * Calculates the index of the left child node for a given parent node index.
   * @private
   * @param {number} parentNodeIndex - The index of the parent node.
   * @returns {number} The index of the left child node.
   */
  _computeLeftChildIndex(parentNodeIndex) {
    // For a parent at index i, its left child is at (2 * i) + 1.
    return (parentNodeIndex << 1) + 1;
  }

  /**
   * Calculates the index of the right child node for a given parent node index.
   * @private
   * @param {number} parentNodeIndex - The index of the parent node.
   * @returns {number} The index of the right child node.
   */
  _computeRightChildIndex(parentNodeIndex) {
    // For a parent at index i, its right child is at (2 * i) + 2.
    return (parentNodeIndex << 1) + 2;
  }

  /**
   * Swaps two elements within the internal heap array.
   * @private
   * @param {number} firstIndex - The index of the first element.
   * @param {number} secondIndex - The index of the second element.
   */
  _performSwap(firstIndex, secondIndex) {
    const temporaryHolder = this.storageArray[firstIndex];
    this.storageArray[firstIndex] = this.storageArray[secondIndex];
    this.storageArray[secondIndex] = temporaryHolder;
  }

  /**
   * Adds a new numeric element to the heap, maintaining the heap property.
   * @param {number} elementValue - The numeric value to be inserted.
   * @returns {boolean} True if the element was successfully added, false otherwise.
   */
  addElement(elementValue) {
    // Validate that the input is a valid number.
    if (typeof elementValue !== 'number' || !Number.isFinite(elementValue)) {
      console.error(`Invalid input for addElement: "${elementValue}". Only finite numbers are allowed.`);
      return false;
    }

    // Append the new element to the end of the storage array.
    this.storageArray.push(elementValue);
    // Restore the heap property by moving the new element up to its correct position.
    this._bubbleUp(this.storageArray.length - 1);
    return true;
  }

  /**
   * Restores the max-heap property by sifting an element upwards in the tree.
   * This is typically called after inserting a new element at the end.
   * @private
   * @param {number} initialPosition - The index of the element to be bubbled up.
   */
  _bubbleUp(initialPosition) {
    let currentElementPosition = initialPosition;
    let currentParentPosition = this._computeParentIndex(currentElementPosition);

    // Continue bubbling up as long as the current element is not the root
    // and is greater than its parent.
    while (currentElementPosition > 0 && this.storageArray[currentElementPosition] > this.storageArray[currentParentPosition]) {
      // Exchange the current element with its parent.
      this._performSwap(currentElementPosition, currentParentPosition);

      // Update positions to continue moving up the tree.
      currentElementPosition = currentParentPosition;
      currentParentPosition = this._computeParentIndex(currentElementPosition);
    }
  }

  /**
   * Retrieves and removes the maximum element (root) from the heap.
   * @returns {number | null} The maximum element, or null if the heap is empty.
   */
  retrieveMax() {
    // Check if the heap is empty.
    if (this.storageArray.length === 0) {
      return null; // Indicate that no element could be retrieved.
    }

    // If there's only one element, it's the max. Just pop it.
    if (this.storageArray.length === 1) {
      return this.storageArray.pop();
    }

    // Store the root element (which is the maximum value).
    const topValue = this.storageArray[0];

    // Move the last element of the heap to the root position.
    this.storageArray[0] = this.storageArray.pop();

    // Restore the heap property by sifting the new root element down.
    this._siftDown(0);

    return topValue;
  }

  /**
   * Restores the max-heap property by sifting an element downwards in the tree.
   * This is typically called after removing the root element.
   * @private
   * @param {number} startingNodeIndex - The index of the element to be sifted down.
   */
  _siftDown(startingNodeIndex) {
    let currentParentNodeIndex = startingNodeIndex;
    const heapTotalElements = this.storageArray.length;

    // Loop until the heap property is restored for the current subtree.
    while (true) {
      const leftChildNodeIndex = this._computeLeftChildIndex(currentParentNodeIndex);
      const rightChildNodeIndex = this._computeRightChildIndex(currentParentNodeIndex);
      let largestNodeIndex = currentParentNodeIndex; // Assume parent is the largest initially.

      // Determine if the left child exists and is larger than the current largest.
      if (leftChildNodeIndex < heapTotalElements && this.storageArray[leftChildNodeIndex] > this.storageArray[largestNodeIndex]) {
        largestNodeIndex = leftChildNodeIndex;
      }

      // Determine if the right child exists and is larger than the current largest.
      if (rightChildNodeIndex < heapTotalElements && this.storageArray[rightChildNodeIndex] > this.storageArray[largestNodeIndex]) {
        largestNodeIndex = rightChildNodeIndex;
      }

      // If the largest element is still the parent, the heap property is satisfied.
      if (largestNodeIndex === currentParentNodeIndex) {
        break;
      }

      // Otherwise, swap the parent with the largest child and continue sifting down.
      this._performSwap(currentParentNodeIndex, largestNodeIndex);
      currentParentNodeIndex = largestNodeIndex; // Move down to the child's position.
    }
  }

  /**
   * Reports the current number of elements in the heap.
   * @returns {number} The total count of elements.
   */
  get elementCount() {
    return this.storageArray.length;
  }

  /**
   * Checks if the heap contains any elements.
   * @returns {boolean} True if the heap is empty, false otherwise.
   */
  get isEmpty() {
    return this.storageArray.length === 0;
  }
}

// Immediately-invoked asynchronous function to manage heap operations from standard input.
(async function processHeapCommands() {
  const fileSystem = require('fs');
  const pathModule = require('path');

  let rawInputContent;
  try {
    // Attempt to read input from the standard input stream.
    rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
  } catch (readError) {
    // If reading from /dev/stdin fails (e.g., on Windows or if no input is piped),
    // log the error and attempt to read from a local mock file for development/testing.
    console.error(`Failed to read from /dev/stdin: ${readError.message}`);
    const mockFilePath = pathModule.join(__dirname, 'mock_heap_input.txt');
    try {
      rawInputContent = fileSystem.readFileSync(mockFilePath, 'utf8');
      console.warn(`Fallback: Reading input from local mock file: ${mockFilePath}`);
    } catch (mockReadError) {
      console.error(`Critical: Could not read from mock input file either: ${mockReadError.message}`);
      process.exit(1); // Terminate if no input source is available.
    }
  }

  // Split input into individual command lines, trim whitespace, and filter out any empty lines.
  const commandLines = rawInputContent
    .trim()
    .split('\n')
    .filter(line => line.length > 0);

  // Instantiate our Max Heap.
  const activeMaxHeap = new BinaryMaxHeap();
  // Buffer to collect all output strings before a single write to stdout.
  const outputCollector = [];

  // Iterate over each command line to perform heap operations.
  for (const currentCommand of commandLines) {
    const processedCommand = currentCommand.trim();

    // Check for 'insert' command.
    if (processedCommand.startsWith('i')) {
      const commandParts = processedCommand.split(' ');
      if (commandParts.length < 2) {
        console.error(`Syntax error: "insert" command requires a value. Command: "${processedCommand}"`);
        continue;
      }
      const numericValue = parseInt(commandParts[1], 10);
      activeMaxHeap.addElement(numericValue);
    }
    // Check for 'extract' command.
    else if (processedCommand.startsWith('e')) {
      const extractedResult = activeMaxHeap.retrieveMax();
      if (extractedResult !== null) {
        outputCollector.push(extractedResult.toString());
      } else {
        // If the heap was empty, push a specific message.
        outputCollector.push("HEAP_IS_EMPTY");
      }
    }
    // Handle unrecognized commands.
    else {
      console.warn(`Unrecognized command detected: "${processedCommand}". Skipping.`);
    }
  }

  // Write all collected output messages to standard output, each on a new line.
  if (outputCollector.length > 0) {
    process.stdout.write(outputCollector.join('\n') + '\n');
  } else {
    // If no output was generated, provide a default message.
    process.stdout.write("No operational output generated from commands.\n");
  }
})();