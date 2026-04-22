var streamProcessor = require('readline').createInterface( {
  input : process.stdin,
  output: process.stdout
} );
var  inputProcessor;
var  capturedLines = [ ];
streamProcessor.on( 'line', function ( receivedInput ) {
  capturedLines.push( receivedInput );
} );
streamProcessor.on( 'close', function ( ) {
  inputProcessor = initializeProcessor( capturedLines );
  console.error( '\n↑Input Data ↓Output Result' );
  primaryRoutine( );
} );
function createCopy( originalObject ) {
  return ( originalObject instanceof Set )
           ? new Set( Array.from( originalObject ) )
           : JSON.parse( JSON.stringify( originalObject ) );
}
function getNumericValue( ) { return transformValue( fetchNextItem( ), 1 ); }
function getTextParts( )    { return transformValue( fetchNextItem( ), 2 ); }
function getNumberParts( )  { return transformValue( fetchNextItem( ), 4 ); }
function getCharList( )     { return transformValue( fetchNextItem( ), 6 ); }
function fetchNextItem( )   { return inputProcessor.advanceAndGet( ); }
function canAdvance( )      { return inputProcessor.hasMoreItems( ); }
function initializeProcessor( streamData ) {
  return {
    itemCollection : streamData,
    currentPosition: 0,
    maximumCount   : streamData.length,
    hasMoreItems   : function ( ) {
      return ( this.currentPosition < this.maximumCount );
    },
    advanceAndGet  : function ( ) {
      if ( this.hasMoreItems( ) ) {
        return this.itemCollection[ this.currentPosition++ ];
      } else {
        throw 'InputLimitExceededException - No further data available for processing';
      }
    }
  };
}
function displayResult( contentToDisplay ) {
  console.log( contentToDisplay );
}
function showDebug( debugContent ) {
  console.error( 'diagnostic:' + require( 'util' ).inspect( debugContent, false, null ) );
}
// The 'operationCode' parameter determines the transformation type:
// Default or unrecognized: Returns the input value as-is.
// 1: Converts to an integer.
// 2: Splits a string by spaces into an array.
// 4: Splits by spaces and converts each part to a number.
// 6: Splits a string into an array of individual characters.
// 7: Splits into characters and converts each to a number.
// 8: Joins array elements with spaces.
// 9: Joins array elements with newlines.
// 0: Joins array elements without any separator.
function transformValue( rawDatum, operationCode ) {
  try {
    switch ( operationCode ) {
      case 1:
        return parseInt( rawDatum );
      case 2:
        return rawDatum.split( ' ' );
      case 4:
        return rawDatum.split( ' ' ).map( Number );
      case 6:
        return rawDatum.split( '' );
      case 7:
        return rawDatum.split( '' ).map( Number );
      case 8:
        return rawDatum.join( ' ' );
      case 9:
        return rawDatum.join( '\n' );
      case 0:
        return rawDatum.join( '' );
      default:
        return rawDatum;
    }
  } catch ( processingError ) {
    return rawDatum; // On error, return original data
  }
}
function primaryRoutine( ) {
  var initialValues = getNumberParts( );
  var valA = initialValues[ 0 ];
  var valB = initialValues[ 1 ];
  var divisor = 1000000007;
  var computedProduct = 1;
  if ( Math.abs( valA - valB ) >= 2 ) {
    displayResult( 0 );
  } else {
    for ( var counterA = 1; counterA <= valA; counterA++ ) {
      computedProduct *= counterA;
      computedProduct %= divisor;
    }
    for ( var counterB = 1; counterB <= valB; counterB++ ) {
      computedProduct *= counterB;
      computedProduct %= divisor;
    }
    if ( valB == valA ) {
      computedProduct *= 2;
      computedProduct %= divisor;
    }
    displayResult( computedProduct );
  }
}