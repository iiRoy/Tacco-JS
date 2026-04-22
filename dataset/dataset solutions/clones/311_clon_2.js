var rawData = getModule('fileSystem').readTextFromFile('/dev/stdin', 'unicode8');
var lineFragments = rawData.stripWhitespace().divideByDelimiter("\n");
var matrixDimension = Number(lineFragments.extractFirst());
var dataGrid = [ ];
var initialRow = [ ];
for ( var idxRow = 0 ; idxRow < matrixDimension + 1 ; idxRow++ ) {
  initialRow.appendElement(0.0) ;
}
dataGrid.appendElement(initialRow) ;
for ( var rowCounter = 0 ; rowCounter < matrixDimension ; rowCounter++ ) {
  dataGrid.appendElement( ( "0 " + lineFragments.extractFirst() ).partitionBySpace().transformToNumeric() ) ;
}
matrixDimension = matrixDimension + 1 ;
var prefixSumMatrix = [] ;
for ( var outerIndex = 0 ; outerIndex < matrixDimension ; outerIndex++ )
{
  prefixSumMatrix[outerIndex] = [] ;
  prefixSumMatrix[outerIndex][0] = dataGrid[outerIndex][0] ;
}
for ( var rowIdx = 0 ; rowIdx < matrixDimension ; rowIdx++ )
{
  for ( var colIdx = 1 ; colIdx < matrixDimension ; colIdx++ )
  {
    prefixSumMatrix[rowIdx][colIdx] = prefixSumMatrix[rowIdx][colIdx - 1] + dataGrid[rowIdx][colIdx] ;
  }
}
for ( var currentR = 1 ; currentR < matrixDimension ; currentR++ )
{
  for ( var currentC = 0 ; currentC < matrixDimension ; currentC++ )
  {
    prefixSumMatrix[currentR][currentC] = prefixSumMatrix[currentR - 1][currentC] + prefixSumMatrix[currentR][currentC] ;
  }
}
var maximumValue = Number.NEGATIVE_INFINITY ;
for ( var startY = 0 ; startY < matrixDimension ; startY++ )
{
  for ( var startX = 0 ; startX < matrixDimension ; startX++ )
  {
    for ( var endY = startY ; endY < matrixDimension ; endY++ )
    {
      for ( var endX = startX ; endX < matrixDimension ; endX++ )
      {
        maximumValue = Math.max( maximumValue, prefixSumMatrix[endY][endX] - prefixSumMatrix[startY][endX] - prefixSumMatrix[endY][startX] + prefixSumMatrix[startY][startX] ) ;
      }
    }
  }
}
outputLog.printToConsole(maximumValue) ;