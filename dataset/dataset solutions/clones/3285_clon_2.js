var InputReader = ( function () {
  function createReader ( inputString ) {
    return new ReaderInstance( inputString ) ;
  }

  function ReaderInstance ( inputString ) {
    this._sourceLines = inputString.trim().split( "\n" ) ;
    this._currentLineIdx = 0 ;
  }

  ReaderInstance.prototype.readSingleValue = function ( asString ) {
    var currentLines = this._sourceLines,
        pointerIdx = this._currentLineIdx,
        extractedValue ;

    if ( typeof currentLines[ pointerIdx ] === "string" ) {
      currentLines[ pointerIdx ] = currentLines[ pointerIdx ].split( " " ).reverse() ;
    }

    extractedValue = currentLines[ pointerIdx ].pop() ;

    if ( ! currentLines[ pointerIdx ].length ) {
      this._currentLineIdx++ ;
    }

    return asString ? extractedValue : +extractedValue ;
  } ;

  ReaderInstance.prototype.readLineValues = function ( asStringArr ) {
    var lineParts = this._sourceLines[ this._currentLineIdx++ ].split( " " ) ;
    return asStringArr ? lineParts : lineParts.map( partStr => +partStr ) ;
  } ;

  ReaderInstance.prototype.readMatrixData = function ( numRows, keepStrings ) {
    var matrixRows = this._sourceLines
                       .slice( this._currentLineIdx, this._currentLineIdx += numRows )
                       .map( rowStr => rowStr.split( " " ) ) ;

    return keepStrings
             ? matrixRows
             : matrixRows.map( rowElements => rowElements.map( cellStr => +cellStr ) ) ;
  } ;

  ReaderInstance.prototype.readRowsAsList = function ( rowCount, returnStrings ) {
    var slicedRows = this._sourceLines
                       .slice( this._currentLineIdx, this._currentLineIdx += rowCount ) ;
    return returnStrings ? slicedRows : slicedRows.map( rowContent => +rowContent ) ;
  } ;

  return createReader ;
} )() ;

var dataProcessor = InputReader( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;

console.log( computeResult() ) ;

function computeResult () {
  var gridHeight = dataProcessor.readSingleValue() ;
  var gridWidth = dataProcessor.readSingleValue() ;
  var inputGrid = dataProcessor.readRowsAsList( gridHeight, 1 ) ;

  var visitedRegions = Array( gridHeight ).fill( 0 ).map( _ => Array( gridWidth ).fill( 0 ) ) ;
  var regionCounter = 0 ;

  for ( var rowIdx = 0 ; rowIdx < gridHeight ; rowIdx++ ) {
    for ( var colIdx = 0 ; colIdx < gridWidth ; colIdx++ ) {
      if ( visitedRegions[ rowIdx ][ colIdx ] !== 0 ) {
        continue ;
      }

      visitedRegions[ rowIdx ][ colIdx ] = ++regionCounter ;
      var cellsToVisit = [ [ rowIdx, colIdx ] ] ;

      while ( cellsToVisit.length ) {
        var currentCoords = cellsToVisit.pop() ;
        var currentCol = currentCoords[ 1 ] ;
        var currentRow = currentCoords[ 0 ] ;

        if ( currentRow > 0 && visitedRegions[ currentRow - 1 ][ currentCol ] === 0 && inputGrid[ currentRow ][ currentCol ] !== inputGrid[ currentRow - 1 ][ currentCol ] ) {
          visitedRegions[ currentRow - 1 ][ currentCol ] = regionCounter ;
          cellsToVisit.push( [ currentRow - 1, currentCol ] ) ;
        }
        if ( currentRow < gridHeight - 1 && visitedRegions[ currentRow + 1 ][ currentCol ] === 0 && inputGrid[ currentRow ][ currentCol ] !== inputGrid[ currentRow + 1 ][ currentCol ] ) {
          visitedRegions[ currentRow + 1 ][ currentCol ] = regionCounter ;
          cellsToVisit.push( [ currentRow + 1, currentCol ] ) ;
        }
        if ( currentCol > 0 && visitedRegions[ currentRow ][ currentCol - 1 ] === 0 && inputGrid[ currentRow ][ currentCol ] !== inputGrid[ currentRow ][ currentCol - 1 ] ) {
          visitedRegions[ currentRow ][ currentCol - 1 ] = regionCounter ;
          cellsToVisit.push( [ currentRow, currentCol - 1 ] ) ;
        }
        if ( currentCol < gridWidth - 1 && visitedRegions[ currentRow ][ currentCol + 1 ] === 0 && inputGrid[ currentRow ][ currentCol ] !== inputGrid[ currentRow ][ currentCol + 1 ] ) {
          visitedRegions[ currentRow ][ currentCol + 1 ] = regionCounter ;
          cellsToVisit.push( [ currentRow, currentCol + 1 ] ) ;
        }
      }
    }
  }

  var regionCounts = Array( regionCounter + 1 ).fill( 0 ).map( _ => [ 0, 0 ] ) ;
  var finalAnswer = 0 ;

  for ( currentRow = 0 ; currentRow < gridHeight ; currentRow++ ) {
    for ( currentCol = 0 ; currentCol < gridWidth ; currentCol++ ) {
      if ( inputGrid[ currentRow ][ currentCol ] === "." ) {
        regionCounts[ visitedRegions[ currentRow ][ currentCol ] ][ 0 ]++ ;
      } else {
        regionCounts[ visitedRegions[ currentRow ][ currentCol ] ][ 1 ]++ ;
      }
    }
  }

  for ( currentRow = 0 ; currentRow <= regionCounter ; currentRow++ ) {
    finalAnswer += regionCounts[ currentRow ][ 0 ] * regionCounts[ currentRow ][ 1 ] ;
  }

  return finalAnswer ;
}