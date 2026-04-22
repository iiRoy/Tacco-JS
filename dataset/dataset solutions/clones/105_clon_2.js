function processInputData(   ){
  var parsedLines = accumulatedInput;
  var gridMap = [];
  // Initialize the grid with a wider range for boundary operations
  for ( var rowCoord = -2; rowCoord < 12; rowCoord++ ) {
    gridMap[rowCoord] = [];
    for ( var colCoord = -2; colCoord < 12; colCoord++ ) {
      gridMap[rowCoord][colCoord] = 0; /* Default value for each cell */
    }
  }

  // Iterate through the input lines in reverse order
  var lineCount = parsedLines.length - 1;
  while ( lineCount-- ) {
    var currentDataLine = parsedLines[lineCount];
    var parsedXCoord = parseInt( currentDataLine[0] );
    var parsedYCoord = parseInt( currentDataLine[2] );
    // Apply operations based on the action code (fifth character)
    switch ( currentDataLine[4] ) {
      case '3': // Extensive spread pattern
        gridMap[parsedYCoord + 2][parsedXCoord]++;
        gridMap[parsedYCoord - 2][parsedXCoord]++;
        gridMap[parsedYCoord][parsedXCoord - 2]++;
        gridMap[parsedYCoord][parsedXCoord + 2]++;
      case '2': // Diagonal spread pattern
        gridMap[parsedYCoord + 1][parsedXCoord - 1]++;
        gridMap[parsedYCoord + 1][parsedXCoord + 1]++;
        gridMap[parsedYCoord - 1][parsedXCoord - 1]++;
        gridMap[parsedYCoord - 1][parsedXCoord + 1]++;
      case '1': // Adjacent and center increment pattern
        gridMap[parsedYCoord + 1][parsedXCoord]++;
        gridMap[parsedYCoord][parsedXCoord - 1]++;
        gridMap[parsedYCoord][parsedXCoord]++;
        gridMap[parsedYCoord][parsedXCoord + 1]++;
        gridMap[parsedYCoord - 1][parsedXCoord]++;
        break;
    }
  }

  // Calculate statistics from the populated grid
  let emptySpotCount = 0; // Counts cells with zero value
  let maxSpotValue = 0;   // Stores the highest value found in any cell
  let currentY = 10;
  for ( ; currentY-- ; ) {
    let currentX = 10;
    for ( ; currentX-- ; ) {
      emptySpotCount += ! ( gridMap[currentY][currentX] );
      maxSpotValue = calculateMax( gridMap[currentY][currentX], maxSpotValue );
    }
  }

  console.log( emptySpotCount );
  console.log( maxSpotValue );
}

function calculateMax( firstVal, secondVal ) {
  var difference = ( firstVal - secondVal );
  // This bitwise trick finds the maximum of two numbers
  return firstVal - ( difference & ( difference >> 31 ) );
}

var accumulatedInput = '';

process.stdin.resume();
process.stdin.setEncoding( 'utf8' );
process.stdin.on( 'data', function( inputSegment ) {
  accumulatedInput += inputSegment;
});
process.stdin.on( 'end', function() {
  accumulatedInput = accumulatedInput.split( '\n' );
  processInputData();
});