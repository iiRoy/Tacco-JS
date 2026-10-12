var DATA_PARSER = (function () {
  // Factory function to create an InputProcessor instance
  function createParser(sourceContent) {
    return new InputProcessor(sourceContent);
  }

  // Constructor for the InputProcessor class
  function InputProcessor(sourceContent) {
    // Store the input string, split into lines and trimmed
    this._sourceLines = sourceContent.trim().split("\n");
    // Keep track of the current line being processed
    this._currentLineIndex = 0;
  }

  // Method to read a single value from the current line
  InputProcessor.prototype.readSingleValue = function (asString) {
    var lineData = this._sourceLines,
      lineIdx = this._currentLineIndex,
      extractedValue;

    // If the current line hasn't been split into tokens yet, do it (and reverse for pop efficiency)
    if (typeof lineData[lineIdx] === "string") {
      lineData[lineIdx] = lineData[lineIdx].split(" ").reverse();
    }

    // Pop the last token from the current line's array
    extractedValue = lineData[lineIdx].pop();

    // If the current line is now empty, advance to the next line
    if (!lineData[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return as string or number based on the 'asString' flag
    return asString ? extractedValue : +extractedValue;
  };

  // Method to read an entire line as a list of values
  InputProcessor.prototype.readListOfValues = function (asStrings) {
    // Get the current line, split by space, and advance the line index
    var values = this._sourceLines[this._currentLineIndex++].split(" ");
    // Return as strings or numbers based on the 'asStrings' flag
    return asStrings ? values : values.map((val) => +val);
  };

  // Method to read a matrix (multiple lines, each split into values)
  InputProcessor.prototype.readMatrix = function (numRows, asStrings) {
    // Slice the required number of rows, split each into values
    var matrixRows = this._sourceLines
      .slice(this._currentLineIndex, (this._currentLineIndex += numRows))
      .map((row) => row.split(" "));
    // Return as strings or numbers based on the 'asStrings' flag
    return asStrings
      ? matrixRows
      : matrixRows.map((row) => row.map((val) => +val));
  };

  // Method to read a specified number of raw lines
  InputProcessor.prototype.readRawLines = function (lineCount, asStrings) {
    // Slice the required number of raw lines
    var rawLines = this._sourceLines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += lineCount)
    );
    // Return as strings or numbers based on the 'asStrings' flag
    return asStrings ? rawLines : rawLines.map((val) => +val);
  };

  return createParser;
})();

var inputReader = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Helper function to create multi-dimensional arrays
function createMultiDimArray(initialValue) {
  var dimensions = arguments,
    dimLength = dimensions.length,
    arrayCreationString =
      "Array(dimensions[" +
      --dimLength +
      "]).fill(0).map(x=>{return " +
      initialValue +
      ";})";
  // Build the string for nested array creation
  while (--dimLength) {
    arrayCreationString =
      "Array(dimensions[" + dimLength + "]).fill(0).map(x=>" + arrayCreationString + ")";
  }
  // Evaluate the string to create the array
  return eval(arrayCreationString);
}

