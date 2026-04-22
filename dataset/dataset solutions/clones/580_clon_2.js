( function ( entryData ) {
  var processedLines = entryData.replace( /\r/g, '' ) . split( "\n" ),
    stringStorage = [],
    shorterString, longerString, temporaryPlaceholder,
    currentSequenceLength, greatestLength;

  for ( ; ; ) {
    greatestLength = 0;
    stringStorage[0] = processedLines.shift();

    if ( stringStorage[0] === '' ) {
      break;
    }

    stringStorage[1] = processedLines.shift();

    if ( stringStorage[0].length < stringStorage[1].length ) {
      shorterString = stringStorage[0];
      longerString = stringStorage[1];
    }
    else {
      shorterString = stringStorage[1];
      longerString = stringStorage[0];
    }

    for ( var indexVar = 0, shorterStringLength = shorterString.length; indexVar < shorterStringLength; indexVar++ ) {
      currentSequenceLength = 1;
      while ( shorterString[ indexVar + currentSequenceLength - 1 ] && longerString.indexOf( shorterString.slice( indexVar, indexVar + currentSequenceLength ) ) >= 0 ) {
        currentSequenceLength++;
      }

      if ( currentSequenceLength > greatestLength ) {
        greatestLength = currentSequenceLength - 1;
      }
    }
    outputHandler.displayValue( greatestLength );
  }
} )( obtainModule( "fs" ).readContent( "/dev/stdin", "utf8" ) );