#!/usr/bin/node
( function()
{
  var dataGrid = [ ] ;
  var bufferedLines = [ ] ;
  var inputSource = process.openStdin ( ) ;
  inputSource.setEncoding ( 'utf8' ) ;

  var clearConnectedCells = function ( columnCoord, rowCoord )
  {
    if ( 0 <= columnCoord && columnCoord < dataGrid[0].length && 0 <= rowCoord && rowCoord < dataGrid.length && dataGrid[rowCoord][columnCoord] )
    {
      dataGrid[rowCoord][columnCoord] = 0 ;
      clearConnectedCells ( columnCoord - 1, rowCoord ) ;
      clearConnectedCells ( columnCoord + 1, rowCoord ) ;
      clearConnectedCells ( columnCoord, rowCoord - 1 ) ;
      clearConnectedCells ( columnCoord, rowCoord + 1 ) ;
      clearConnectedCells ( columnCoord - 1, rowCoord - 1 ) ;
      clearConnectedCells ( columnCoord + 1, rowCoord - 1 ) ;
      clearConnectedCells ( columnCoord - 1, rowCoord + 1 ) ;
      clearConnectedCells ( columnCoord + 1, rowCoord + 1 ) ;
    }
  };

  var partialBuffer = "" ;
  inputSource.on ( 'data', function ( receivedData )
  {
    var linesToProcess = ( partialBuffer + receivedData ).split ( "\n" ) ;
    partialBuffer = linesToProcess.pop ( ) ;
    for ( var lineIdx = 0 ; lineIdx < linesToProcess.length ; lineIdx++ )
    {
      if ( linesToProcess[lineIdx] === '' )
      {
        continue ;
      }
      var tokensInLine = linesToProcess[lineIdx].split ( " " ) ;
      for ( var charIdx = 0 ; charIdx < tokensInLine.length ; charIdx++ )
      {
        tokensInLine[charIdx] = parseInt ( tokensInLine[charIdx] ) ;
      }
      bufferedLines.push ( tokensInLine ) ;
    }
  } ) ;

  inputSource.on ( 'end', function ( completionEvent )
  {
    var lineIdx, charIdx, regionCounter ;
    for ( ; ; )
    {
      regionCounter = 0 ;
      var currentMatrixHeight = ( bufferedLines.shift ( ) ) [ 1 ] ;
      if ( ! currentMatrixHeight )
      {
        break ;
      }
      dataGrid = bufferedLines.slice ( 0, currentMatrixHeight ) ;
      for ( lineIdx = 0 ; lineIdx < dataGrid[0].length ; lineIdx++ )
      {
        for ( charIdx = 0 ; charIdx < dataGrid.length ; charIdx++ )
        {
          if ( dataGrid[charIdx][lineIdx] )
          {
            regionCounter++ ;
            clearConnectedCells ( lineIdx, charIdx ) ;
          }
        }
      }
      console.log ( regionCounter ) ;
      bufferedLines = bufferedLines.slice ( currentMatrixHeight ) ;
    }
  } ) ;
} ).call ( this ) ;