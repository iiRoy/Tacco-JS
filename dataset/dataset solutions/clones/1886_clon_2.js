"use strict"; /* Enforces stricter parsing and error handling rules */

// Obtain system input module and read all raw data from standard input
var sourceData = require ( "fs" ) . readFileSync ( "/dev/stdin", "utf8" ) ;

// Split the raw input into tokens using spaces or newlines as delimiters
// and initialize an index for traversing the token stream.
var tokenSequence = sourceData . split ( / |\n/ ) , sequenceIndex = 0 ;


/**
 * Retrieves the next token from the global token sequence.
 * @param {boolean} keepAsText - If true, returns the token as a string; otherwise, attempts to convert it to a number.
 * @returns {string|number} The next token.
 */
function retrieveToken ( keepAsText ) {
  return keepAsText
         ? tokenSequence [ sequenceIndex ++ ] // Return string token
         : +tokenSequence [ sequenceIndex ++ ] ; // Convert and return numeric token
}

/**
 * Fetches a specified number of tokens from the global sequence.
 * @param {number} countToFetch - The number of tokens to retrieve.
 * @param {boolean} asRawText - If true, returns tokens as strings; otherwise, converts them to numbers.
 * @returns {Array<string|number>} An array of tokens.
 */
function fetchTokens ( countToFetch , asRawText ) {
  return asRawText
         ? tokenSequence . slice ( sequenceIndex , sequenceIndex += countToFetch )
         : tokenSequence . slice ( sequenceIndex , sequenceIndex += countToFetch ) . map ( item => +item ) ;
}

/**
 * Reads a matrix of tokens from the global sequence.
 * @param {number} rows - The number of rows in the matrix.
 * @param {number} cols - The number of columns in each row.
 * @param {boolean} textualMode - If true, stores elements as strings; otherwise, converts them to numbers.
 * @returns {Array<Array<string|number>>} The matrix of tokens.
 */
function getMatrix ( rows , cols , textualMode ) {
  var resultMatrix = [ ] , rowIndex = 0 ;
  if ( textualMode ) {
    for ( ; rowIndex < rows ; rowIndex ++ ) {
      resultMatrix . push ( tokenSequence . slice ( sequenceIndex , sequenceIndex += cols ) ) ;
    }
  } else {
    for ( ; rowIndex < rows ; rowIndex ++ ) {
      resultMatrix . push ( tokenSequence . slice ( sequenceIndex , sequenceIndex += cols ) . map ( item => +item ) ) ;
    }
  }
  return resultMatrix ;
}

/**
 * Dynamically constructs and executes code to create a multi-dimensional array.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The dimensions of the array (e.g., dim1, dim2, ...).
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray ( initialValue ) {
  var dimensions = arguments , dimLength = dimensions . length ,
      arrayCreationString = "Array(dimensions[" + --dimLength + "]).fill().map(_ => {return " + initialValue + ";})" ;
  while ( --dimLength ) {
    arrayCreationString = "Array(dimensions[" + dimLength + "]).fill().map(_ =>" + arrayCreationString + ")" ;
  }
  return eval ( arrayCreationString ) ; // Execute the dynamically built string to create the array
}


// Invoke the primary routine and capture its return value.
var programResult = primaryRoutine ( ) ;

// If the primary routine yields a defined output, print it to the console.
if ( programResult !== undefined ) {
  console . log ( programResult ) ;
}


/**
 * The main execution logic of the program.
 * This function processes a sequence of parenthesis strings to determine
 * if they can be balanced, following specific rules.
 * @returns {string} "Yes" if the strings can be balanced, "No" otherwise.
 */
function primaryRoutine ( ) {
  var negativeOutcomeIndicator = "No" , positiveOutcomeIndicator = "Yes" ;

  // Read the total count of input segments.
  var inputCount = retrieveToken ( ) ;

  // Initialize arrays to store segments based on their balance characteristics,
  // along with total balance change and current running balance.
  var segmentsClosingFirst = [ ] , segmentsOpeningFirst = [ ] ,
      totalBalanceChange = 0 , currentRunningBalance = 0 ;

  // Process each input segment one by one.
  for ( var segmentIdx = 0 ; segmentIdx < inputCount ; segmentIdx ++ ) {
    var minimumBalanceInSegment = 0 , finalBalanceInSegment = 0 ;
    // Retrieve the current string segment.
    var currentSegmentString = retrieveToken ( true ) ;

    // Analyze the balance of parentheses within the current segment.
    for ( var characterIdx = 0 ; characterIdx < currentSegmentString . length ; characterIdx ++ ) {
      if ( currentSegmentString [ characterIdx ] === "(" ) {
        finalBalanceInSegment ++ ; // Increment balance for an opening parenthesis.
      } else {
        finalBalanceInSegment -- ; // Decrement balance for a closing parenthesis.
        // Track the minimum balance encountered within this segment.
        if ( finalBalanceInSegment < minimumBalanceInSegment ) {
          minimumBalanceInSegment = finalBalanceInSegment ;
        }
      }
    }
    totalBalanceChange += finalBalanceInSegment ; // Accumulate total balance change.

    // Categorize segments based on their balance properties.
    if ( minimumBalanceInSegment >= 0 ) {
      // Segment always non-negative balance, add its final balance directly.
      currentRunningBalance += finalBalanceInSegment ;
    } else if ( finalBalanceInSegment <= 0 ) {
      // Segment ends with non-positive balance and went negative.
      // Store as [required_openings_to_clear_min, final_balance].
      segmentsClosingFirst . push ( [ -minimumBalanceInSegment + finalBalanceInSegment , finalBalanceInSegment ] ) ;
    } else {
      // Segment ends positive but went negative internally.
      // Store as [required_openings_to_clear_min, final_balance].
      segmentsOpeningFirst . push ( [ -minimumBalanceInSegment , finalBalanceInSegment ] ) ;
    }
  }

  // If the total balance change across all segments is not zero, it's impossible to balance.
  if ( totalBalanceChange ) return negativeOutcomeIndicator ;

  // Sort segments that end positive but went negative internally
  // by the number of openings needed to clear their minimum balance (ascending).
  segmentsOpeningFirst . sort ( ( itemA , itemB ) => itemA [ 0 ] - itemB [ 0 ] ) ;

  // Process these segments.
  for ( var segmentIdx = 0 ; segmentIdx < segmentsOpeningFirst . length ; segmentIdx ++ ) {
    // If current running balance is insufficient to clear this segment's minimum, it's impossible.
    if ( segmentsOpeningFirst [ segmentIdx ] [ 0 ] > currentRunningBalance ) return negativeOutcomeIndicator ;
    // Add this segment's final balance to the running balance.
    currentRunningBalance += segmentsOpeningFirst [ segmentIdx ] [ 1 ] ;
  }

  // Sort segments that end non-positive and went negative
  // by a combined metric (inverse of required openings, essentially) (descending).
  segmentsClosingFirst . sort ( ( itemA , itemB ) => itemB [ 0 ] - itemA [ 0 ] ) ;

  // Process these segments.
  for ( var segmentIdx = 0 ; segmentIdx < segmentsClosingFirst . length ; segmentIdx ++ ) {
    // Destructure the current segment's properties.
    var [ minVal , endVal ] = segmentsClosingFirst [ segmentIdx ] ;
    // If current running balance is insufficient to clear this segment's minimum, it's impossible.
    if ( minVal > currentRunningBalance ) return negativeOutcomeIndicator ;
    // Add this segment's final balance to the running balance.
    currentRunningBalance += endVal ;
  }

  // If all segments are processed successfully, the strings can be balanced.
  return positiveOutcomeIndicator ;
}