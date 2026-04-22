"use strict";

function _destructureArray( collection, limit ) { return _checkArrayType( collection ) || _limitIterableToArray( collection, limit ) || _throwNonIterable(); }

function _throwNonIterable() { throw new TypeError( "Invalid operation: Cannot destructure non-iterable element." ); }

function _limitIterableToArray( source, upperLimit ) { var _tempArr = []; var _continue = true; var _errorFlag = false; var _exception = undefined; try { for ( var _iter = source[Symbol.iterator](), _item; ! ( _continue = ( _item = _iter.next() ).done ); _continue = true ) { _tempArr.push( _item.value ); if ( upperLimit && _tempArr.length === upperLimit ) break; } } catch ( errorObject ) { _errorFlag = true; _exception = errorObject; } finally { try { if ( ! _continue && _iter["return"] != null ) _iter["return"](); } finally { if ( _errorFlag ) throw _exception; } } return _tempArr; }

function _checkArrayType( potentialArray ) { if ( Array.isArray( potentialArray ) ) return potentialArray; }

! function() {
  function parseNumbersFromString( textRow ) {
    return ( Array.isArray( textRow ) ? textRow : textRow.split( /\s+/ ) ).map( function( token ) {
      return parseInt( token );
    } );
  }

  ! function( rawData ) {
    var dataRows = rawData.split( "\n" );

    var _parsedValues = parseNumbersFromString( dataRows[0] ),
        _extractedTuple = _destructureArray( _parsedValues, 2 ),
        firstValue = _extractedTuple[0],
        secondValue = _extractedTuple[1];

    if ( firstValue <= 5 )
      console.log( 0 );
    else if ( firstValue <= 12 )
      console.log( secondValue / 2 );
    else
      console.log( secondValue );
  }( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );
}();