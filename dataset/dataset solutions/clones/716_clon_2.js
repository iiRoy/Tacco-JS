#!/usr/bin/node
( function( )
{
  var bufferedData = [ ] ;
  var dataGrid = [ ] ;
  var stdInput = process.openStdin( ) ;
  stdInput.setEncoding( 'utf8' ) ;

  var scanRegion = function( colIdx, rowIdx )
  {
    if ( 0 <= colIdx
      && colIdx < dataGrid[0].length
      && 0 <= rowIdx
      && rowIdx < dataGrid.length
      && dataGrid[rowIdx][colIdx]
    ) {
      dataGrid[rowIdx][colIdx] = 0 ;
      scanRegion( colIdx - 1, rowIdx ) ;
      scanRegion( colIdx + 1, rowIdx ) ;
      scanRegion( colIdx, rowIdx - 1 ) ;
      scanRegion( colIdx, rowIdx + 1 ) ;
      scanRegion( colIdx - 1, rowIdx - 1 ) ;
      scanRegion( colIdx + 1, rowIdx - 1 ) ;
      scanRegion( colIdx - 1, rowIdx + 1 ) ;
      scanRegion( colIdx + 1, rowIdx + 1 ) ;
    }
  } ;

  var remainingChunk = "" ;
  stdInput.on( 'data', function( dataPacket )
  {
	var lineArray = ( remainingChunk + dataPacket ).split( "\n" ) ;
	remainingChunk = lineArray.pop( ) ;
	for ( var lineCounter = 0 ; lineCounter < lineArray.length ; lineCounter++ )
    {
		if ( lineArray[lineCounter] == '' )
        {
            continue ;
        }
		var currentLineElements = lineArray[lineCounter].split( " " ) ;
    	for ( var elementCounter = 0 ; elementCounter < currentLineElements.length ; elementCounter++ )
        {
            currentLineElements[elementCounter] = parseInt( currentLineElements[elementCounter] ) ;
        }
		bufferedData.push( currentLineElements ) ;
	}
  } ) ;

  stdInput.on( 'end', function( completionEvent )
  {
    var regionCount, outerLoopIdx, innerLoopIdx ;
    for ( ; ; )
    {
      regionCount = 0 ;
      var matrixRows = ( bufferedData.shift( ) )[1] ;
      if ( !matrixRows )
      {
          break ;
      }
      dataGrid = bufferedData.slice( 0, matrixRows ) ;
      for ( outerLoopIdx = 0 ; outerLoopIdx < dataGrid[0].length ; outerLoopIdx++ )
      {
          for ( innerLoopIdx = 0 ; innerLoopIdx < dataGrid.length ; innerLoopIdx++ )
          {
              if ( dataGrid[innerLoopIdx][outerLoopIdx] )
              {
                  regionCount++ ;
                  scanRegion( outerLoopIdx, innerLoopIdx ) ;
              }
          }
      }
      console.log( regionCount ) ;
      bufferedData = bufferedData.slice( matrixRows ) ;
    }
  } ) ;
} ).call( this ) ;