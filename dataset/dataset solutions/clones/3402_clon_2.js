var InputProcessor = ( function() {

  /* This self-executing anonymous function creates a private scope
   * and returns a factory function for an input parsing utility. */

  /**
   * Serves as the primary entry point to construct a new DataParser.
   * @param {string} inputText - The entire raw text content to be processed.
   * @returns {DataParser} A fresh instance prepared for data extraction.
   */
  function createParser( inputText ) {
    return new DataParser( inputText );
  }

  /**
   * The core class responsible for managing and parsing lines of input data.
   * It maintains the state of which line is currently being read.
   * @param {string} inputText - The full input string provided.
   */
  function DataParser( inputText ) {
    // The collection of input lines, split by newline character, after trimming.
    this._sourceLines = inputText.trim().split( "\n" );
    // An internal pointer indicating the current line being processed.
    this._lineIndex = +0;
  }

  // Extend the DataParser's capabilities by adding methods to its prototype.

  /**
   * Extracts a single value from the current line. It handles splitting
   * the line if necessary and advances the line pointer if the line becomes empty.
   * @param {boolean} asString - If true, returns the value as a string; otherwise, converts to a number.
   * @returns {string|number} The extracted data item.
   */
  DataParser.prototype.extractSingleValue = function( asString ) {
    var currentLines = this._sourceLines,
      currentIndex = this._lineIndex,
      extractedValue; // Temporary holder for the value retrieved from the line.

    // Check if the current line is still a single string; if so, split it into parts.
    // Reversing the array allows for efficient 'pop' operations from the end.
    if ( typeof currentLines[ currentIndex ] === "string" ) {
      currentLines[ currentIndex ] = currentLines[ currentIndex ].split( " " ).reverse();
    }

    // Retrieve the last element from the current line's array of parts.
    extractedValue = currentLines[ currentIndex ].pop();

    // If all elements from the current line have been consumed, move to the next line.
    if ( !currentLines[ currentIndex ].length ) {
      this._lineIndex++;
    }

    // Return the value either in its string form or as a parsed number.
    return asString ? extractedValue : +extractedValue;
  };

  /**
   * Retrieves all values from the current line as an array, then advances to the next line.
   * @param {boolean} asString - If true, returns an array of strings; otherwise, an array of numbers.
   * @returns {Array<string|number>} An array containing all items from the line.
   */
  DataParser.prototype.extractLineValues = function( asString ) {
    // Fetch the current line, split it into components, and then increment the line index.
    var lineParts = this._sourceLines[ this._lineIndex++ ].split( " " );

    // Return the array of parts, either as strings or numerically converted.
    return asString ? lineParts : lineParts.map( item => +item );
  };

  /**
   * Reads a specified number of lines and processes them into a matrix (array of arrays).
   * @param {number} count - The number of lines to read for the matrix.
   * @param {boolean} asString - If true, keeps values as strings; otherwise, converts to numbers.
   * @returns {Array<Array<string|number>>} A matrix representation of the data.
   */
  DataParser.prototype.extractMatrix = function( count, asString ) {
    // Extract 'count' lines, then for each line, split it into an array of string components.
    var resultData = this._sourceLines.slice( this._lineIndex, this._lineIndex += count ).map( lineStr => lineStr.split( " " ) );

    // Depending on the 'asString' flag, return the matrix as strings or numbers.
    return asString ? resultData : resultData.map( rowArray => rowArray.map( item => +item ) );
  };

  /**
   * Fetches a specified number of raw lines without splitting them by spaces.
   * @param {number} count - The number of raw lines to retrieve.
   * @param {boolean} asString - If true, returns lines as strings; otherwise, attempts to convert each line to a number.
   * @returns {Array<string|number>} An array of raw lines.
   */
  DataParser.prototype.extractRawLines = function( count, asString ) {
    // Obtain a segment of 'count' lines from the source, advancing the line index.
    var resultData = this._sourceLines.slice( this._lineIndex, this._lineIndex += count );

    // Return the raw lines, either as strings or as numbers.
    return asString ? resultData : resultData.map( item => +item );
  };

  // The factory function 'createParser' is returned, making it publicly accessible.
  return createParser;

} )();


