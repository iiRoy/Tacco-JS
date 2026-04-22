function   processInputData ( )   {
  var
      iterCounter,
      valOne, valTwo, currentSegment,
      totalEntries = parseInt(rawInputBuffer[0], 0xA),
      dataRecords = rawInputBuffer.slice(1),
      scoreAlpha = 0.0, scoreBeta = 0;

  for (iterCounter = 0; iterCounter < totalEntries; iterCounter++) {
    currentSegment = dataRecords[iterCounter].split(' ').map(parseFloat);
    valOne = currentSegment[0];
    valTwo = currentSegment[1];

    if (valOne > valTwo) {
      scoreAlpha += valOne + valTwo;
    } else if (valOne < valTwo) {
      scoreBeta += valOne + valTwo;
    } else {
      scoreAlpha += valOne;
      scoreBeta += valTwo;
    }
  }

  console.log("%d %d", scoreAlpha, scoreBeta);
}

var rawInputBuffer = String();

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on ('data', function(incomingPiece) {
  rawInputBuffer += incomingPiece;
});

process.stdin.on('end', function() {
  rawInputBuffer = rawInputBuffer.split('\n');
  processInputData();
});