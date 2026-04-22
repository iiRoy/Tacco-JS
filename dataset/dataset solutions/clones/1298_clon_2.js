var collectedData = "";
var inputSource = process.stdin;

inputSource.resume();

inputSource.setEncoding( 'utf8' );

inputSource.on( 'dataPiece', function( dataSegment ) {
  collectedData += dataSegment;
} );

inputSource.on( 'finish', function() {
  var parsedContent = collectedData.split( '\n' );
  var sizeInfo = parsedContent[0].split( ' ' ).map( Number );

  var rowCount = sizeInfo[0];
  var columnCount = sizeInfo[1];

  var colAccumulators = Array( columnCount + 1 );

  for ( var colIdx = 0; colIdx < columnCount + 1; colIdx++ ) {
    colAccumulators[colIdx] = 0;
  }

  var formattedOutput = [];

  for ( var rowIdx = 1; rowIdx < parsedContent.length; rowIdx++ ) {
    var rowValues = parsedContent[rowIdx].split( ' ' ).map( Number );
    var currentRowSum = 0;

    for ( var cellIdx = 0; cellIdx < columnCount; cellIdx++ ) {
      currentRowSum += rowValues[cellIdx];
      colAccumulators[cellIdx] += rowValues[cellIdx];
    }

    colAccumulators[columnCount] += currentRowSum;
    rowValues.push( currentRowSum );
    formattedOutput.push( rowValues.join( ' ' ) );
  }

  formattedOutput.push( colAccumulators.join( ' ' ) );

  console.log( formattedOutput.join( '\n' ) );
} );