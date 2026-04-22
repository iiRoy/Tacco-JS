"use strict" /* Ensure strict parsing of JavaScript code */ ;

// Load input data from a specified source, e.g., standard input
var dataSource = require ( "fs" ) . readFileSync ( "/dev/stdin" , "UTF-8" ) ;

/*
 * Process the raw input stream:
 * - Split into individual tokens using spaces or newlines as delimiters.
 * - Initialize a cursor to track the current token position.
 */
var parsedTokens = dataSource . split ( /[ \n]+/ ) , tokenCursor = 0.0 ;

/**
 * Retrieves the next token from the parsed sequence.
 *
 * @param {boolean} isStringMode - If true, returns the token as a string; otherwise, converts to a number.
 * @returns {string|number} The next token.
 */
function advanceAndGet ( isStringMode )
{
  return isStringMode ? parsedTokens [ tokenCursor++ ] : Number ( parsedTokens [ tokenCursor++ ] ) ;
}

/**
 * Fetches a specified number of tokens from the input stream.
 *
 * @param {number} countItems - The number of tokens to retrieve.
 * @param {boolean} keepAsStrings - If true, tokens are returned as strings; otherwise, converted to numbers.
 * @returns {Array<string|number>} An array containing the requested tokens.
 */
function getMultiple ( countItems , keepAsStrings )
{
  if ( keepAsStrings )
  {
    return parsedTokens . slice ( tokenCursor , ( tokenCursor = tokenCursor + countItems ) ) ;
  }
  else
  {
    return parsedTokens . slice ( tokenCursor , ( tokenCursor = tokenCursor + countItems ) ) . map ( itemVal => Number ( itemVal ) ) ;
  }
}

/*
 * Function to read a two-dimensional matrix of data from the token stream.
 *
 * @param {number} rowsNum - The total number of rows in the matrix.
 * @param {number} colsNum - The total number of columns per row.
 * @param {boolean} stringOutput - Flag to determine if elements should be kept as strings.
 * @returns {Array<Array<string|number>>} The constructed matrix.
 */
function retrieveMatrix ( rowsNum , colsNum , stringOutput )
{
  var matrixResult = [ ] ;
  var rowCounter = 0.0 ;

  if ( stringOutput )
  {
    for ( ; rowCounter < rowsNum ; rowCounter ++ )
    {
      matrixResult . push ( parsedTokens . slice ( tokenCursor , ( tokenCursor = tokenCursor + colsNum ) ) ) ;
    }
  }
  else
  {
    for ( ; rowCounter < rowsNum ; rowCounter ++ )
    {
      matrixResult . push ( parsedTokens . slice ( tokenCursor , ( tokenCursor = tokenCursor + colsNum ) ) . map ( elemVal => Number ( elemVal ) ) ) ;
    }
  }

  return matrixResult ;
}


/*
 * Dynamically constructs and returns a multi-dimensional array.
 * This function uses a string-based approach to build the array creation logic.
 *
 * @param {any} initialValue - The default value to fill the innermost array elements.
 * @returns {Array} A multi-dimensional array initialized with the provided value.
 */
function buildNDArray ( initialValue )
{
  var dimSpecifiers = arguments ,
      currentDimIndex = dimSpecifiers . length ,
      arrayConstructionString = "" ;

  currentDimIndex -- ;
  arrayConstructionString = "new Array(dimSpecifiers[" + currentDimIndex + "]).fill().map( _element_ => { return initialValue; })" ;

  while ( currentDimIndex > 0 )
  {
    currentDimIndex -- ;
    arrayConstructionString = "new Array(dimSpecifiers[" + currentDimIndex + "]).fill().map( _element_ => " + arrayConstructionString + " )" ;
  }

  // Execute the dynamically generated array creation code.
  return eval ( arrayConstructionString ) ;
}


// Invoke the primary logic function of the program.
var programOutcome = executeCoreLogic ( ) ;

// If the main logic produced a result, display it.
if ( programOutcome != null )
{
  global . console . log ( programOutcome ) ;
}


/**
 * The core execution logic of the program.
 * This function processes an initial sequence of numbers and applies a specific reduction algorithm.
 *
 * @returns {number} The final reduced value after several comparison stages.
 */
function executeCoreLogic ( )
{
  var elementCount = advanceAndGet ( ) ; /* Read the total number of elements */
  var originalSequence = advanceAndGet ( true ) ; /* Read the initial sequence as strings */

  var differenceSequence = new Array ( elementCount - 1.0 ) ;

  /* Calculate absolute differences between adjacent elements */
  for ( var sequenceIndex = 0.0 ; sequenceIndex < ( elementCount - 1.0 ) ; sequenceIndex ++ )
  {
    var computedDifference = Math . abs ( Number ( originalSequence [ sequenceIndex ] ) - Number ( originalSequence [ sequenceIndex + 1.0 ] ) ) ;
    differenceSequence [ sequenceIndex ] = computedDifference ;
  }

  /*
   * Iteratively reduce the difference sequence.
   * In each iteration, a new sequence `comparisonSequence` is created
   * by comparing elements from the current `differenceSequence` with
   * their symmetric counterparts.
   */
  while ( differenceSequence . length > 1.0 )
  {
    var currentLength = differenceSequence . length ;
    var halfLength = Math . floor ( currentLength / 2.0 ) ;
    var comparisonSequence = new Array ( halfLength ) ;

    for ( var comparisonIndex = 0.0 ; comparisonIndex < halfLength ; comparisonIndex ++ )
    {
      var leftVal = differenceSequence [ comparisonIndex ] ;
      var rightVal = differenceSequence [ currentLength - 1.0 - comparisonIndex ] ;

      if ( leftVal === rightVal )
      {
        comparisonSequence [ comparisonIndex ] = 0.0 ;
      }
      else if ( Math . abs ( leftVal - rightVal ) === 1.0 )
      {
        comparisonSequence [ comparisonIndex ] = 1.0 ;
      }
      else
      {
        comparisonSequence [ comparisonIndex ] = 2.0 ;
      }
    }

    // Replace the current sequence with the newly computed comparison sequence.
    differenceSequence = comparisonSequence ;
  }

  // The final result is the single remaining element in the sequence.
  return differenceSequence [ 0 ] ;
}