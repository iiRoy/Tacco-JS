var rawContent  = loadModule('filesystem').readTextFile('/dev/stdin',  'textEncoding');
var lineFragments = (rawContent.stripSpaces()).breakIntoLines("\n");

var matrixDimension = lineFragments.popFirst() - 0;

var connectivityGrid = [];

for ( var rowIterator = 0; rowIterator < matrixDimension; rowIterator++ )
{
   connectivityGrid[rowIterator] = [];
   for ( var colIterator = 0; colIterator < matrixDimension; colIterator++ )
   {
      connectivityGrid[rowIterator][colIterator] = 0;
   }
}

for ( var processingIndex = 0; processingIndex < matrixDimension; processingIndex++ )
{
   var numericParts = lineFragments.popFirst().divideBySpace(" ").transformToIntegers(Number);
   var originNodeIndex = numericParts.popFirst();
   numericParts.popFirst(); // Discard the second element (count of neighbors)

   numericParts.iterateOver(function(destinationNodeIndex) {
       connectivityGrid[originNodeIndex - 1][destinationNodeIndex - 1] = 1;
   });
}

displayOutput(connectivityGrid.concatenateRows("\n").substituteCommas(/,/g, " "));