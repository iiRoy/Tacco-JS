"use strict";
var INPUT_PARSER = ( function ( ) {
  function createParser ( inputStream ) {
    return new TextDataStream ( inputStream ) ;
  }
  function TextDataStream ( inputStream ) {
    this._linesOfText = inputStream . trim ( ) . split ( "\n" ) ;
    this._currentLineIndex = 0 ;
  }
  TextDataStream . prototype . readNextValue = function ( returnAsStringFlag ) {
    var sourceLines = this._linesOfText , currentPosition = this._currentLineIndex , extractedValue ;
    if ( typeof sourceLines [ currentPosition ] === "string" )
      sourceLines [ currentPosition ] = sourceLines [ currentPosition ] . split ( " " ) . reverse ( ) ;
    extractedValue = sourceLines [ currentPosition ] . pop ( ) ;
    if ( ! sourceLines [ currentPosition ] . length )
      this._currentLineIndex ++ ;
    return returnAsStringFlag ? extractedValue : + extractedValue ;
  } ;
  TextDataStream . prototype . readCurrentLine = function ( returnAsStringFlag ) {
    var lineItems = this._linesOfText [ this._currentLineIndex ++ ] . split ( " " ) ;
    return returnAsStringFlag ? lineItems : lineItems . map ( entry => + entry ) ;
  } ;
  TextDataStream . prototype . readMatrix = function ( numRowsToRead , returnAsStringFlag ) {
    var retrievedMatrix = this._linesOfText . slice ( this._currentLineIndex , this._currentLineIndex += numRowsToRead ) . map ( rowEntry => rowEntry . split ( " " ) ) ;
    return returnAsStringFlag ? retrievedMatrix : retrievedMatrix . map ( row => row . map ( entry => + entry ) ) ;
  } ;
  TextDataStream . prototype . readLines = function ( numLinesToRead , returnAsStringFlag ) {
    var retrievedLines = this._linesOfText . slice ( this._currentLineIndex , this._currentLineIndex += numLinesToRead ) ;
    return returnAsStringFlag ? retrievedLines : retrievedLines . map ( entry => + entry ) ;
  } ;
  return createParser ;
} ) ( ) ;
var dataParser = INPUT_PARSER ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
function createMultiDimArray ( initialValue ) {
  var dims = arguments , dimensionCount = dims . length , arrayGenCode = "Array(dims[" + --dimensionCount + "]).fill(0).map(element=>{return " + initialValue + ";})" ;
  while ( --dimensionCount )
    arrayGenCode = "Array(dims[" + dimensionCount + "]).fill(0).map(element=>" + arrayGenCode + ")" ;
  return eval ( arrayGenCode ) ;
}
var finalResultGrid , rawInputGrid ;

console . log ( executeProgram ( ) ) ;
function executeProgram ( ) {
  var regionHeight = dataParser . readNextValue ( ) ;
  var regionWidth = dataParser . readNextValue ( ) ;
  var targetSegments = dataParser . readNextValue ( ) ;
  rawInputGrid = dataParser . readLines ( regionHeight , true ) ;
  finalResultGrid = createMultiDimArray ( 1 , regionHeight , regionWidth ) ;
  divideAndConquer ( 0 , 0 , regionHeight , regionWidth , 1 , targetSegments ) ;
  return finalResultGrid . map ( rowArray => rowArray . join ( " " ) ) . join ( "\n" ) ;
}

function divideAndConquer ( startRow , startCol , totalRows , totalCols , currentSegmentId , requiredTargets ) {
  if ( requiredTargets === 1 ) {
    for ( var currentY = startRow ; currentY < totalRows ; currentY ++ )
    for ( var currentX = startCol ; currentX < totalCols ; currentX ++ ) {
      finalResultGrid [ currentY ] [ currentX ] = currentSegmentId ;
    }
    return ;
  }
  var countInRows = createMultiDimArray ( 0 , totalRows - startRow ) ;
  var countInCols = createMultiDimArray ( 0 , totalCols - startCol ) ;
  for ( var currentY = startRow ; currentY < totalRows ; currentY ++ ) {
    for ( var currentX = startCol ; currentX < totalCols ; currentX ++ ) {
      if ( rawInputGrid [ currentY ] [ currentX ] === "#" ) {
        countInRows [ currentY - startRow ] ++ ;
        countInCols [ currentX - startCol ] ++ ;
      }
    }
  }
  for ( var currentY = startRow + 1 ; currentY < totalRows ; currentY ++ )
    countInRows [ currentY - startRow ] += countInRows [ currentY - startRow - 1 ] ;
  for ( var currentX = startCol + 1 ; currentX < totalCols ; currentX ++ )
    countInCols [ currentX - startCol ] += countInCols [ currentX - startCol - 1 ] ;
  if ( startCol + 1 === totalCols )
    return splitVertically ( startRow , startCol , totalRows , totalCols , currentSegmentId , requiredTargets , countInRows ) ;
  var splitColPosition = startCol + totalCols >> 1 ;
  splitColPosition -= startCol ;
  if ( countInCols [ splitColPosition ] === 0 ) {
    while ( ++ splitColPosition ) {
      if ( countInCols [ splitColPosition ] !== 0 ) break ;
    }
    if ( countInCols [ splitColPosition ] === requiredTargets )
      return splitVertically ( startRow , startCol , totalRows , totalCols , currentSegmentId , requiredTargets , countInRows ) ;
  }
  if ( countInCols [ splitColPosition ] === requiredTargets ) {
    while ( -- splitColPosition ) {
      if ( countInCols [ splitColPosition ] !== requiredTargets ) break ;
    }
    if ( countInCols [ splitColPosition ] === 0 || countInCols [ splitColPosition ] === requiredTargets )
      return splitVertically ( startRow , startCol , totalRows , totalCols , currentSegmentId , requiredTargets , countInRows , requiredTargets ) ;
  }
  divideAndConquer ( startRow , startCol , totalRows , splitColPosition + startCol + 1 , currentSegmentId , countInCols [ splitColPosition ] ) ;
  divideAndConquer ( startRow , splitColPosition + startCol + 1 , totalRows , totalCols , currentSegmentId + countInCols [ splitColPosition ] , requiredTargets - countInCols [ splitColPosition ] ) ;
}

function splitVertically ( startRow , startCol , totalRows , totalCols , currentSegmentId , requiredTargets , countInRows ) {
  var splitRowPosition = startRow + totalRows >> 1 ;
  splitRowPosition -= startRow ;
  if ( countInRows [ splitRowPosition ] === 0 ) {
    while ( ++ splitRowPosition ) {
      if ( countInRows [ splitRowPosition ] !== 0 ) break ;
    }
  } else if ( countInRows [ splitRowPosition ] === requiredTargets ) {
    while ( -- splitRowPosition ) {
      if ( countInRows [ splitRowPosition ] !== requiredTargets ) break ;
    }
  }
  divideAndConquer ( startRow , startCol , splitRowPosition + startRow + 1 , totalCols , currentSegmentId , countInRows [ splitRowPosition ] ) ;
  divideAndConquer ( splitRowPosition + startRow + 1 , startCol , totalRows , totalCols , currentSegmentId + countInRows [ splitRowPosition ] , requiredTargets - countInRows [ splitRowPosition ] ) ;
}