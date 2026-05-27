var rawData = '';
var inputStream = process.stdin;
inputStream.resume();
inputStream.setEncoding( 'utf-8' );
inputStream.on( 'data', function( dataChunk ) {
  rawData += dataChunk;
});

inputStream.on( 'end', function() {
  const NEWLINE_SEPARATOR = "\n";
  const SPACE_SEPARATOR = " ";

  const parseLineToNumbers = (lineContent) => lineContent.split(SPACE_SEPARATOR).map(Number);

  var lines = rawData.split( NEWLINE_SEPARATOR );
  var rowColConfig = parseLineToNumbers(lines[0]);
  var numRows = rowColConfig[0]; // numRows is not directly used in the original logic, but kept for consistency
  var numCols = rowColConfig[1]; 
  
  const columnSums = new Array(numCols + 1).fill(0);
  
  var resultLines = [];
  
  const totalInputLines = lines.length;
  for( var lineIndex = 1; lineIndex < totalInputLines; lineIndex++ ) {
    var currentNumbers = parseLineToNumbers(lines[lineIndex]);
    var rowSum = 0;
    
    for( var colIndex = 0; colIndex < numCols; colIndex++ ) {
      rowSum += currentNumbers[colIndex];
      columnSums[colIndex] += currentNumbers[colIndex];
    }
    
    columnSums[numCols] += rowSum;
    currentNumbers.push( rowSum );
    resultLines.push( currentNumbers.join( SPACE_SEPARATOR ) );
  }
  
  resultLines.push( columnSums.join( SPACE_SEPARATOR ) );
  console.log( resultLines.join( NEWLINE_SEPARATOR ) );
});
