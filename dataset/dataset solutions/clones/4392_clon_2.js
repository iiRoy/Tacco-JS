var programInputData = require( "fs" ) .readFileSync( "/dev/stdin" , "utf8" ) .trim( ) .split( "\n" ) ;

var dataStreamHandler = {
  "sourceData" : programInputData ,
  "currentPosition" : 0 ,
  "totalEntries" : programInputData.length ,

  "retrieveNext" : function ( ) {
    if ( ! this.canRetrieveMore( ) ) {
      throw "StreamDepletionError: No further elements are available in the data stream." ;
    }
    var currentItem = this.sourceData[ this.currentPosition ] ;
    this.currentPosition ++ ;
    return currentItem ;
  } ,

  "canRetrieveMore" : function ( ) {
    return ( this.currentPosition < this.totalEntries ) ;
  }
} ;

/*
*   Initiates the primary application execution sequence.
*/
mainExecution( ) ;

/**
 * Retrieves the subsequent item from the globally accessible data stream handler.
 * @returns {string} The next string element from the input source.
 */
function getNextItem ( ) {
  return dataStreamHandler.retrieveNext( ) ;
}

/**
 * Fetches the next string item and converts it into an integer value.
 * @returns {number} The next integer value parsed from the stream.
 */
function getNextInteger ( ) {
  return dataConverter( getNextItem( ) , 1 ) ;
}

/**
 * Obtains the next string item and segments it into an array of strings using space as a delimiter.
 * @returns {string[]} An array of strings, split by space characters.
 */
function getNextStringArray ( ) {
  return dataConverter( getNextItem( ) , 2 ) ; // Divides the content based on space characters
}

/**
 * Acquires the next string item, splits it by spaces, and transforms each resulting part into a number.
 * @returns {number[]} An array of numbers, derived from space-separated parts of the string.
 */
function getNextIntegerArray ( ) {
  return dataConverter( getNextItem( ) , 4 ) ; // Separates by space and converts each segment to a numeric type
}

/**
 * Retrieves the next string item and breaks it down into an array of individual characters.
 * @returns {string[]} An array where each element is a single character from the original string.
 */
function getNextCharacterArray ( ) {
  return dataConverter( getNextItem( ) , 6 ) ; // Splits the string into its constituent characters
}

/**
 * Determines if there are additional elements available for retrieval in the data stream.
 * @returns {boolean} True if more data can be retrieved, false if the stream is exhausted.
 */
function hasMoreData ( ) {
  return dataStreamHandler.canRetrieveMore( ) ;
}

/**
 * Outputs the provided value to the standard console output stream.
 * @param {*} val The value to be displayed on the standard output.
 */
function displayOutput ( val ) {
  console.log( val ) ; // Direct logging to the standard output
}

/**
 * Dispatches a message to the standard error console output stream.
 * @param {*} msg The message or object to be displayed as an error.
 */
function displayError ( msg ) {
  console.error( msg ) ; // Direct logging to the standard error output
}

// This function serves as a versatile data transformation utility.
// The 'mode' parameter specifies the desired conversion type.
// In cases of an unknown 'mode' or an error during processing, the original input is returned.
// Available transformation modes:
//   1: Parses the input string into a base-10 integer.
//   2: Splits the input string into substrings using a single space as the separator.
//   4: Splits the input string by spaces, then maps each resulting substring to a number.
//   6: Divides the input string into an array of individual characters.
//   7: Splits the input string into characters, then maps each character to a number.
//   8: Joins elements of an array into a single string, separated by a single space.
//   9: Joins elements of an array into a single string, with each element on a new line.
//   0: Joins elements of an array into a single string without any separator.
function dataConverter ( inputVal , mode ) {
  try {
    switch ( mode ) {
      case 1 : return Number.parseInt( inputVal , 10 ) ;
      case 2 : return inputVal.split( " " ) ;
      case 4 : return inputVal.split( " " ).map( ( elem ) => Number( elem ) ) ;
      case 6 : return inputVal.split( "" ) ;
      case 7 : return inputVal.split( "" ).map( ( elem ) => Number( elem ) ) ;
      case 8 : return inputVal.join( " " ) ;
      case 9 : return inputVal.join( "\n" ) ;
      case 0 : return inputVal.join( "" ) ;
      default : return inputVal ;
    }
  } catch ( processingError ) {
    return inputVal ;
  }
}

/**
 * The main execution function, encapsulating the core logic for cost calculation.
 * It processes input parameters to determine the most economical way to achieve a target quantity.
 */
function mainExecution ( ) {
  var initialParams = getNextIntegerArray( ) ;

  var quarterUnitCost = initialParams[0] ;
  var halfUnitCost = initialParams[1] ;
  var singleUnitCost = initialParams[2] ;
  var doubleUnitCost = initialParams[3] ;

  var targetQuantity = getNextInteger( ) ;

  var effectiveQuarterCost = quarterUnitCost * 8 ;
  var effectiveHalfCost = halfUnitCost * 4 ;
  var effectiveSingleCost = singleUnitCost * 2 ;

  var finalCost = 0 ;

  var unitCostOptions = [ effectiveQuarterCost , effectiveHalfCost , effectiveSingleCost , doubleUnitCost ] ;

  var minCostPerTwoLiters = Math.min( ...unitCostOptions ) ;

  finalCost = minCostPerTwoLiters * Math.floor( targetQuantity / 2 ) ;

  if ( targetQuantity % 2 === 1 ) {
    effectiveQuarterCost = quarterUnitCost * 4 ;
    effectiveHalfCost = halfUnitCost * 2 ;
    finalCost += Math.min( effectiveQuarterCost , Math.min( effectiveHalfCost , singleUnitCost ) ) ;
  }

  displayOutput( finalCost ) ;
}