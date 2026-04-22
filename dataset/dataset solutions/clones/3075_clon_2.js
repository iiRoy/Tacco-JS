/*
 * This module provides a utility for processing input data from a string.
 * It allows parsing tokens, lines, or blocks of numbers.
 */
var InputProcessorModule = ( function () {
  /**
   * Creates a new input stream processor.
   * @param {string} rawSourceString - The raw input string to process.
   * @returns {DataStream} An instance of the DataStream class.
   */
  function createProcessor( rawSourceString ) {
    return new DataStream( rawSourceString );
  }

  /**
   * Represents a stream of data, allowing sequential parsing.
   * @class
   * @param {string} streamInput - The string containing all input data.
   */
  function DataStream( streamInput ) {
    // Stores all lines of the input, trimmed and split by newline.
    this._dataLines = streamInput.trim().split( "\n" );
    // Keeps track of the current line being processed.
    this._currentLineIndex = 0;
  }

  /**
   * Extracts the next token from the current line.
   * If a line is processed, it moves to the next one.
   * @param {boolean} [returnAsString=false] - If true, returns the token as a string; otherwise, converts to a number.
   * @returns {(string|number)} The next token.
   */
  DataStream.prototype.getNextToken = function ( returnAsString ) {
    var currentLines = this._dataLines;
    var lineIndex = this._currentLineIndex;
    var extractedValue;

    // If the current line hasn't been split into tokens yet, do it.
    // The original logic reverses the split array; we maintain this behavior.
    if ( typeof currentLines[ lineIndex ] === "string" ) {
      currentLines[ lineIndex ] = currentLines[ lineIndex ].split( " " ).reverse();
    }

    // Pop the last token (which is the first after reversal).
    extractedValue = currentLines[ lineIndex ].pop();

    // If the current line is exhausted, advance to the next line.
    if ( !currentLines[ lineIndex ].length ) {
      this._currentLineIndex++;
    }

    // Return as string or number based on the flag.
    return returnAsString ? extractedValue : +extractedValue;
  };

  /**
   * Reads an entire line and splits it into tokens.
   * Advances the line index after reading.
   * @param {boolean} [returnAsString=false] - If true, returns tokens as strings; otherwise, converts to numbers.
   * @returns {(string[]|number[])} An array of tokens from the line.
   */
  DataStream.prototype.getNextLine = function ( returnAsString ) {
    var lineTokens = this._dataLines[ this._currentLineIndex++ ].split( " " );
    // Map tokens to numbers if not requested as strings.
    return returnAsString ? lineTokens : lineTokens.map( ( val ) => +val );
  };

  /**
   * Reads a specified number of lines, treating each as a row in a matrix.
   * @param {number} numRows - The number of lines (rows) to read.
   * @param {boolean} [returnAsString=false] - If true, returns matrix elements as strings; otherwise, converts to numbers.
   * @returns {(string[][]|number[][])} A 2D array (matrix) of values.
   */
  DataStream.prototype.getNextMatrix = function ( numRows, returnAsString ) {
    // Slice the required lines and map each to an array of split tokens.
    var matrixRows = this._dataLines
      .slice( this._currentLineIndex, ( this._currentLineIndex += numRows ) )
      .map( ( line ) => line.split( " " ) );

    // If not returning as string, map all elements to numbers.
    return returnAsString
      ? matrixRows
      : matrixRows.map( ( row ) => row.map( ( element ) => +element ) );
  };

  /**
   * Reads a specified number of lines, returning each line as a single value.
   * @param {number} numEntries - The number of lines to read.
   * @param {boolean} [returnAsString=false] - If true, returns values as strings; otherwise, converts to numbers.
   * @returns {(string[]|number[])} An array of values, each from a new line.
   */
  DataStream.prototype.getNextRows = function ( numEntries, returnAsString ) {
    // Slice the required lines.
    var rowValues = this._dataLines.slice(
      this._currentLineIndex,
      ( this._currentLineIndex += numEntries )
    );

    // If not returning as string, map all elements to numbers.
    return returnAsString ? rowValues : rowValues.map( ( element ) => +element );
  };

  // The IIFE returns the factory function `createProcessor`.
  return createProcessor;
} )();

/*
 * Initialize the input reader by reading from standard input.
 * The 'utf8' encoding ensures proper character handling.
 */
var inputReader = InputProcessorModule( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * The dimensions are passed as additional arguments after the initial value.
 * Example: createMultiDimArray(0, 2, 3) creates a 2x3 array filled with 0s.
 * @param {*} initialValue - The value to fill the array with.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} The multi-dimensional array.
 */
function createMultiDimArray( initialValue ) {
  var dimensionArgs = arguments;
  var argLength = dimensionArgs.length;
  // Start building the string for the innermost array.
  var arrayCreationString = "Array(dimensionArgs[" + --argLength + "]).fill(initialValue)";
  // Build the string for outer dimensions, mapping with 0s for intermediate layers.
  while ( --argLength ) {
    arrayCreationString =
      "Array(dimensionArgs[" + argLength + "]).fill(0).map((_)=> " + arrayCreationString + ")";
  }
  // Use eval to dynamically create the array structure.
  return eval( arrayCreationString );
}

/**
 * Implements the Quickselect algorithm to find the k-th smallest element in an array.
 * This function modifies the input array in place.
 * @param {Array<number>} targetArray - The array to search within.
 * @param {number} targetIndex - The 1-based index (k) of the element to find.
 * @returns {number} The k-th smallest element.
 */
