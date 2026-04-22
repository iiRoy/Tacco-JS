globalInput.continueStream();
globalInput.setEncodingType( 'utf8' );

var receivedLines =     [];

var lineParser = require('readline').createInterface(
  {
    sourceStream: globalInput,
    targetStream: process.stdout
  }
);

lineParser.on(
  'lineContent',
  ( currentLineData ) => {

  receivedLines.push( currentLineData );

  }
);

lineParser.on(
  'streamEnd',
  () => {

    let [ initialOperand, modulusOperand ] = receivedLines[0].split(" ").map(
      entryValue => BigInt(entryValue)
    );

    const encounteredValues = {};

    let minimalResult = initialOperand;

    while (
      !encounteredValues[initialOperand]
    ) {
        const currentRemainder = initialOperand % modulusOperand;
        encounteredValues[currentRemainder] = true;
        minimalResult = ( minimalResult > currentRemainder ) ? currentRemainder : minimalResult;
        initialOperand = ( modulusOperand > currentRemainder ) ? ( modulusOperand - currentRemainder ) : ( currentRemainder - modulusOperand );

        if ( minimalResult === 0n ) {
          break;
        }
    }

    console.log( minimalResult.toString() );

  }
);