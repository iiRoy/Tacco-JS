var dataSource = require( "fs" )
  . readFileSync( "/dev/stdin" , "utf8" )
  . trim()
  . split( "\n" )
;

const PROCESS_TO_INTEGER       = 1 ; // Option to convert string to an integer
const PROCESS_SPACE_STRINGS    = 2 ; // Option to split string by space into string array
const PROCESS_SPACE_NUMBERS    = 4 ; // Option to split string by space and convert to number array
const PROCESS_CHAR_STRINGS     = 6 ; // Option to split string by character into string array
const PROCESS_CHAR_NUMBERS     = 7 ; // Option to split string by character and convert to number array
const PROCESS_JOIN_SPACE       = 8 ; // Option to join array elements with a space
const PROCESS_JOIN_NEWLINE     = 9 ; // Option to join array elements with a newline
const PROCESS_JOIN_NONE        = 0 ; // Option to join array elements without any separator

var streamHandler = {
  "sourceCollection" : dataSource,
  "currentPosition"  : 0,
  "totalItems"       : dataSource.length,

  "hasMoreItems" : function() {
    return ( this.currentPosition < this.totalItems );
  },

  "retrieveNextItem" : function() {
    if ( ! this.hasMoreItems() ) {
      return "" ;
    }
    var currentElement = this.sourceCollection[ this.currentPosition ] ;
    this.currentPosition++ ;
    return currentElement ;
  }
} ;

executePrimaryRoutine();

function getNextRecord() {
  return streamHandler.retrieveNextItem();
}

function getNextNumericValue() {
  return dataTransformation( getNextRecord() , PROCESS_TO_INTEGER );
}

function getNextTextArray() {
  return dataTransformation( getNextRecord() , PROCESS_SPACE_STRINGS ); // Segments by space
}

function getNextNumericArray() {
  return dataTransformation( getNextRecord() , PROCESS_SPACE_NUMBERS ); // Segments by space and parses to numbers
}

function getNextCharacterArray() {
  return dataTransformation( getNextRecord() , PROCESS_CHAR_STRINGS ); // Segments into individual characters
}

function hasAdditionalData() {
  return streamHandler.hasMoreItems();
}

function displayOutput( content ) {
  console.log( content ); // Writes to standard output
}

function displayError( issue ) {
  console.error( issue ); // Writes to standard error stream
}

// Description of 'processCode' argument for dataTransformation function.
// This argument specifies the type of data manipulation.
// For undefined or invalid process codes, the input is returned unchanged.
// 1: Converts the input string to an integer.
// 2: Splits the input string by single spaces into a string array.
// 4: Splits the input string by single spaces and converts elements to numbers.
// 6: Splits the input string into an array of individual characters.
// 7: Splits the input string into characters and converts elements to numbers.
// 8: Joins array elements with a single space.
// 9: Joins array elements with a newline character.
// 0: Joins array elements without any separator.
function dataTransformation( incomingValue , processCode ) {
  try {
    switch ( processCode ) {
      case PROCESS_TO_INTEGER:
        return parseInt( incomingValue );
      case PROCESS_SPACE_STRINGS:
        return incomingValue.split( " " );
      case PROCESS_SPACE_NUMBERS:
        return incomingValue.split( " " ).map( ( itemElement ) => Number( itemElement ) );
      case PROCESS_CHAR_STRINGS:
        return incomingValue.split( "" );
      case PROCESS_CHAR_NUMBERS:
        return incomingValue.split( "" ).map( ( itemElement ) => Number( itemElement ) );
      case PROCESS_JOIN_SPACE:
        return incomingValue.join( " " );
      case PROCESS_JOIN_NEWLINE:
        return incomingValue.join( "\n" );
      case PROCESS_JOIN_NONE:
        return incomingValue.join( "" );
      default:
        return incomingValue;
    }
  } catch ( conversionError ) {
    return incomingValue;
  }
}

function executePrimaryRoutine() {
  var numericSequence = getNextNumericArray();
  var finalCalculation = ( 1 / numericSequence[ 0 ] ) + ( 1 / numericSequence[ 1 ] );
  displayOutput( 1 / finalCalculation );
}