function findKthSmallest( targetArray, targetIndex ) {
  // Convert 1-based index to 0-based.
  --targetIndex;

  var leftBound = 0;
  var rightBound = targetArray.length - 1;

  // Continue partitioning until the k-th element is found.
  while ( leftBound < rightBound ) {
    var leftPointer = leftBound - 1;
    var rightPointer = rightBound;
    // Median-of-three pivot selection (simple middle element here).
    var pivotIndex = ( leftBound + rightBound ) >> 1;
    var pivotValue = targetArray[ pivotIndex ];
    var tempStorage;

    // Move pivot to the end for partitioning.
    targetArray[ pivotIndex ] = targetArray[ rightBound ];

    // Lomuto partition scheme variant.
    while ( 1 ) {
      // Find element greater than pivot from left.
      while ( leftPointer < rightPointer ) {
        if ( pivotValue < targetArray[ ++leftPointer ] ) {
          break;
        }
      }
      // Find element smaller than pivot from right.
      while ( leftPointer < rightPointer ) {
        if ( targetArray[ --rightPointer ] < pivotValue ) {
          break;
        }
      }

      // If pointers cross, partitioning for this segment is complete.
      if ( rightPointer <= leftPointer ) {
        break;
      }

      // Swap elements.
      tempStorage = targetArray[ leftPointer ];
      targetArray[ leftPointer ] = targetArray[ rightPointer ];
      targetArray[ rightPointer ] = tempStorage;
    }

    // Place pivot in its final sorted position.
    targetArray[ rightBound ] = targetArray[ leftPointer ];
    targetArray[ leftPointer ] = pivotValue;

    // Adjust bounds based on pivot's position relative to targetIndex.
    if ( leftPointer < targetIndex ) {
      leftBound = leftPointer + 1;
    } else if ( targetIndex < leftPointer ) {
      rightBound = leftPointer - 1;
    } else {
      // k-th element found at leftPointer.
      break;
    }
  }
  // Return the element at the target index.
  return targetArray[ targetIndex ];
}

/*
 * Executes the main logic of the program and prints the result to console.
 */
console.log( executeSolution() );

/**
 * Main function to solve the problem.
 * Reads input, processes arrays, finds top K sums, and formats output.
 * @returns {string} The formatted string of the final K largest sums.
 */
function executeSolution() {
  // Read four integer parameters from input.
  var firstCount = inputReader.getNextToken();
  var secondCount = inputReader.getNextToken();
  var thirdCount = inputReader.getNextToken();
  var desiredElements = inputReader.getNextToken();

  // Read three arrays of numbers, sort them in descending order.
  var firstSet = inputReader.getNextLine().sort( ( valA, valB ) => valB - valA );
  var secondSet = inputReader.getNextLine().sort( ( valA, valB ) => valB - valA );
  var thirdSet = inputReader.getNextLine().sort( ( valA, valB ) => valB - valA );

  // Calculate all possible sums of elements from firstSet and secondSet.
  var intermediateSums = [];
  for ( var loopCounterA = 0; loopCounterA < firstCount; loopCounterA++ ) {
    for ( var loopCounterB = 0; loopCounterB < secondCount; loopCounterB++ ) {
      intermediateSums.push( firstSet[ loopCounterA ] + secondSet[ loopCounterB ] );
    }
  }

  // If the number of intermediate sums exceeds desiredElements,
  // reduce the array to contain only the top desiredElements sums.
  if ( desiredElements < intermediateSums.length ) {
    intermediateSums = extractTopK( intermediateSums, desiredElements );
  }

  // Sort the intermediate sums in descending order.
  intermediateSums.sort( ( valA, valB ) => valB - valA );

  // Calculate final sums by adding elements from thirdSet to intermediateSums.
  var finalResults = [];
  for ( var loopCounterA = 0; loopCounterA < thirdCount; loopCounterA++ ) {
    // Determine how many sums to generate for the current element of thirdSet.
    // This is limited by remaining desiredElements and available intermediateSums.
    var limitValue = Math.min( intermediateSums.length, desiredElements - loopCounterA );
    for ( var loopCounterB = 0; loopCounterB < limitValue; loopCounterB++ ) {
      finalResults.push( thirdSet[ loopCounterA ] + intermediateSums[ loopCounterB ] );
    }
  }

  // If the number of final results exceeds desiredElements,
  // reduce the array to contain only the top desiredElements sums.
  if ( desiredElements < finalResults.length ) {
    finalResults = extractTopK( finalResults, desiredElements );
  }

  // Sort the final results in descending order and join them with newlines.
  return finalResults.sort( ( valA, valB ) => valB - valA ).join( "\n" );
}

/**
 * Extracts the `numElements` largest elements from an input collection.
 * This is done efficiently using Quickselect to find the (N-k)-th smallest element,
 * then slicing the array.
 * @param {Array<number>} inputCollection - The array to process.
 * @param {number} numElements - The number of largest elements to extract.
 * @returns {Array<number>} An array containing the top `numElements` largest values.
 */
function extractTopK( inputCollection, numElements ) {
  // Find the (length - numElements)-th smallest element.
  // This effectively partitions the array such that all elements after this index
  // are the largest 'numElements' values.
  findKthSmallest( inputCollection, inputCollection.length - numElements );
  // Return the slice containing these largest elements.
  return inputCollection.slice( inputCollection.length - numElements );
}