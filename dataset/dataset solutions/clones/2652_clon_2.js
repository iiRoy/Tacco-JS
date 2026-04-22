// This module provides utilities for parsing input data from a multi-line string.
var INPUT_PARSER = ( function ( ) {

  /**
   * Factory function to create a new input parser instance.
   * @param {string} inputString The raw string containing all input lines.
   * @returns {InputReader} A new instance of the InputReader.
   */
  function createParser ( inputString ) {
    return new InputReader ( inputString );
  }

  /**
   * Constructor for the InputReader class.
   * Manages the parsing of input lines and tokens.
   * @param {string} inputString The full string data to be processed.
   */
  function InputReader ( inputString ) {
    this._sourceLines = inputString
      .trim ( )
      .split ( "\n" ); // Store lines after trimming and splitting
    this._currentLineIndex = 0; // Initialize line cursor
  }

  // Define methods for the InputReader prototype.

  /**
   * Fetches the next token from the current line.
   * If the current line is a string, it's split and reversed to pop tokens from the end.
   * Advances the line cursor if the current line becomes empty.
   * @param {boolean} returnAsString If true, returns the token as a string; otherwise, converts to a number.
   * @returns {string|number} The extracted token.
   */
  InputReader.prototype.fetchNextToken = function ( returnAsString ) {
    var currentLines = this._sourceLines,
      lineCursor = this._currentLineIndex,
      extractedToken;

    // If the current line hasn't been processed into an array of tokens yet
    if ( typeof currentLines[lineCursor] === "string" ) {
      currentLines[lineCursor] = currentLines[lineCursor]
        .split ( " " )
        .reverse ( );
    }

    extractedToken = currentLines[lineCursor].pop ( ); // Get the last token

    // If the current line is now empty, move to the next line
    if ( !currentLines[lineCursor].length ) {
      this._currentLineIndex++;
    }

    // Return as string or number based on the flag
    return returnAsString ? extractedToken : +extractedToken;
  };

  /**
   * Retrieves all tokens from the current line.
   * Advances the line cursor to the next line.
   * @param {boolean} asStrings If true, returns tokens as strings; otherwise, converts to numbers.
   * @returns {Array<string|number>} An array of tokens from the line.
   */
  InputReader.prototype.retrieveLineTokens = function ( asStrings ) {
    // Get the current line, split it by space, and then increment the line index
    var lineSegments = this._sourceLines[this._currentLineIndex++].split ( " " );
    // Return as strings or map to numbers
    return asStrings ? lineSegments : lineSegments.map ( tokenItem => +tokenItem );
  };

  /**
   * Reads a specified number of lines and parses them as a matrix.
   * Advances the line cursor by the number of rows read.
   * @param {number} numRows The number of rows to read for the matrix.
   * @param {boolean} keepRaw If true, returns string arrays; otherwise, converts cell values to numbers.
   * @returns {Array<Array<string|number>>} A 2D array (matrix) of values.
   */
  InputReader.prototype.getMatrixData = function ( numRows, keepRaw ) {
    // Slice the required number of lines and map each line to an array of tokens
    var matrixRows = this._sourceLines
      .slice ( this._currentLineIndex, ( this._currentLineIndex += numRows ) )
      .map ( rowString => rowString.split ( " " ) );

    // Return raw string matrix or convert cell values to numbers
    return keepRaw ? matrixRows : matrixRows.map ( rowString => rowString.map ( cellString => +cellString ) );
  };

  /**
   * Reads a specified number of lines as raw text.
   * Advances the line cursor by the number of lines read.
   * @param {number} lineCount The number of lines to read.
   * @param {boolean} preserveText If true, returns lines as strings; otherwise, converts to numbers.
   * @returns {Array<string|number>} An array of lines.
   */
  InputReader.prototype.getRawLines = function ( lineCount, preserveText ) {
    // Slice the required number of lines
    var lineCollection = this._sourceLines
      .slice ( this._currentLineIndex, ( this._currentLineIndex += lineCount ) );

    // Return raw text lines or convert to numbers
    return preserveText ? lineCollection : lineCollection.map ( lineContent => +lineContent );
  };

  return createParser; // The factory function is the public interface
} ) ( );


// Initialize the input data stream by reading from standard input.
var dataStream = INPUT_PARSER ( require ( "fs" )
  .readFileSync ( "/dev/stdin", "utf8" ) );


/**
 * Dynamically constructs a multi-dimensional array with a given initial value.
 * @param {any} initialValue The value to fill the innermost array elements with.
 * @param {...number} dimArguments The dimensions of the array (e.g., dim1, dim2, dim3).
 * @returns {Array} The dynamically created multi-dimensional array.
 */
function buildMultiArray ( initialValue ) {
  var dimArguments = arguments,
    dimLength = dimArguments.length,
    arrayCreationString = "Array(dimArguments[" + --dimLength + "]).fill(0).map(elementPlaceholder=>{return " + initialValue + ";})";

  // Build the string for nested array creation
  while ( --dimLength ) {
    arrayCreationString = "Array(dimArguments[" + dimLength + "]).fill(0).map(elementPlaceholder=>" + arrayCreationString + ")"
  }

  return eval ( arrayCreationString ); // Execute the generated string as code
}


