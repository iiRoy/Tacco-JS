/*
 *  This module provides a factory function for creating an input
 *  data processing handler. It encapsulates methods for reading
 *  various data formats from a text stream.
 */
var INPUT_STREAM_HANDLER_FACTORY = (
  function () {
    /**
     * Creates a new instance of the StreamDataProcessor.
     * This is the public entry point for the factory.
     * @param {string} sourceText - The raw input text to be processed.
     * @returns {StreamDataProcessor} An initialized processor instance.
     */
    function createStreamProcessor ( sourceText ) {

      return new StreamDataProcessor( sourceText );
    }

    /**
     *  StreamDataProcessor class:
     *  Handles parsing and extracting data from a multi-line string input.
     *  It maintains an internal pointer to track the current line being processed.
     *  @param {string} sourceText - The raw string content from the input source.
     */
    function StreamDataProcessor( sourceText ) {
      /* Store the input lines, first trimming whitespace and then splitting by newline character. */
      this._textSegments = sourceText.trim().split( "\n" );
      /* Initialize the current line pointer, indicating the next line to read. */
      this._linePointer = 0;
    }

    /**
     * Extracts a single token (element) from the current line.
     * If the current line is exhausted, it advances to the next.
     * @param {boolean} returnAsString - If true, returns the token as a string; otherwise, attempts to convert to a number.
     * @returns {string|number} The extracted token.
     */
    StreamDataProcessor.prototype.fetchElement = function ( returnAsString ) {
      var currentLineParts = this._textSegments,
          segmentPosition = this._linePointer,
          extractedValue;

      /* If the current line segment hasn't been processed into an array of parts yet,
       * split it by space and reverse to facilitate popping from the "start" of the line. */
      if ( typeof currentLineParts[segmentPosition] === "string" ) {
        currentLineParts[segmentPosition] = currentLineParts[segmentPosition].split( " " ).reverse();
      }

      /* Retrieve the last element (which was originally the first due to reverse)
       * from the current line's parts array. */
      extractedValue = currentLineParts[segmentPosition].pop();

      /* If, after popping, the current line segment is empty, increment the line pointer
       * to move to the next logical line. */
      if ( !currentLineParts[segmentPosition].length ) {
        this._linePointer++;
      }

      /* Return the extracted value. If 'returnAsString' is true, return as is.
       * Otherwise, use the unary plus operator to convert it to a number. */
      return returnAsString ? extractedValue : +extractedValue;
    };

    /**
     * Retrieves an entire line of data, split into tokens.
     * The line pointer is automatically advanced after this operation.
     * @param {boolean} returnAsString - If true, returns an array of strings; otherwise, an array of numbers.
     * @returns {Array<string|number>} An array containing the tokens from the line.
     */
    StreamDataProcessor.prototype.getWholeLine = function ( returnAsString ) {
      /* Access the current line, split it by spaces, and then increment the line pointer. */
      var lineData = this._textSegments[this._linePointer++].split( " " );

      /* Return the array of tokens. If 'returnAsString' is true, return as string array.
       * Otherwise, map each token to its numeric representation. */
      return returnAsString ? lineData : lineData.map( ( item ) => +item );
    };

    /**
     * Extracts a block of 'numberOfLines' lines, treating each as a row in a matrix.
     * Each line is split into individual cells. The line pointer is advanced by 'numberOfLines'.
     * @param {number} numberOfLines - The count of lines to extract for the matrix.
     * @param {boolean} returnAsString - If true, returns a matrix of strings; otherwise, a matrix of numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the extracted matrix.
     */
    StreamDataProcessor.prototype.extractMatrix = function ( numberOfLines, returnAsString ) {
      /* Slice the specified number of lines from the text segments, advancing the line pointer.
       * Then, map each extracted line to an array of its split parts. */
      var gridData = this._textSegments
                         .slice( this._linePointer, ( this._linePointer += numberOfLines ) )
                         .map( ( entry ) => entry.split( " " ) );

      /* Return the grid data. If 'returnAsString' is true, return as is.
       * Otherwise, map each row and then each cell within that row to a number. */
      return returnAsString ? gridData : gridData.map( ( row ) => row.map( ( cell ) => +cell ) );
    };

    /**
     * Retrieves a block of 'numberOfLines' lines as a simple array.
     * The line pointer is advanced by 'numberOfLines'.
     * @param {number} numberOfLines - The count of lines to retrieve.
     * @param {boolean} returnAsString - If true, returns an array of strings; otherwise, an array of numbers.
     * @returns {Array<string|number>} An array containing the lines.
     */
    StreamDataProcessor.prototype.getLineBlock = function ( numberOfLines, returnAsString ) {
      /* Slice the specified number of raw lines from the text segments, advancing the line pointer. */
      var blockData = this._textSegments
                          .slice( this._linePointer, ( this._linePointer += numberOfLines ) );

      /* Return the block data. If 'returnAsString' is true, return as is.
       * Otherwise, map each line (which is a string) to its numeric representation. */
      return returnAsString ? blockData : blockData.map( ( value ) => +value );
    };

    /* The factory returns the main creation function, not the class itself. */
    return createStreamProcessor;
  }
)();

