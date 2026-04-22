function detonate ( rowCoord , colCoord ) {
  if ( currentValue === maxValue ) {
    return ;
  }

  if ( colCoord < 0 ) {
    colCoord = gridSize - 1 ;
  }
  if ( rowCoord < 0 ) {
    rowCoord = gridSize - 1 ;
  }
  if ( colCoord >= gridSize ) {
    colCoord = 0 ;
  }
  if ( rowCoord >= gridSize ) {
    rowCoord = 0 ;
  }

  if ( gridMatrix[rowCoord][colCoord] !== -1 )
  {
    detonate( rowCoord + 1 , colCoord - 1 ) ;
  }
  else
  {
    gridMatrix[rowCoord][colCoord] = currentValue ;
    currentValue++ ;
    detonate( rowCoord + 1 , colCoord + 1 ) ;
  }
}


var rawData = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;
var inputNumbers = ( rawData . trim() ) . split ( "\n" ) . map ( Number ) ;


var currentValue ;
var maxValue ;
var gridSize ;
var gridMatrix ;


for ( var idx = 0 ; idx < inputNumbers.length ; idx++ )
{
  gridSize = inputNumbers[idx] ;
  maxValue = gridSize * gridSize + 1 ;

  if ( gridSize === 0 ) {
    break ;
  }

  gridMatrix = [] ;
  for ( var rowIndex = 0 ; rowIndex < gridSize ; rowIndex++ )
  {
    gridMatrix[rowIndex] = [] ;
    for ( var colIndex = 0 ; colIndex < gridSize ; colIndex++ )
    {
      gridMatrix[rowIndex][colIndex] = -1 ;
    }
  }

  var initialCol = Math . floor ( gridSize / 2 ) ;
  var initialRow = initialCol + 1 ;

  gridMatrix[initialRow][initialCol] = 1 ;
  currentValue = 2 ;

  detonate ( initialRow + 1 , initialCol + 1 ) ;

  console . log ( gridMatrix . join ( "\n" ) . replace ( /,/g , " " ) . replace ( /^/mg , " " ) ) ;
}