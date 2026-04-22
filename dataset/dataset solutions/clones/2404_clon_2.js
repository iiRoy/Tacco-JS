"use strict";
var DATA_READER = ( function ( ) {
  function createReader( sourceContent ) {
    return new InputProcessor( sourceContent );
  }
  function InputProcessor( sourceContent ) {
    this._sourceLines = sourceContent.trim().split( "\n" );
    this._currentLineIndex = 0;
  }
  InputProcessor.prototype.readNextValue = function ( asString ) {
    var lineData = this._sourceLines,
      lineIdx = this._currentLineIndex,
      extractedValue;
    if ( typeof lineData[ lineIdx ] === "string" )
      lineData[ lineIdx ] = lineData[ lineIdx ].split( " " ).reverse();
    extractedValue = lineData[ lineIdx ].pop();
    if ( !lineData[ lineIdx ].length )
      this._currentLineIndex++;
    return asString ? extractedValue : +extractedValue;
  };
  InputProcessor.prototype.readLineValues = function ( asString ) {
    var lineElements = this._sourceLines[ this._currentLineIndex++ ].split( " " );
    return asString ? lineElements : lineElements.map( item => +item );
  };
  InputProcessor.prototype.readMatrix = function ( numLines, asString ) {
    var resultData = this._sourceLines.slice( this._currentLineIndex, this._currentLineIndex += numLines ).map( item => item.split( " " ) );
    return asString ? resultData : resultData.map( row => row.map( element => +element ) );
  };
  InputProcessor.prototype.readLines = function ( numLines, asString ) {
    var resultData = this._sourceLines.slice( this._currentLineIndex, this._currentLineIndex += numLines );
    return asString ? resultData : resultData.map( item => +item );
  };
  return createReader;
} )();

var inputHandler = DATA_READER( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );

function multiDimArray( initialValue ) {
  var dimensions = arguments,
    dimCount = dimensions.length,
    arrayCreationCode = "Array(dimensions[" + --dimCount + "]).fill(0).map( _ => { return " + initialValue + "; } )";
  while ( --dimCount )
    arrayCreationCode = "Array(dimensions[" + dimCount + "]).fill(0).map( _ => " + arrayCreationCode + " )";
  return eval( arrayCreationCode );
}

console.log( solveProblem() );

function solveProblem() {
  var totalElements = inputHandler.readNextValue();
  var maxDistance = inputHandler.readNextValue();
  var elementStates = inputHandler.readNextValue( true );
  var zeroIndices = [];
  for ( var idx = totalElements; idx--; ) {
    if ( elementStates[ idx ] === "0" )
      zeroIndices.push( idx );
  }
  var resultPath = [];
  var currentPosition = totalElements;
  for ( var idx = 0; idx < zeroIndices.length; idx++ ) {
    if ( currentPosition - zeroIndices[ idx ] > maxDistance )
      return -1;
    while ( idx < zeroIndices.length - 1 && currentPosition - zeroIndices[ idx + 1 ] <= maxDistance )
      idx++;
    resultPath.push( currentPosition - zeroIndices[ idx ] );
    currentPosition = zeroIndices[ idx ];
  }
  return resultPath.reverse().join( " " );
}