class ValueHeap {
  // Static helper methods for calculating heap indices.
  // These replace the problematic Number.prototype extensions from the original code.
  static getParentIndex(childPosition) {
    return Math.floor((childPosition - 1) / 2);
  }

  static getLeftChildIndex(parentPosition) {
    return 2 * parentPosition + 1;
  }

  static getRightChildIndex(parentPosition) {
    return 2 * parentPosition + 2;
  }

  /**
   * Initializes a new Max Value Heap.
   * Can optionally be initialized with an array of elements, which will be heapified in O(N) time.
   * @param {Array<number>} [initialElements=[]] - An optional array of numbers to initialize the heap.
   */
  constructor(initialElements = []) {
    this.elements = []; // The array storing the heap elements.

    // If initial elements are provided, build the heap efficiently.
    if (Array.isArray(initialElements) && initialElements.length > 0) {
      this.elements = [...initialElements]; // Create a shallow copy.
      // Perform heapify-down starting from the last non-leaf node up to the root.
      for (let i = Math.floor(this.elements.length / 2) - 1; i >= 0; i--) {
        this.#heapifyDown(i);
      }
    }
  }

  /**
   * Checks if the heap is currently empty.
   * @returns {boolean} True if the heap contains no elements, false otherwise.
   */
  isEmpty() {
    return this.elements.length === 0;
  }

  /**
   * Adds a new numeric value to the heap, maintaining the max-heap property.
   * @param {number} valueToAdd - The numeric value to be inserted.
   */
  addValue(valueToAdd) {
    this.elements.push(valueToAdd); // Add the new value to the end.
    this.#bubbleUp(this.elements.length - 1); // Restore heap property by bubbling up.
  }

  /**
   * Extracts and returns the maximum value from the heap.
   * The max value is always at the root (index 0).
   * @returns {number|null} The maximum value, or null if the heap is empty.
   */
  extractMax() {
    // Guard clause: return null if the heap is empty.
    if (this.isEmpty()) {
      console.warn("Attempted to extract from an empty heap. Returning null.");
      return null;
    }

    // If there's only one element, just pop it.
    if (this.elements.length === 1) {
      return this.elements.pop();
    }

    const highestValue = this.elements[0]; // Store the root (max value).
    this.elements[0] = this.elements.pop(); // Move the last element to the root.
    this.#heapifyDown(0); // Restore heap property by bubbling down the new root.
    return highestValue;
  }

  /**
   * Private helper method to move an element up the heap to its correct position.
   * This is an iterative version of the original `heapIncrease` method.
   * @param {number} currentPosition - The index of the element to bubble up.
   */
  #bubbleUp(currentPosition) {
    const heapItems = this.elements;
    let parentPosition = ValueHeap.getParentIndex(currentPosition);

    // Continue bubbling up as long as the current element is greater than its parent
    // and we haven't reached the root.
    while (currentPosition > 0 && heapItems[currentPosition] > heapItems[parentPosition]) {
      // Swap the current element with its parent.
      // Using a temporary variable for clarity and variation from original's destructuring.
      let tempHolder = heapItems[currentPosition];
      heapItems[currentPosition] = heapItems[parentPosition];
      heapItems[parentPosition] = tempHolder;

      currentPosition = parentPosition; // Move up to the parent's position.
      parentPosition = ValueHeap.getParentIndex(currentPosition); // Recalculate new parent.
    }
  }

  /**
   * Private helper method to move an element down the heap to its correct position.
   * This is an iterative version of the original `maxHeapify` method.
   * @param {number} startPosition - The index of the element to heapify down.
   */
  #heapifyDown(startPosition) {
    const heapItems = this.elements;
    const totalElements = heapItems.length;
    let currentIdx = startPosition;

    // Iterate until the heap property is restored for the element at currentIdx.
    while (true) {
      let leftChildIdx = ValueHeap.getLeftChildIndex(currentIdx);
      let rightChildIdx = ValueHeap.getRightChildIndex(currentIdx);
      let largestIdx = currentIdx; // Assume current element is the largest initially.

      // Check if the left child exists and is larger than the current largest.
      if (leftChildIdx < totalElements && heapItems[leftChildIdx] > heapItems[largestIdx]) {
        largestIdx = leftChildIdx;
      }

      // Check if the right child exists and is larger than the current largest.
      if (rightChildIdx < totalElements && heapItems[rightChildIdx] > heapItems[largestIdx]) {
        largestIdx = rightChildIdx;
      }

      // If the largest element is not the current element, a swap is needed.
      if (largestIdx !== currentIdx) {
        // Swap elements.
        let tempValue = heapItems[currentIdx];
        heapItems[currentIdx] = heapItems[largestIdx];
        heapItems[largestIdx] = tempValue;

        currentIdx = largestIdx; // Continue heapifying down from the swapped position.
      } else {
        // If current element is already the largest among itself and its children,
        // the heap property is restored for this subtree.
        break;
      }
    }
  }
}

/**
 * Self-invoking function to manage heap operations based on standard input.
 * This function handles reading commands, processing them with the ValueHeap,
 * and writing results to standard output.
 */
(function processHeapOperations() {
  const fileSystemModule = require('fs');
  const inputFilePath = '/dev/stdin';
  let rawInputContent;

  try {
    // Attempt to synchronously read the input file.
    rawInputContent = fileSystemModule.readFileSync(inputFilePath, { encoding: 'utf8' });
  } catch (readErr) {
    // Log an error and exit if input file cannot be read.
    console.error(`Error reading input from ${inputFilePath}:`, readErr.message);
    return;
  }

  // Process the raw input: trim whitespace, split into lines, and filter out any empty lines.
  // This ensures only valid command lines are processed, robustly handling various input formats.
  const commandLines = rawInputContent
    .trim()
    .split('\n')
    .filter(line => line.trim() !== '');

  const maxHeapInstance = new ValueHeap(); // Instantiate our custom max heap.
  let collectedOutput = ''; // A buffer to accumulate all output strings for efficient single write.

  // Iterate over each command line and execute the corresponding heap operation.
  for (const singleCommand of commandLines) {
    const operationTypeChar = singleCommand.charAt(0); // Get the first character to determine operation.

    switch (operationTypeChar) {
      case 'i': // 'insert' operation
        const commandParts = singleCommand.split(' ');
        const numericValue = parseInt(commandParts[1], 10); // Parse the value as an integer.

        // Validate the parsed numeric value before adding to the heap.
        if (!isNaN(numericValue)) {
          maxHeapInstance.addValue(numericValue);
        } else {
          console.error(`Skipping invalid insert command: '${singleCommand}' - value is not a valid number.`);
        }
        break;

      case 'e': // 'extract' operation
        const resultValue = maxHeapInstance.extractMax();
        // Only append to output if a value was successfully extracted (i.e., heap was not empty).
        if (resultValue !== null) {
          collectedOutput += `${resultValue}\n`;
        }
        break;

      default:
        // Log a warning for any command types that are not recognized.
        console.warn(`Encountered unknown command type: '${singleCommand}'. Skipping.`);
        break;
    }
  }

  // After processing all commands, write the entire accumulated output to standard output.
  process.stdout.write(collectedOutput);
})();