var parserInstance = InputProcessor(
  require( 'node:fs' )
  .readFileSync( '/dev/stdin', 'utf8' )
);

// Execute the primary computational task and display its outcome.
console . log( primaryTask() );

/**
 * This function encapsulates the main logic to solve the given problem.
 * It calculates the minimum column index based on a grid of barriers.
 * @returns {number} The final calculated minimum column value.
 */
function primaryTask() {
  // Read the dimensions of the board and the total number of operations from input.
  var boardHeight = parserInstance.extractSingleValue();
  var boardWidth = parserInstance.extractSingleValue();
  var numOperations = parserInstance.extractSingleValue();

  // Initialize a grid structure to keep track of barriers.
  // It's an array where each element is an object, allowing for sparse column storage.
  // Using boardHeight + 1 enables 1-based indexing for rows.
  var barrierGrid = Array( boardHeight + 0x1 )
    .fill( 0.0 )
    .map( currentElement => {
      return {}; // Each row is an object to efficiently store barrier column positions.
    } );

  // Iterate through each of the provided operations.
  for ( var opCount = +0; opCount < numOperations; opCount++ ) {
    var operationDetails = parserInstance.extractLineValues(); // Format: [column, row]

    // A specific condition to skip certain operations: if the first value
    // (representing a column) is less than the second value (representing a row).
    if ( operationDetails[ 0 ] < operationDetails[ 0x1 ] ) {
      continue;
    }

    // Mark the barrier in the grid. The row is `operationDetails[1]` and
    // the column is `operationDetails[0]`. Value `1` signifies a barrier.
    barrierGrid[ operationDetails[ 0b1 ] ][ operationDetails[ 0 ] ] = 0x1;
  }

  // Populate the rightmost edge of the grid with permanent barriers.
  // This simplifies boundary checks during the main traversal.
  for ( opCount = 0x1; opCount <= boardHeight; opCount++ ) {
    barrierGrid[ opCount ][ boardWidth + 0x1 ] = 0x1;
  }

  // Determine the initial potential result based on the first row's barriers.
  // It takes the first barrier's column and subtracts one.
  var finalResult = Object.keys( barrierGrid[ 0x1 ] )[ +0 ] - 0x1;

  // Initialize the current column for the traversal algorithm, starting from column 2.
  var currentColumn = 0b10;

  // Begin iterating through rows, from the second row up to the current finalResult
  // and also constrained by the board's height.
  for ( opCount = 0b10; opCount <= finalResult && opCount <= boardHeight; opCount++ ) {

    // Advance 'currentColumn' past any barriers encountered in the current row.
    while ( barrierGrid[ opCount ][ currentColumn ] ) {
      currentColumn++;
    }

    // Iterate over the barrier columns specifically defined for the current row.
    for ( var barrierColumn in barrierGrid[ opCount ] ) {
      // Convert the string key (column index) to a numeric type.
      barrierColumn = +barrierColumn;

      // If the current traversal column has already passed this barrier, skip it.
      if ( currentColumn > barrierColumn ) {
        continue;
      }

      // If this barrier defines a new, smaller possible finalResult, update it.
      // The result is one less than the barrier's column because the barrier itself is an obstruction.
      if ( barrierColumn - 0x1 < finalResult ) {
        finalResult = barrierColumn - 0x1;
      }
      break; // Once the most relevant barrier for this row is found, no need to check others.
    }

    // Increment 'currentColumn' for the next row's evaluation.
    currentColumn++;

    // If 'currentColumn' reaches or surpasses the board's width, the process can terminate.
    if ( currentColumn >= boardWidth ) {
      break;
    }
  }
  // Return the ultimate calculated result.
  return finalResult;
}