// Initialize the input data handler by reading from standard input.
// This reads the entire content of /dev/stdin as a UTF-8 string.
var inputController = INPUT_STREAM_HANDLER_FACTORY( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );

/**
 *  Generates a multi-dimensional array initialized with a specific value.
 *  This utility function dynamically constructs code to create nested arrays
 *  based on provided dimensions and then evaluates it.
 *  @param {*} initialValue - The value to fill all elements of the array with.
 *  @param {...number} dimensions - The sizes of each dimension, provided as rest parameters.
 *  @returns {Array} The generated multi-dimensional array.
 */
function createNestedArrays ( initialValue ) {
  var dimensionArguments = arguments, // Access all arguments, including initialValue and dimensions.
      dimensionCount = dimensionArguments.length, // Total number of arguments.
      // Start building the array creation code from the innermost dimension.
      arrayInitializationCode = "Array(dimensionArguments[" + --dimensionCount + "]).fill(0).map(x=>{return " + initialValue + ";})";

  // Loop backwards through the dimensions to build up the nested Array.map calls.
  while ( --dimensionCount ) {
    arrayInitializationCode = "Array(dimensionArguments[" + dimensionCount + "]).fill(0).map(x=>" + arrayInitializationCode + ")";
  }

  // Evaluate the dynamically constructed JavaScript code string to create the array.
  return eval( arrayInitializationCode );
}

// Execute the main challenge logic and output its computed result to the console.
console.log( analyzeStringChallenge() );

/**
 *  Solves the main challenge problem.
 *  The task is to analyze a given input string to find the smallest possible value
 *  among the maximum consecutive sequences of non-matching characters,
 *  for each character 'a' through 'z'.
 *  @returns {number} The calculated minimum maximum consecutive count.
 */
function analyzeStringChallenge () {
  /* Read the primary input string. The 'true' flag ensures it's read as a string type. */
  var targetSequence = inputController.fetchElement( true );
  var sequenceLength = targetSequence.length; // Determine the total length of the input sequence.
  var finalOutcome = sequenceLength; // Initialize the answer with the maximum possible length.

  // Outer loop: Iterate through all possible alphabet characters from 'a' (index 0) to 'z' (index 25).
  for ( var charType = 0; charType < 26; charType++ ) {
    var longestMismatch = 0; // Tracks the maximum consecutive non-matching characters for the current 'charType'.
    var mismatchStreak = 0;  // Counts the current consecutive non-matching characters.

    // Inner loop: Iterate through each character in the input string.
    for ( var position = 0; position < sequenceLength; position++ ) {
      // Compare the ASCII value of the current character in the string to the current 'charType'.
      // Subtract 97 to normalize 'a' to 0, 'b' to 1, etc.
      if ( targetSequence[position].charCodeAt() - 97 === charType ) {
        // If there's a match, the current mismatch streak ends.
        // Update 'longestMismatch' if the 'mismatchStreak' was greater.
        if ( mismatchStreak > longestMismatch ) {
          longestMismatch = mismatchStreak;
        }
        mismatchStreak = 0; // Reset the streak as a match was found.
      } else {
        // If there's no match, increment the current mismatch streak.
        mismatchStreak++;
      }
    }
    // After the inner loop completes, check if the final 'mismatchStreak' (at the end of the string)
    // is greater than the 'longestMismatch' found so far for this 'charType'.
    if ( mismatchStreak > longestMismatch ) {
      longestMismatch = mismatchStreak;
    }
    // Update the 'finalOutcome' if the 'longestMismatch' for the current 'charType' is smaller
    // than the smallest 'longestMismatch' found across all previous 'charType's.
    if ( longestMismatch < finalOutcome ) {
      finalOutcome = longestMismatch;
    }
  }
  return finalOutcome; // Return the final computed minimum maximum consecutive count.
}