var MinHeapFactory = (function () {
  // Factory function to create a new MinPriorityQueue instance
  function createMinHeap() {
    return new MinPriorityQueue();
  }

  // Constructor for the MinPriorityQueue (min-heap)
  function MinPriorityQueue() {
    this._internalHeap = []; // The array representing the heap
  }

  // Inserts an element into the min-heap
  MinPriorityQueue.prototype.insertElement = function (newItem) {
    var heapRef = this._internalHeap,
      currentIndex = heapRef.length++, // New element goes at the end
      parentIndex;

    // Bubble up the new element to maintain heap property
    while (currentIndex) {
      parentIndex = (currentIndex - 1) >> 1; // Parent index calculation
      // If parent is smaller or equal, heap property is satisfied
      if (heapRef[parentIndex][0] <= newItem[0]) break;
      // Otherwise, swap with parent
      heapRef[currentIndex] = heapRef[parentIndex];
      currentIndex = parentIndex;
    }
    // Place the new item in its final position
    heapRef[currentIndex] = newItem;
  };

  // Extracts the minimum element (root) from the min-heap
  MinPriorityQueue.prototype.extractMin = function () {
    var heapRef = this._internalHeap,
      minElement = heapRef[0], // The minimum element is always at the root
      lastElement = heapRef.pop(), // Remove the last element
      heapSize = heapRef.length,
      currentIndex = 0,
      childIndex;

    // If the heap is empty after popping, return the minElement
    if (heapSize === 0) return minElement;

    // Calculate half the heap size for loop optimization
    var halfHeapSize = heapSize >> 1;
    heapSize--; // Adjust heapSize for 0-based indexing in loop condition

    // Bubble down the last element to maintain heap property
    while (currentIndex < halfHeapSize) {
      childIndex = (currentIndex << 1) + 1; // Left child index
      // Check if right child exists and is smaller than left child
      if (
        childIndex < heapSize &&
        heapRef[childIndex + 1][0] < heapRef[childIndex][0]
      ) {
        childIndex++; // Use the right child
      }
      // If the last element is smaller or equal to its smallest child, heap property is satisfied
      if (lastElement[0] <= heapRef[childIndex][0]) break;
      // Otherwise, swap with the smallest child
      heapRef[currentIndex] = heapRef[childIndex];
      currentIndex = childIndex;
    }
    // Place the last element in its final position
    heapRef[currentIndex] = lastElement;
    return minElement; // Return the original minimum element
  };

  return createMinHeap;
})();

console.log(solveProblem());

function solveProblem() {
  // Read the number of elements
  var elementCount = inputReader.readSingleValue();
  // Read array A
  var arrayA = inputReader.readListOfValues();
  // Read array B
  var arrayB = inputReader.readListOfValues();

  // Initialize a min-priority queue
  var minPQueue = MinHeapFactory();

  // Populate the priority queue based on initial conditions
  for (var loopIndex = 0; loopIndex < elementCount; loopIndex++) {
    // If elements are already equal, no operation needed for this index
    if (arrayA[loopIndex] === arrayB[loopIndex]) continue;
    // If A[i] is greater than B[i], it's impossible to reach A[i] == B[i]
    if (arrayA[loopIndex] > arrayB[loopIndex]) return -1;
    // Push [-B[i], i] into the priority queue.
    // This effectively makes it a max-heap based on B[i] values,
    // as the smallest negative value (largest positive B[i]) will have highest priority.
    minPQueue.insertElement([-arrayB[loopIndex], loopIndex]);
  }

  // Initialize the total number of operations
  var resultValue = 0;

  // Process elements from the priority queue until it's empty
  while (minPQueue._internalHeap.length) {
    // Get the element with the largest B[j] (smallest -B[j])
    var poppedItem = minPQueue.extractMin();
    var currentIdx = poppedItem[1]; // The index of the element

    // Calculate the sum of neighbors for the current index
    // (j + n - 1) % n for the left neighbor, (j + 1) % n for the right neighbor
    var neighborSum =
      arrayB[(currentIdx + elementCount - 1) % elementCount] +
      arrayB[(currentIdx + 1) % elementCount];

    // Calculate the number of operations needed for this element
    // (b[j] - a[j]) / y, floored to an integer
    var operationCount = ((arrayB[currentIdx] - arrayA[currentIdx]) / neighborSum) | 0;

    // If no operations can be performed (z is 0), it's impossible
    // This implies that b[j] - a[j] is positive but less than neighborSum,
    // and we can't reduce b[j] to a[j] or below using only neighborSum.
    // Or, if neighborSum is 0, this would also be 0.
    if (operationCount === 0) return -1;

    // Add the operations to the total count
    resultValue += operationCount;
    // Update b[j] by subtracting y * z
    arrayB[currentIdx] -= neighborSum * operationCount;

    // Re-check conditions for the updated b[j]
    if (arrayA[currentIdx] === arrayB[currentIdx]) continue; // If now equal, done with this index
    if (arrayA[currentIdx] > arrayB[currentIdx]) return -1; // If A[j] > B[j], impossible

    // If B[j] is still greater than A[j], re-add it to the priority queue
    minPQueue.insertElement([-arrayB[currentIdx], currentIdx]);
  }

  // Return the total number of operations
  return resultValue;
}
