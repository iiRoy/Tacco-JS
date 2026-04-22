/* This module encapsulates a utility for parsing input data streams. */
var DATA_GRABBER = ( function() {

  /**
   * Factory function to create a new StreamProcessor instance.
   * @param {string} rawInput - The raw string input to be processed.
   * @returns {StreamProcessor} A new instance of the StreamProcessor.
   */
  function createProcessor( rawInput ) {
    return new StreamProcessor( rawInput ) ;
  }

  /**
   * Constructor for the StreamProcessor class.
   * Manages the state of the input stream.
   * @param {string} rawSource - The initial string data.
   */
  function StreamProcessor( rawSource ) {
    // Stores the input as an array of lines, trimmed.
    this._textSegments = rawSource.trim().split( "\n" ) ;
    // Pointer to the current line being read.
    this._linePointer = 0 ;
  }

  /**
   * Retrieves a single item from the current line.
   * If the line has not been split into words, it does so (reversing for `pop` to work left-to-right).
   * Advances the line pointer if the current line is exhausted.
   * @param {boolean} returnAsString - If true, returns the item as a string; otherwise, attempts to convert to a number.
   * @returns {string|number} The extracted item.
   */
  StreamProcessor.prototype.fetchSingleItem = function( returnAsString ) {
    var contentRef = this._textSegments,
        pointerRef = this._linePointer,
        extractedValue ;

    // If the current line is still a single string, split it into words and reverse for easy popping.
    if ( typeof contentRef[ pointerRef ] === "string" ) {
      contentRef[ pointerRef ] = contentRef[ pointerRef ].split( " " ).reverse() ;
    }

    // Pop the last element (which is effectively the first due to reversal).
    extractedValue = contentRef[ pointerRef ].pop() ;

    // If the current line is now empty, advance to the next line.
    if ( ! contentRef[ pointerRef ].length ) {
      this._linePointer ++ ;
    }

    // Return the value, either as a string or a number.
    return returnAsString ? extractedValue : +extractedValue ;
  } ;

  /**
   * Reads an entire line and splits it into an array of items.
   * Advances the line pointer.
   * @param {boolean} returnAsString - If true, returns items as strings; otherwise, attempts to convert to numbers.
   * @returns {Array<string|number>} An array of items from the line.
   */
  StreamProcessor.prototype.fetchLineItems = function( returnAsString ) {
    // Get the current line, split by space, and then advance the line pointer.
    var lineSegments = this._textSegments[ this._linePointer ++ ].split( " " ) ;
    // Return items as strings or parsed numbers.
    return returnAsString ? lineSegments : lineSegments.map( item => +item ) ;
  } ;

  /**
   * Reads multiple lines and processes them into a 2D array (matrix).
   * Advances the line pointer by the number of lines read.
   * @param {number} numRows - The number of lines to read.
   * @param {boolean} returnAsString - If true, returns items as strings; otherwise, attempts to convert to numbers.
   * @returns {Array<Array<string|number>>} A matrix of items.
   */
  StreamProcessor.prototype.fetchMatrix = function( numRows, returnAsString ) {
    // Slice the relevant lines, then advance the line pointer.
    var matrixData = this._textSegments.slice( this._linePointer, this._linePointer += numRows )
                       .map( row => row.split( " " ) ) ; // Split each row into cells.

    // Return the matrix, with cells as strings or parsed numbers.
    return returnAsString ? matrixData : matrixData.map( row => row.map( cell => +cell ) ) ;
  } ;

  /**
   * Reads multiple lines and processes them into a flat array.
   * Advances the line pointer by the number of lines read.
   * @param {number} numEntries - The number of lines to read.
   * @param {boolean} returnAsString - If true, returns items as strings; otherwise, attempts to convert to numbers.
   * @returns {Array<string|number>} A flat array of items.
   */
  StreamProcessor.prototype.fetchArray = function( numEntries, returnAsString ) {
    // Slice the relevant lines, then advance the line pointer.
    var listData = this._textSegments.slice( this._linePointer, this._linePointer += numEntries ) ;
    // Return the array, with entries as strings or parsed numbers.
    return returnAsString ? listData : listData.map( entry => +entry ) ;
  } ;

  return createProcessor ; // Expose the factory function.
})() ;


/* Initialize the input reader with data from standard input. */
var inputReader = DATA_GRABBER( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;

// Output the result of the main calculation function.
console.log( executeCalculation() ) ;

/**
 * Main function to perform the probability calculation.
 * This implements a dynamic programming approach to solve a specific problem.
 * @returns {number} The final computed probability.
 */
function executeCalculation() {
  // Read the total number of elements 'N' from input.
  var totalElements = inputReader.fetchSingleItem() ;

  // Read the array of probabilities 'P' from input.
  var probValues = inputReader.fetchLineItems() ;

  // Initialize the dynamic programming array.
  // probabilityDistribution[k] will represent the probability of having exactly k successful events.
  var probabilityDistribution = [ 1 - probValues[0], probValues[0] ] ;

  // Iterate through the remaining probabilities.
  for ( var iterIndex = 1 ; iterIndex < totalElements ; iterIndex ++ ) {

    // Update the probability for the maximum possible successes (iterIndex + 1).
    // This is only possible if all previous iterIndex events were successful AND the current one is.
    probabilityDistribution[ iterIndex + 1 ] = probabilityDistribution[ iterIndex ] * probValues[ iterIndex ] ;

    // Iterate backwards to update probabilities for k successful events.
    // This loop calculates probabilityDistribution[subIndex] based on probabilityDistribution[subIndex-1] and probabilityDistribution[subIndex] from the previous iteration.
    for ( var subIndex = iterIndex ; subIndex > 0 ; subIndex -- ) {
      probabilityDistribution[ subIndex ] = probabilityDistribution[ subIndex - 1 ] * probValues[ iterIndex ] +
                                            probabilityDistribution[ subIndex ] * ( 1 - probValues[ iterIndex ] ) ;
    }

    // Update probabilityDistribution[0] (probability of zero successful events).
    // This is based on probabilityDistribution[0] from the previous iteration and the current probability of failure.
    // Note: 'subIndex' here is 0 from the loop termination.
    probabilityDistribution[ 0 ] = probabilityDistribution[ subIndex ] * ( 1 - probValues[ iterIndex ] ) ;
  }

  // Calculate the final answer by summing probabilities for a specific range.
  var finalOutcome = 0 ;
  // Sum probabilities from (N+1)/2 up to N.
  for ( iterIndex = ( totalElements + 1 ) / 2 ; iterIndex <= totalElements ; iterIndex ++ ) {
    finalOutcome += probabilityDistribution[ iterIndex ] ;
  }

  return finalOutcome ; // Return the aggregated result.
}