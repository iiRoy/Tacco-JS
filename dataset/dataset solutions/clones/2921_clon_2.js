/* This module provides utilities for parsing input data streams. */
var DATA_ACQUISITION_UTILITY = ( function ( ) {

  // --- Internal Helper Functions ---

  /**
   * Factory function to instantiate an InputDataHandler.
   * @param {string} rawDataString - The complete input string.
   * @returns {InputDataHandler} A new data handler instance.
   */
  function createInputProcessor ( rawDataString ) {
    return new InputDataHandler( rawDataString );
  }

  /**
   * Constructor for handling and processing input data lines.
   * @param {string} rawDataString - The raw string input, usually from stdin.
   */
  function InputDataHandler ( rawDataString ) {
    this._linesOfData = rawDataString.trim( ).split( "\n" ); // Split the input into an array of lines
    this._currentLinePointer = 0; // Initialize pointer to the first line
  }

  // --- InputDataHandler Prototype Methods ---

  InputDataHandler.prototype.retrieveSingleValue = function ( returnAsString ) {
    var currentLineBuffer = this._linesOfData,
        lineIndexSnapshot = this._currentLinePointer,
        extractedToken;

    // If the current line hasn't been split into tokens yet, do so.
    // We reverse it to easily pop elements from the "end" (which is actually the start of the line).
    if ( typeof currentLineBuffer[ lineIndexSnapshot ] === "string" ) {
      currentLineBuffer[ lineIndexSnapshot ] = currentLineBuffer[ lineIndexSnapshot ].split( " " ).reverse( );
    }

    extractedToken = currentLineBuffer[ lineIndexSnapshot ].pop( ); // Extract the last token from the current line's buffer

    // If the current line is now empty, advance the line pointer
    if ( !currentLineBuffer[ lineIndexSnapshot ].length ) {
      this._currentLinePointer++;
    }

    // Return the token, either as a string or converted to a number
    return returnAsString ? extractedToken : +extractedToken;
  };

  InputDataHandler.prototype.fetchLineValues = function ( asRawText ) {
    // Retrieve the current line, split it by spaces, and then advance the line pointer
    var tokensOnLine = this._linesOfData[ this._currentLinePointer++ ].split( " " );

    // Return tokens as strings or convert them to numbers
    return asRawText ? tokensOnLine : tokensOnLine.map( tokenString => +tokenString );
  };

  InputDataHandler.prototype.getMatrixData = function ( numberOfRows, preserveText ) {
    // Extract a slice of lines corresponding to the matrix rows and split each row into cell strings
    var matrixContent = this._linesOfData.slice( this._currentLinePointer, this._currentLinePointer += numberOfRows )
                                        .map( rowEntry => rowEntry.split( " " ) );

    // If not preserving text, convert all cell strings to numbers
    return preserveText ? matrixContent : matrixContent.map( rowStrings => rowStrings.map( cellEntry => +cellEntry ) );
  };

  InputDataHandler.prototype.readRawLines = function ( lineCount, keepOriginalFormat ) {
    // Get a specified number of raw lines from the input
    var extractedLineSegments = this._linesOfData.slice( this._currentLinePointer, this._currentLinePointer += lineCount );

    // Return lines as strings or convert each line to a number
    return keepOriginalFormat ? extractedLineSegments : extractedLineSegments.map( segmentText => +segmentText );
  };

  return createInputProcessor; // The module exports the factory function
})(); // Immediately Invoked Function Expression (IIFE)

// --- Global Input Processing ---

// Initialize the data reader by providing content from standard input
var dataStreamReader = DATA_ACQUISITION_UTILITY( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );

// --- Utility for Multi-Dimensional Array Creation ---

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * The dimensions are passed as subsequent arguments.
 * Example: initializeMultiDimensionalArray(0, 2, 3) creates a 2x3 array of zeros.
 * @param {*} fillValue - The value to initialize array elements with.
 * @returns {Array} The newly created multi-dimensional array.
 */
function initializeMultiDimensionalArray ( fillValue ) {
  var dimensionArguments = arguments,
      dimensionCount = dimensionArguments.length,
      arrayConstructionCode = "Array(dimensionArguments[" + --dimensionCount + "]).fill(0).map(unusedElement=>{return " + fillValue + ";})";

  // Build the string for nested array creation
  while ( --dimensionCount ) {
    arrayConstructionCode = "Array(dimensionArguments[" + dimensionCount + "]).fill(0).map(somePlaceholder=>" + arrayConstructionCode + ")";
  }

  // Evaluate the constructed string to create the array
  return eval( arrayConstructionCode );
}

// --- Main Program Execution ---

// Output the result of the main computation function
console.log( computeMaximumPathSum( ) );

/**
 * The primary function containing the core logic of the problem.
 * It calculates the maximum sum based on a specific pattern of indices.
 * @returns {number} The calculated maximum sum.
 */
function computeMaximumPathSum ( ) {
  var totalDataPoints = dataStreamReader.retrieveSingleValue( ); // Read N, the total number of elements
  var inputNumericSequence = dataStreamReader.fetchLineValues( ); // Read the sequence of numbers S
  var overallMaximum = 0; // Variable to store the highest sum found
  var midpointIndex = totalDataPoints >> 1; // Calculate N/2 using bitwise right shift (integer division)

  // Outer loop: iterates from 1 up to (N/2) - 1
  // 'stepMagnitude' represents the step size for traversing the sequence.
  for ( var stepMagnitude = 1; stepMagnitude < midpointIndex; stepMagnitude++ ) {
    var processedIndices = new Set( ); // Set to keep track of indices already included in the current 'currentIterationSum'
    var currentIterationSum = 0; // Sum for the current 'stepMagnitude' iteration

    // Inner loop: traverses the sequence using 'stepMagnitude'
    // 'startTraversalIndex' moves forward, 'endTraversalIndex' moves backward from the end.
    for ( var startTraversalIndex = stepMagnitude; startTraversalIndex < totalDataPoints - stepMagnitude; startTraversalIndex += stepMagnitude ) {
      var endTraversalIndex = totalDataPoints - startTraversalIndex - 1; // Calculate the corresponding "complementary" index

      // Check if either index has already been used in this 'stepMagnitude' or if they are the same index.
      // If so, break the inner loop as this path is invalid or exhausted for this 'stepMagnitude'.
      if ( processedIndices.has( startTraversalIndex ) || processedIndices.has( endTraversalIndex ) || startTraversalIndex === endTraversalIndex ) {
        break;
      }

      // Add the values at the two indices to the current sum
      currentIterationSum += inputNumericSequence[ startTraversalIndex ] + inputNumericSequence[ endTraversalIndex ];

      // Update the overall maximum sum if the current sum is greater
      if ( overallMaximum < currentIterationSum ) {
        overallMaximum = currentIterationSum;
      }

      // Mark both indices as processed for the current 'stepMagnitude'
      processedIndices.add( startTraversalIndex );
      processedIndices.add( endTraversalIndex );
    }
  }
  return overallMaximum; // Return the final calculated maximum sum
}