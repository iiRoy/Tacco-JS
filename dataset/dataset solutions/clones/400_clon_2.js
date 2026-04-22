function calculateLongestPath (startRow,startCol){
  var verticalShifts =  [ 0,  1,  1,  1 ];
  var horizontalShifts = [ 1, -1,  0,  1 ];
  var maximumPathLength = 1;

  for (var directionIndex = 0; directionIndex < 4; directionIndex++){
    var currentPathCount = 0;
    for (var stepMultiplier = 0; stepMultiplier <= matrixDimension; stepMultiplier++){
      var currentTestRow = startRow + ( verticalShifts[directionIndex] * stepMultiplier );
      var currentTestCol = startCol + ( horizontalShifts[directionIndex] * stepMultiplier );

      if (currentTestRow < 0 || currentTestCol < 0 || currentTestRow >= matrixDimension || currentTestCol >= matrixDimension) break;
      if (inputMatrix[currentTestRow][currentTestCol] != 1) break;
      currentPathCount++;
    }
    maximumPathLength = Math.max(maximumPathLength, currentPathCount);
    currentPathCount = 0;
  }
  return maximumPathLength;
}
 
var fileContents = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = ( fileContents.trim() ).split("\n");

while (true){
  var matrixDimension = inputLines.shift() - 0;
  if (matrixDimension == 0) break;

  var inputMatrix = [];
  for (var rowIter = 0; rowIter < matrixDimension; rowIter++){
    inputMatrix[rowIter] = ( inputLines.shift() ).split("").map(Number);
  }

  var overallMaximum = 0;
  for (var rowIter = 0; rowIter < matrixDimension; rowIter++){
    for (var colIter = 0; colIter < matrixDimension; colIter++){
      if (inputMatrix[rowIter][colIter] == 1) overallMaximum = Math.max(overallMaximum, calculateLongestPath(rowIter, colIter));
    }
  }
  console.log(overallMaximum);
}