// Self-executing anonymous function to encapsulate the MinHeap structure.
var MinHeapStructure = ( function ( ) {

  /**
   * Factory method to create a new MinHeap instance.
   * @returns {MinHeap} A new MinHeap object.
   */
  function createMinHeap ( ) {
    return new MinHeap ( );
  }

  /**
   * Constructor for the MinHeap (Priority Queue) data structure.
   * Uses an array to represent a binary heap.
   */
  function MinHeap ( ) {
    this.internalStorage = [ ]; // The array that stores heap elements
  }

  /**
   * Inserts a new element into the heap while maintaining the min-heap property.
   * @param {Array<number, any>} newItem An array where newItem[0] is the priority (key)
   *                                    and newItem[1] is the associated value.
   */
  MinHeap.prototype.insertElement = function ( newItem ) {
    var storageRef = this.internalStorage,
      currentIndex = storageRef.length++, // Get current length, then increment for new element's position
      parentIndex;

    // Bubble up the new element if it's smaller than its parent
    while ( currentIndex ) {
      parentIndex = ( currentIndex - 1 ) >> 1; // Calculate parent index
      if ( storageRef[parentIndex][0] <= newItem[0] ) break; // If parent is smaller or equal, correct position found
      storageRef[currentIndex] = storageRef[parentIndex]; // Move parent down
      currentIndex = parentIndex; // Move up to parent's position
    }
    storageRef[currentIndex] = newItem; // Place the new element
  };

  /**
   * Extracts the minimum element (root) from the heap and re-heapifies.
   * @returns {Array<number, any>} The minimum element (root) of the heap.
   */
  MinHeap.prototype.extractMin = function ( ) {
    var heapRef = this.internalStorage,
      minValue = heapRef[0], // The minimum value is always at the root
      lastElement = heapRef.pop ( ), // Remove the last element for re-heapification
      currentSize = heapRef.length,
      idx = 0,
      childIdx;

    // If the heap is empty after pop, return the removed minimum value
    if ( currentSize === 0 ) return minValue;

    var halfSize = currentSize >> 1; // Optimization: only need to check up to half the size
    currentSize--; // Adjust currentSize for boundary checks

    // Bubble down the last element to its correct position
    while ( idx < halfSize ) {
      childIdx = ( idx << 1 ) + 1; // Left child index
      // Check if right child exists and is smaller than left child
      if ( childIdx < currentSize && heapRef[childIdx + 1][0] < heapRef[childIdx][0] ) {
        childIdx++; // Use right child if it's smaller
      }
      if ( lastElement[0] <= heapRef[childIdx][0] ) break; // If lastElement is smaller or equal, correct position found
      heapRef[idx] = heapRef[childIdx]; // Move child up
      idx = childIdx; // Move down to child's position
    }
    heapRef[idx] = lastElement; // Place the last element

    return minValue; // Return the original minimum value
  };

  return createMinHeap; // The factory function is the public interface
} ) ( );


// Output the result of the main processing function to the console.
global.console.log ( processData ( ) );

/**
 * Main function to solve the problem.
 * Reads input, performs calculations, and returns the final answer.
 * @returns {number} The calculated result or -1 if no solution is found.
 */
function processData ( ) {
  // Read the total number of elements from the input stream.
  var totalElements = dataStream.fetchNextToken ( );

  // Read two lists of numbers from the input stream.
  var initialValues = dataStream.retrieveLineTokens ( );
  var targetValues = dataStream.retrieveLineTokens ( );

  // Initialize a min-priority queue.
  var minHeapInst = MinHeapStructure ( );

  // Iterate through elements to populate the priority queue and check initial conditions.
  for ( var elementIndex = 0; elementIndex < totalElements; elementIndex++ ) {
    // If initial and target values are the same, no operation needed for this element.
    if ( initialValues[elementIndex] === targetValues[elementIndex] ) continue;

    // If an initial value is greater than its target, no solution is possible.
    if ( initialValues[elementIndex] > targetValues[elementIndex] ) return -1;

    // Push the negative target value and its index into the priority queue.
    // Negative target value is used to simulate a max-heap for priority based on 'b' values.
    minHeapInst.insertElement ( [ -targetValues[elementIndex], elementIndex ] );
  }

  // Initialize the counter for operations.
  var operationCount = 0;

  // Process elements from the priority queue until it's empty.
  while ( minHeapInst.internalStorage.length ) {
    // Extract the item with the highest priority (smallest negative value, i.e., largest original 'b' value).
    var poppedItem = minHeapInst.extractMin ( );
    var currentElementIdx = poppedItem[1],
      originalValue = -poppedItem[0]; // Get the actual target value 'b[j]'

    // Calculate the sum of neighbors for the current element.
    // Neighbors are wrapped around using modulo operator.
    var neighborSum = targetValues[( currentElementIdx + totalElements - 1 ) % totalElements] + targetValues[( currentElementIdx + 1 ) % totalElements];

    // Calculate the number of full operations (integer division).
    var divisionResult = targetValues[currentElementIdx] / neighborSum | 0;

    // If divisionResult is 0, it means the current 'b[j]' cannot be reduced by neighbors,
    // and since a[j] < b[j], no solution is possible.
    if ( divisionResult === 0 ) return -1;

    // Add the number of operations to the total count.
    operationCount += divisionResult;

    // Update the current element's value by taking the remainder.
    targetValues[currentElementIdx] %= neighborSum;

    // Check conditions after modification.
    // If the value now matches the initial value, no more operations needed for this element.
    if ( initialValues[currentElementIdx] === targetValues[currentElementIdx] ) continue;

    // If the modified value is less than the initial value, no solution is possible.
    if ( initialValues[currentElementIdx] > targetValues[currentElementIdx] ) return -1;

    // If the value still needs reduction, re-insert it into the priority queue.
    minHeapInst.insertElement ( [ -targetValues[currentElementIdx], currentElementIdx ] );
  }

  return operationCount; // Return the total number of operations.
}