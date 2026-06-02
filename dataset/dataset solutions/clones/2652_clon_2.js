var INPUT_PARSER = (function() {
  // This factory function creates a new instance of the DataProcessor.
  function createParser(sourceText) {
    return new DataProcessor(sourceText);
  }

  // The DataProcessor constructor initializes the input source.
  function DataProcessor(sourceText) {
    // Stores the input text, split into individual lines after trimming.
    this._sourceLines = sourceText.trim().split('\n');
    // Keeps track of the current line being processed.
    this._currentLineIndex = 0x0;
  }

  // Reads a single token (number or string) from the current line.
  DataProcessor.prototype.readNumber = function(asString) {
    var lines = this._sourceLines;
    var lineIdx = this._currentLineIndex;
    var resultToken;

    // If the current line is still a single string, split it into tokens.
    // Tokens are reversed to allow efficient popping from the end.
    if (typeof lines[lineIdx] === 'string') {
      lines[lineIdx] = lines[lineIdx].split(' ').reverse();
    }

    // Extract the last token from the current line.
    resultToken = lines[lineIdx].pop();

    // If the current line is now empty, advance to the next line.
    if (!lines[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return the token as a string or convert it to a number based on the 'asString' flag.
    return asString ? resultToken : Number(resultToken);
  };

  // Reads an entire line of tokens, converting them to numbers by default.
  DataProcessor.prototype.readNumbersLine = function(asStrings) {
    // Get the current line, split it by spaces, and then advance the line index.
    var lineTokens = this._sourceLines[this._currentLineIndex++].split(' ');
    // Return tokens as strings or map them to numbers.
    return asStrings ? lineTokens : lineTokens.map(val => Number(val));
  };

  // Reads a block of 'numRows' lines, treating each as a row in a matrix.
  DataProcessor.prototype.readMatrix = function(numRows, asStrings) {
    // Extract 'numRows' lines, split each into tokens, and then advance the line index.
    var matrixData = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows).map(line => line.split(' '));
    // Return the matrix as strings or map all elements to numbers.
    return asStrings ? matrixData : matrixData.map(row => row.map(elem => Number(elem)));
  };

  // Reads 'numLines' raw lines, converting each line to a number by default.
  DataProcessor.prototype.readRawLines = function(numLines, asStrings) {
    // Extract 'numLines' lines and then advance the line index.
    var rawLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
    // Return lines as strings or map them to numbers.
    return asStrings ? rawLines : rawLines.map(lineVal => Number(lineVal));
  };

  return createParser;
})();

// Initialize the input data parser by reading from standard input.
var inputData = INPUT_PARSER(require('fs').readFileSync('/dev/stdin', 'utf8'));

// Function to create a multi-dimensional array initialized with a specific value.
function createMultiDimArray(initialValue) {
  var dimensions = arguments; // All arguments after initialValue are dimensions.
  var dimCount = dimensions.length; // Total number of dimensions.
  // Construct the string for the innermost array creation.
  var arrayCreationString = 'Array(dimensions[' + --dimCount + ']).fill(0x0).map(x=>{return ' + initialValue + ';})';
  // Loop to build up the string for higher dimensions.
  while (--dimCount) {
    arrayCreationString = 'Array(dimensions[' + dimCount + ']).fill(0x0).map(x=>' + arrayCreationString + ')';
  }
  // Evaluate the constructed string to create the array.
  return eval(arrayCreationString);
}

// MinHeap implementation for priority queue functionality.
var MinHeap = (function() {
  // Factory function to create a new MinHeap instance.
  function createMinHeap() {
    return new MinHeapConstructor();
  }

  // MinHeap constructor.
  function MinHeapConstructor() {
    this.elements = []; // The array that stores the heap elements.
  }

  // Inserts an item into the min-heap, maintaining heap property.
  MinHeapConstructor.prototype.insert = function(itemToInsert) {
    var heapArray = this.elements;
    var currentIndex = heapArray.length++; // Get the new index for the item and increment heap size.
    var parentIndex;

    // Bubble up the new item until its correct position is found.
    while (currentIndex) {
      parentIndex = (currentIndex - 0b1) >> 0b1; // Calculate parent index.
      // If the parent is smaller or equal, the item is in its correct place.
      if (heapArray[parentIndex][0x0] <= itemToInsert[0x0]) {
        break;
      }
      // Otherwise, move the parent down and continue bubbling up.
      heapArray[currentIndex] = heapArray[parentIndex];
      currentIndex = parentIndex;
    }
    heapArray[currentIndex] = itemToInsert; // Place the item in its final position.
  };

  // Extracts and returns the minimum item from the heap.
  MinHeapConstructor.prototype.extractMin = function() {
    var heapArray = this.elements;
    var minElement = heapArray[0x0]; // The minimum element is always at the root.
    var lastElement = heapArray.pop(); // Remove the last element from the heap.
    var heapSize = heapArray.length;
    var rootIndex = 0x0;
    var childIndex;

    // If the heap becomes empty after popping, return the extracted min element.
    if (heapSize === 0x0) {
      return minElement;
    }

    var halfHeapSize = heapSize >> 0b1; // Optimization: only need to check up to half the heap.
    heapSize--; // Adjust heapSize for boundary checks in the loop.

    // Bubble down the 'lastElement' from the root to maintain heap property.
    while (rootIndex < halfHeapSize) {
      childIndex = (rootIndex << 0b1) + 0b1; // Calculate the left child index.
      // Check if a right child exists and if it's smaller than the left child.
      if (childIndex < heapSize && heapArray[childIndex + 0b1][0x0] < heapArray[childIndex][0x0]) {
        childIndex++; // Use the right child if it's smaller.
      }
      // If 'lastElement' is smaller than or equal to the smallest child, its position is found.
      if (lastElement[0x0] <= heapArray[childIndex][0x0]) {
        break;
      }
      // Otherwise, move the child up and continue bubbling down.
      heapArray[rootIndex] = heapArray[childIndex];
      rootIndex = childIndex;
    }
    heapArray[rootIndex] = lastElement; // Place 'lastElement' in its final position.
    return minElement; // Return the original minimum element.
  };

  return createMinHeap;
})();

// Output the result of the main problem-solving function.
console.log(solveProblem());

// The main function that implements the problem's logic.
function solveProblem() {
  // Read the total count of elements.
  var count = inputData.readNumber();
  // Read the first array.
  var arrayA = inputData.readNumbersLine();
  // Read the second array.
  var arrayB = inputData.readNumbersLine();

  // Initialize a min-priority queue.
  var minPriorityQueue = MinHeap();

  // Initial check and population of the priority queue.
  for (var idx = 0x0; idx < count; idx++) {
    // If elements are already equal, no operation needed for this index.
    if (arrayA[idx] === arrayB[idx]) {
      continue;
    }
    // If arrayA[idx] is greater than arrayB[idx], it's an impossible state.
    if (arrayA[idx] > arrayB[idx]) {
      return -0b1; // Indicate failure.
    }
    // Push the negative of arrayB[idx] and its index.
    // Using negative values allows the min-heap to effectively act as a max-heap
    // for the original arrayB values (smallest negative means largest positive).
    minPriorityQueue.insert([-arrayB[idx], idx]);
  }

  var resultValue = 0x0; // Initialize the counter for operations.

  // Process elements from the priority queue until it's empty.
  while (minPriorityQueue.elements.length) {
    // Extract the item with the smallest negative value (largest original B value).
    var extractedItem = minPriorityQueue.extractMin();
    var currentIdx = extractedItem[0b1]; // Get the original index.
    var currentVal = -extractedItem[0x0]; // Get the actual positive B value.

    // Calculate the sum of the current element's neighbors in arrayB.
    var neighborSum = arrayB[(currentIdx + count - 0b1) % count] + arrayB[(currentIdx + 0b1) % count];

    // Perform integer division.
    var divisionResult = arrayB[currentIdx] / neighborSum | 0x0;

    // If the division result is zero, it means arrayB[currentIdx] cannot be reduced
    // further by its neighbors to reach arrayA[currentIdx] (if arrayA[currentIdx] < arrayB[currentIdx]).
    if (divisionResult === 0x0) {
      return -0b1; // Indicate failure.
    }

    // Add the number of operations to the total.
    resultValue += divisionResult;
    // Update arrayB[currentIdx] using the modulo operation.
    arrayB[currentIdx] %= neighborSum;

    // Re-check the condition for the modified element.
    if (arrayA[currentIdx] === arrayB[currentIdx]) {
      continue; // If equal, this element is now satisfied.
    }
    // If arrayA[currentIdx] became greater than arrayB[currentIdx] after modification, it's impossible.
    if (arrayA[currentIdx] > arrayB[currentIdx]) {
      return -0b1; // Indicate failure.
    }
    // If arrayA[currentIdx] is still less than arrayB[currentIdx], re-insert into the priority queue.
    minPriorityQueue.insert([-arrayB[currentIdx], currentIdx]);
  }

  return resultValue; // Return the final count of operations.
}
