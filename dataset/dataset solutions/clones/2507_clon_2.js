"use strict" ; /* Enable strict mode for cleaner code practices */
var InputProcessor = ( function ( ) {
  /* Inner function to create a new DataParser instance */
  function createProcessor ( inputString ) {
    return new DataParser ( inputString ) ;
  }

  /*
   * Constructor for the DataParser class.
   * Initializes the source lines and current reading position.
   */
  function DataParser ( inputString ) {
    // Trim input and split into lines
    this._sourceLines = inputString . trim ( ) . split ( "\n" ) ;
    // Initialize line index
    this._currentLineIndex = 0 ;
  }

  /**
   * Reads a single value from the current line.
   * If the line is a string, it's split, reversed, and the last element is popped.
   * Moves to the next line if the current line becomes empty.
   * @param {boolean} asString - If true, returns the value as a string; otherwise, converts to a number.
   * @returns {string|number} The parsed value.
   */
  DataParser . prototype . readNextValue = function ( asString ) {
    var linesRef = this._sourceLines,
      lineIdxRef = this._currentLineIndex,
      resultValue ;

    // Check if the current line needs to be processed (split and reversed)
    if ( typeof linesRef [ lineIdxRef ] === "string" ) {
      linesRef [ lineIdxRef ] = linesRef [ lineIdxRef ] . split ( " " ) . reverse ( ) ;
    }

    // Pop the last element (which was the first before reversing)
    resultValue = linesRef [ lineIdxRef ] . pop ( ) ;

    // If the line is now empty, advance to the next line
    if ( ! linesRef [ lineIdxRef ] . length ) {
      this._currentLineIndex ++ ;
    }

    // Return based on the 'asString' flag
    return asString ? resultValue : + resultValue ;
  } ;

  /**
   * Reads an entire line and splits it into values.
   * Advances the internal line index.
   * @param {boolean} asStrings - If true, returns values as strings; otherwise, converts to numbers.
   * @returns {Array<string|number>} An array of parsed values from the line.
   */
  DataParser . prototype . readLineValues = function ( asStrings ) {
    var lineParts = this._sourceLines [ this._currentLineIndex ++ ] . split ( " " ) ;
    // Map values to numbers if not requested as strings
    return asStrings ? lineParts : lineParts . map ( item => + item ) ;
  } ;

  /**
   * Reads a specified number of lines and processes each into an array of values.
   * @param {number} numRows - The number of rows (lines) to read.
   * @param {boolean} asStrings - If true, returns values as strings; otherwise, converts to numbers.
   * @returns {Array<Array<string|number>>} A 2D array (matrix) of parsed values.
   */
  DataParser . prototype . readMatrix = function ( numRows , asStrings ) {
    var matrixResult = this._sourceLines . slice ( this._currentLineIndex , this._currentLineIndex += numRows ) . map ( row => row . split ( " " ) ) ;
    // Map inner arrays to numbers if not requested as strings
    return asStrings ? matrixResult : matrixResult . map ( row => row . map ( item => + item ) ) ;
  } ;

  /**
   * Reads a specified number of lines as-is, without splitting them.
   * @param {number} count - The number of lines to read.
   * @param {boolean} asStrings - If true, returns lines as strings; otherwise, converts to numbers.
   * @returns {Array<string|number>} An array of lines, potentially converted to numbers.
   */
  DataParser . prototype . readLines = function ( count , asStrings ) {
    var linesResult = this._sourceLines . slice ( this._currentLineIndex , this._currentLineIndex += count ) ;
    // Map lines to numbers if not requested as strings
    return asStrings ? linesResult : linesResult . map ( lineContent => + lineContent ) ;
  } ;

  return createProcessor ; // Expose the factory function
} ) ( ) ;

/* Initialize an input reader instance from standard input */
var inputReader = InputProcessor ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

/**
 * Dynamically creates a multi-dimensional array with specified dimensions and initial value.
 * @param {any} initialValue - The value to fill the array with.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} A multi-dimensional array.
 */
function createMultiDimArray ( initialValue ) {
  var dimArgs = arguments ,
    argCount = dimArgs . length ,
    arrayCreationCode = "Array(dimArgs[" + -- argCount + "]).fill(0).map( _ => {return " + initialValue + ";} )" ;

  while ( -- argCount ) {
    arrayCreationCode = "Array(dimArgs[" + argCount + "]).fill(0).map( _ => " + arrayCreationCode + " )" ;
  }

  // Evaluate the constructed string to create the array
  return eval ( arrayCreationCode ) ;
}

/* A large constant value, often used for infinity in competitive programming */
var MAX_LIMIT_VAL = 1e15 ;

// Output the result of the main processing function to the console
console . log ( processSolution ( ) ) ;

/**
 * Main function containing the problem's logic.
 * Reads input, processes data, and returns a formatted string.
 * @returns {string} The final computed answer joined by newlines.
 */
function processSolution ( ) {
  // Read the total number of elements from input
  var totalElements = inputReader . readNextValue ( ) ;
  // Read an array of numbers from the next line
  var inputNumbers = inputReader . readLineValues ( ) ;

  // Create a frequency map initialized with zeros
  var frequencyMap = createMultiDimArray ( 0 , totalElements ) ;

  // Populate the frequency map based on input numbers
  for ( var loopIndex = 0 ; loopIndex < totalElements ; loopIndex ++ ) {
    frequencyMap [ inputNumbers [ loopIndex ] - 1 ] ++ ;
  }

  // Collect all non-zero frequencies into a new array
  var distinctFrequencies = [ ] ;
  for ( var loopIndex = 0 ; loopIndex < totalElements ; loopIndex ++ ) {
    if ( frequencyMap [ loopIndex ] ) {
      distinctFrequencies . push ( frequencyMap [ loopIndex ] ) ;
    }
  }

  // Sort frequencies in descending order
  distinctFrequencies . sort ( ( valA , valB ) => valB - valA ) ;

  // Calculate cumulative sums of sorted frequencies
  var cumulativeSums = Array ( distinctFrequencies . length + 1 ) ;
  cumulativeSums [ 0 ] = 0 ;
  for ( var loopIndex = 1 ; loopIndex <= distinctFrequencies . length ; loopIndex ++ ) {
    cumulativeSums [ loopIndex ] = cumulativeSums [ loopIndex - 1 ] + distinctFrequencies [ distinctFrequencies . length - loopIndex ] ;
  }

  // Prepare the array for final results, starting with the total elements
  var finalResults = [ totalElements ] ;

  // Iterate from 2 up to totalElements to calculate results
  for ( var loopIndex = 2 ; loopIndex <= totalElements ; loopIndex ++ ) {
    // If there aren't enough distinct frequencies for the current 'loopIndex', result is 0
    if ( distinctFrequencies . length < loopIndex ) {
      finalResults . push ( 0 ) ;
    } else {
      // Calculate the maximum possible value based on current loopIndex and cumulative sums
      var maximumPossible = Math . min ( totalElements / loopIndex | 0 , cumulativeSums [ distinctFrequencies . length - loopIndex + 1 ] ) ;
      finalResults . push ( maximumPossible ) ;
    }
  }

  // Join the results with newline characters and return
  return finalResults . join ( "\n" ) ;
}