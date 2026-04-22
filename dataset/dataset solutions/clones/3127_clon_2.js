/* This module provides utilities for parsing input data line by line. */
var INPUT_PARSER_FACTORY = ( function ( ) {
  // Factory function to instantiate the input reader.
  function createInputReader ( sourceText ) {
    return new LineByLineReader( sourceText );
  }

  // Constructor for the LineByLineReader class.
  function LineByLineReader ( rawContent ) {
    this._lineBuffer = rawContent . trim ( ) . split ( "\n" ) ; // Stores all input lines.
    this._currentLinePointer = 0 ; // Index of the next line to be processed.
  }

  /*
   * Extracts a single value from the current line.
   * If the line hasn't been split into tokens yet, it splits it.
   * Advances the internal line pointer if the current line becomes empty.
   * @param {boolean} returnAsString - If true, returns the value as a string; otherwise, as a number.
   * @returns {string|number} The extracted value.
   */
  LineByLineReader.prototype.fetchNextValue = function ( returnAsString ) {
    var activeBuffer = this._lineBuffer;
    var pointerPosition = this._currentLinePointer;
    var resultToken;

    // Check if the current line needs to be tokenized.
    if ( typeof activeBuffer[pointerPosition] === "string" ) {
      activeBuffer[pointerPosition] = activeBuffer[pointerPosition].split(" ").reverse();
    }

    // Pop the last token (which was the first after reversal).
    resultToken = activeBuffer[pointerPosition].pop();

    // If the current line is now empty, advance the line pointer.
    if ( !activeBuffer[pointerPosition].length ) {
      this._currentLinePointer++;
    }

    return returnAsString ? resultToken : +resultToken;
  };

  /*
   * Reads and parses an entire line of values.
   * Advances the internal line pointer.
   * @param {boolean} returnAsString - If true, returns values as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of values from the line.
   */
  LineByLineReader.prototype.readNextLine = function ( returnAsString ) {
    var lineTokens = this._lineBuffer[this._currentLinePointer++].split(" ");
    return returnAsString ? lineTokens : lineTokens.map( ( val ) => +val );
  };

  /*
   * Reads a specified number of lines as a matrix.
   * Advances the internal line pointer by 'rowCount'.
   * @param {number} rowCount - The number of rows to read.
   * @param {boolean} returnAsString - If true, returns values as strings; otherwise, as numbers.
   * @returns {Array<Array<string|number>>} A 2D array (matrix) of values.
   */
  LineByLineReader.prototype.readMatrix = function ( rowCount, returnAsString ) {
    var matrixRows = this._lineBuffer.slice( this._currentLinePointer, this._currentLinePointer += rowCount )
                                     .map( ( rowContent ) => rowContent.split(" ") );
    return returnAsString ? matrixRows : matrixRows.map( ( row ) => row.map( ( cell ) => +cell ) );
  };

  /*
   * Reads a specified number of raw lines without splitting them into tokens.
   * Advances the internal line pointer by 'numLinesToRead'.
   * @param {number} numLinesToRead - The number of lines to read.
   * @param {boolean} returnAsString - If true, returns lines as strings; otherwise, attempts conversion to numbers.
   * @returns {Array<string|number>} An array of raw lines.
   */
  LineByLineReader.prototype.readRawLines = function ( numLinesToRead, returnAsString ) {
    var rawLines = this._lineBuffer.slice( this._currentLinePointer, this._currentLinePointer += numLinesToRead );
    return returnAsString ? rawLines : rawLines.map( ( line ) => +line );
  };

  return createInputReader; // The public interface for creating a parser.
} ) ( ) ;

// Initialize the input data processor by reading from standard input.
var dataProcessor = INPUT_PARSER_FACTORY ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// Define a large prime number for modulo operations to prevent overflow.
var primeModulo = 1_000_000_000 + 7 ;

// Output the result of the main problem-solving function.
console.log ( executeSolution ( ) ) ;

/*
 * Main function to solve the problem using dynamic programming.
 * It calculates the number of ways to pick items based on their categories
 * and their positions, respecting certain conditions.
 */
function executeSolution ( ) {
  // Read the total number of elements.
  var totalElements = dataProcessor.fetchNextValue ( ) ;

  // Read the category index for each element.
  var elementCategories = dataProcessor.readRawLines ( totalElements ) ;

  // Initialize an array to store positions for each category.
  // The size 2e5 is a common upper bound in competitive programming for such arrays.
  var categoryPositions = Array ( 200000 ) . fill ( 0 ) . map ( ( ) => [ ] ) ;

  // Populate categoryPositions: For each element, record its index in its category list.
  for ( var loopIndex = 0 ; loopIndex < totalElements ; loopIndex++ ) {
    categoryPositions [ elementCategories [ loopIndex ] - 1 ] . push ( loopIndex ) ;
  }

  // Pre-process categoryPositions: Remove the first occurrence (which is now last due to reverse).
  // This effectively leaves us with subsequent occurrences for each category.
  for ( var loopIndex = 0 ; loopIndex < totalElements ; loopIndex++ ) {
    categoryPositions [ loopIndex ] . reverse ( ) ; // Reverse to easily pop the 'next' occurrence.
    categoryPositions [ loopIndex ] . pop ( ) ; // Remove the first original occurrence.
  }

  // Initialize the dynamic programming array.
  var dynamicProgrammingArray = Array ( totalElements ) . fill ( 0 ) ;
  dynamicProgrammingArray [ 0 ] = 1 ; // Base case: one way to be at position 0.

  // Find the next occurrence for the item at index 0.
  var nextValidPosition = categoryPositions [ elementCategories [ 0 ] - 1 ] . pop ( ) ;

  // If the next occurrence is beyond index 1, set its DP value.
  if ( nextValidPosition > 1 ) {
    dynamicProgrammingArray [ nextValidPosition ] = 1 ;
  }

  // Iterate through the elements to fill the DP array.
  for ( loopIndex = 1 ; loopIndex < totalElements ; loopIndex++ ) {
    // The number of ways to reach the current index includes ways to reach the previous index.
    dynamicProgrammingArray [ loopIndex ] += dynamicProgrammingArray [ loopIndex - 1 ] ;
    // Apply modulo to keep the number within limits.
    dynamicProgrammingArray [ loopIndex ] %= primeModulo ;

    // Get the next occurrence position for the item at the current index.
    nextValidPosition = categoryPositions [ elementCategories [ loopIndex ] - 1 ] . pop ( ) ;

    // If there's a next occurrence and it's sufficiently far away, update its DP value.
    // The condition 'nextValidPosition > loopIndex + 1' implies that the next occurrence
    // is not the immediate next element, allowing for a jump.
    if ( nextValidPosition > loopIndex + 1 ) {
      dynamicProgrammingArray [ nextValidPosition ] = dynamicProgrammingArray [ loopIndex ] ;
    }
  }

  // The final result is the number of ways to reach the last element.
  return dynamicProgrammingArray [ totalElements - 1 ] ;
}