// This section handles input processing and initial setup.
var inputReader = require('readline') . buildChannel ( {
  sourceStream : process.stdin,
  sinkStream   : process.stdout
} ) ;

var dataStore;
var receivedLines = [];

inputReader . addListener ( 'line' , function ( currentLineData ) {
  receivedLines . push ( currentLineData ) ;
} ) ;

inputReader . addListener ( 'close' , function ( ) {
  dataStore = initializeData ( receivedLines ) ;
  console . warn ( '\n↑Input ↓Output' ) ; // Alert for input/output sections.
  executePrimaryLogic ( ) ;
} ) ;

/**
 * Creates a deep copy of an object or a Set.
 * @param {object|Set} originalItem - The item to duplicate.
 * @returns {object|Set} A new, independent copy.
 */
function duplicateObject ( originalItem ) {
  return ( originalItem instanceof Set ) ? new Set ( Array . from ( originalItem ) ) : JSON . parse ( JSON . stringify ( originalItem ) ) ;
}

// Input retrieval functions for different data types.
function fetchInteger ( ) { return transformInput ( retrieveNextValue ( ) , 1 ) ; }
function fetchStringArray ( ) { return transformInput ( retrieveNextValue ( ) , 2 ) ; }
function fetchIntegerArray ( ) { return transformInput ( retrieveNextValue ( ) , 4 ) ; }
function fetchCharacterArray ( ) { return transformInput ( retrieveNextValue ( ) , 6 ) ; }

function retrieveNextValue ( ) { return dataStore . retrieveNextValue ( ) ; }
function hasMoreElements ( ) { return dataStore . hasMoreElements ( ) ; }

/**
 * Initializes the data source object for sequential input reading.
 * @param {string[]} incomingContent - An array of strings representing input lines.
 * @returns {object} An object with methods to access input.
 */
function initializeData ( incomingContent ) {
  return {
    contentArray : incomingContent,
    currentPosition : 0,
    maximumElements : incomingContent . length,

    hasMoreElements : function ( ) { return ( this . currentPosition < this . maximumElements ) ; },
    retrieveNextValue : function ( ) {
      if ( this . hasMoreElements ( ) ) {
        return this . contentArray [ this . currentPosition++ ] ;
      } else {
        throw 'InputOutOfBoundsException : No further input available' ;
      }
    }
  } ;
}

/**
 * Displays a result to standard output.
 * @param {*} resultContent - The content to be displayed.
 */
function displayResult ( resultContent ) { console . log ( resultContent ) ; }

/**
 * Logs detailed debugging information to standard error.
 * @param {*} debugPayload - The data to inspect and log.
 */
function logDebuggingInfo ( debugPayload ) {
  console . error ( 'debug_output: ' + require ( 'util' ) . inspect ( debugPayload , false , null ) ) ;
}

// Parameter 'conversionType' determines the transformation.
// 1: parse as integer.
// 2: split by space.
// 4: split by space and parse as numbers.
// 6: split by single characters.
// 7: split by single characters and parse as numbers.
// 8: join with spaces.
// 9: join with newlines.
// 0: join without any separator.
// Default: return as is.
function transformInput ( valueToConvert , conversionType ) {
  try {
    switch ( conversionType ) {
      case 1:  return parseInt ( valueToConvert ) ;
      case 2:  return valueToConvert . split ( ' ' ) ;
      case 4:  return valueToConvert . split ( ' ' ) . map ( Number ) ;
      case 6:  return valueToConvert . split ( '' ) ;
      case 7:  return valueToConvert . split ( '' ) . map ( Number ) ;
      case 8:  return valueToConvert . join ( ' ' ) ;
      case 9:  return valueToConvert . join ( '\n' ) ;
      case 0:  return valueToConvert . join ( '' ) ;
      default: return valueToConvert ;
    }
  } catch ( errorObject ) {
    return valueToConvert ; // Fallback in case of conversion error.
  }
}

// Core application logic begins here.
function executePrimaryLogic ( ) {

  var inputLength = fetchInteger ( ) ;
  var initialState = "S" ;
  var characterSequence = fetchCharacterArray ( ) ;
  var stateTracker = [ "S" , "S" ] ;

  for ( var iteratorIndex = 1 ; iteratorIndex < inputLength ; iteratorIndex++ ) {
    if ( characterSequence [ iteratorIndex ] == "o" ) {
      if ( stateTracker [ iteratorIndex ] == "S" ) {
        stateTracker . push ( stateTracker [ iteratorIndex - 1 ] ) ;
      } else {
        if ( stateTracker [ iteratorIndex - 1 ] == "S" ) {
          stateTracker . push ( "W" ) ;
        } else {
          stateTracker . push ( "S" ) ;
        }
      }
    } else {
      if ( stateTracker [ iteratorIndex ] == "S" ) {
        if ( stateTracker [ iteratorIndex - 1 ] == "S" ) {
          stateTracker . push ( "W" ) ;
        } else {
          stateTracker . push ( "S" ) ;
        }
      } else {
        stateTracker . push ( stateTracker [ iteratorIndex - 1 ] ) ;
      }
    }
  }

  logDebuggingInfo ( stateTracker . join ( "" ) ) ;

  if ( stateTracker [ inputLength ] == initialState ) {
    stateTracker . pop ( ) ;
    displayResult ( stateTracker . join ( "" ) ) ;
  } else {
    displayResult ( -1 ) ;
  }
}