/*
 * This module provides a utility for reading structured input data
 * from a string, typically used for competitive programming problems.
 */
var DATA_READER = ( function () {

  /**
   * Creates a new input processor instance.
   * @param {string} sourceContent - The entire input string to be processed.
   * @returns {InputBuffer} A new instance of the InputBuffer.
   */
  function createReader( sourceContent ) {
    return new InputBuffer( sourceContent );
  }

  /**
   * Represents a buffer for processing lines of input data.
   * @constructor
   * @param {string} inputString - The raw string data.
   */
  function InputBuffer( inputString ) {
    // Split the input string into lines, trim whitespace, and store.
    this._lineSegments = inputString.trim().split( "\n" );
    // Initialize a pointer to the current line being processed.
    this._currentLineIndex = 0;
  }

  /**
   * Pops the next value from the current line. If the current line is exhausted,
   * it advances to the next line.
   * @param {boolean} returnAsString - If true, returns the value as a string; otherwise, as a number.
   * @returns {string|number} The extracted value.
   */
  InputBuffer.prototype.popNextValue = function ( returnAsString ) {
    let lineSegmentsRef = this._lineSegments;
    let lineIndexRef = this._currentLineIndex;
    let extractedItem;

    // If the current line hasn't been split into words yet, do so.
    if ( typeof lineSegmentsRef[ lineIndexRef ] === "string" ) {
      // Split by space and reverse to use `pop` efficiently.
      lineSegmentsRef[ lineIndexRef ] = lineSegmentsRef[ lineIndexRef ].split( " " ).reverse();
    }

    // Extract the last element (which is the next in original order).
    extractedItem = lineSegmentsRef[ lineIndexRef ].pop();

    // If the current line is now empty, advance to the next line.
    if ( !lineSegmentsRef[ lineIndexRef ].length ) {
      this._currentLineIndex++;
    }

    // Return as string or convert to number.
    return returnAsString ? extractedItem : +extractedItem;
  };

  /**
   * Reads all values from the current line.
   * @param {boolean} keepStrings - If true, returns values as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of values from the line.
   */
  InputBuffer.prototype.readAllOnLine = function ( keepStrings ) {
    // Get the current line, split it into parts, and advance the line pointer.
    let lineParts = this._lineSegments[ this._currentLineIndex++ ].split( " " );
    // Return as strings or map to numbers.
    return keepStrings ? lineParts : lineParts.map( ( element ) => +element );
  };

  /**
   * Reads a specified number of lines and parses them into a matrix (array of arrays).
   * @param {number} numberOfLines - The number of lines to read for the matrix.
   * @param {boolean} preserveStrings - If true, keeps cell values as strings; otherwise, converts to numbers.
   * @returns {Array<Array<string|number>>} The parsed matrix.
   */
  InputBuffer.prototype.readMatrix = function ( numberOfLines, preserveStrings ) {
    // Slice the relevant lines and map each line to an array of its parts.
    let extractedMatrix = this._lineSegments.slice( this._currentLineIndex, this._currentLineIndex += numberOfLines )
                                          .map( ( lineStr ) => lineStr.split( " " ) );
    // Return as strings or map all nested elements to numbers.
    return preserveStrings ? extractedMatrix : extractedMatrix.map( ( rowArray ) => rowArray.map( ( cellStr ) => +cellStr ) );
  };

  /**
   * Reads a specified number of lines as a single-dimensional vector.
   * Each line is expected to contain a single value.
   * @param {number} elementCount - The number of lines/elements to read.
   * @param {boolean} textualOutput - If true, returns values as strings; otherwise, as numbers.
   * @returns {Array<string|number>} The parsed vector.
   */
  InputBuffer.prototype.readVector = function ( elementCount, textualOutput ) {
    // Slice the relevant lines.
    let extractedVector = this._lineSegments.slice( this._currentLineIndex, this._currentLineIndex += elementCount );
    // Return as strings or map to numbers.
    return textualOutput ? extractedVector : extractedVector.map( ( itemValue ) => +itemValue );
  };

  // The outer function returns the factory function.
  return createReader;

} )(); // Immediately-invoked function expression (IIFE)

// Instantiate the input processor with content read from standard input.
var inputProcessor = DATA_READER( require( 'node:fs' ).readFileSync( '/dev/stdin', 'utf-8' ) );

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * @param {any} initialValue - The value to fill the array with.
 * @param {...number} dimensions - The dimensions of the array (e.g., 2, 3 for a 2x3 array).
 * @returns {Array} The initialized multi-dimensional array.
 */
function initializeMultiDimensionalArray( initialValue ) {
  // Access arguments using 'arguments' object to handle variable dimensions.
  const argsArray = arguments;
  let dimensionCount = argsArray.length;
  // Build the array creation string from inside out.
  let arrayCreationString = `Array(argsArray[${--dimensionCount}]).fill(0).map((ignored) => { return ${initialValue}; })`;

  // Wrap with further Array.fill.map calls for higher dimensions.
  while ( --dimensionCount ) {
    arrayCreationString = `Array(argsArray[${dimensionCount}]).fill(0).map((ignored) => ${arrayCreationString})`;
  }
  // Evaluate the constructed string to create the array.
  return eval( arrayCreationString );
}

// Log the result of the main execution function.
console.log( executeProgram() );

/**
 * Main function to process input and calculate the final sum based on rules.
 * This function encapsulates the core logic of the problem.
 * @returns {number} The final calculated sum.
 */
function executeProgram() {
  // Read the total number of items 'N'.
  let totalItems = inputProcessor.popNextValue();
  // Read the number of modification rules 'M'.
  let modificationCount = inputProcessor.popNextValue();

  // Read the initial array of item values, then sort them in ascending order.
  let itemValues = inputProcessor.readAllOnLine().sort( ( valA, valB ) => valA - valB );

  // Read the modification rules (M lines, each with 2 values), then sort them.
  // Rules are sorted by their second value (B_i) in descending order.
  let ruleSet = inputProcessor.readMatrix( modificationCount );
  ruleSet.sort( ( ruleOne, ruleTwo ) => ruleTwo[ 1 ] - ruleOne[ 1 ] );

  // Counter for items processed from the 'itemValues' array.
  let processedCounter = 0;

  // Iterate through each modification rule.
  for ( let ruleIndex = 0; ruleIndex < modificationCount; ruleIndex++ ) {
    // For each rule, apply it up to B_i[0] times or until all items are processed.
    for ( let innerLoopIdx = 0; innerLoopIdx < ruleSet[ ruleIndex ][ 0 ] && processedCounter < totalItems; processedCounter++, innerLoopIdx++ ) {
      // If the current item's value is less than the rule's value (B_i[1]), update it.
      if ( itemValues[ processedCounter ] < ruleSet[ ruleIndex ][ 1 ] ) {
        itemValues[ processedCounter ] = ruleSet[ ruleIndex ][ 1 ];
      } else {
        // If an item is already greater or equal, then subsequent items (due to sorting)
        // will also be greater or equal for this rule or weaker rules.
        // So, we can stop early and sum the current array.
        return itemValues.reduce( ( accumulator, currentValue ) => accumulator + currentValue );
      }
    }
  }

  // If all rules are applied without an early exit, sum the final array.
  return itemValues.reduce( ( accumulator, currentValue ) => accumulator + currentValue );
}