function ProcessRawData ( initialStream ) {
  let parsedLines = initialStream.split( "\n" );

  const totalElements = parseInt( parsedLines[0], 10 );
  const elementSequence = parsedLines[1];
  const numInstructions = parseInt( parsedLines[2], 10 );

  let currentReadPosition = 3;
  let instructionList = [ ];

  for ( let lineIdx = 0; lineIdx < numInstructions; lineIdx++ ) {
    instructionList[ lineIdx ] = parsedLines[ ( currentReadPosition + lineIdx ) ];
  }

  for ( let currentInstruction of instructionList ) {
    currentInstruction = currentInstruction.split( " " );
    let instructionKind = parseInt( currentInstruction[0], 10 );

    switch ( instructionKind ) {
      case 1 :
        let targetIndex = parseInt( currentInstruction[1], 10 );
        let replacementChar = currentInstruction[2];
        if ( elementSequence[targetIndex] !== replacementChar ) {
            elementSequence[targetIndex] = replacementChar;
        }
        break;

      case 2 :
        let startPos = parseInt( currentInstruction[1], 10 );
        let endPos = parseInt( currentInstruction[2], 10 );
        let distinctElements = { };

        if ( startPos <= endPos && startPos < totalElements ) {
          for ( ; startPos < endPos ; startPos++ ) {
            distinctElements[ elementSequence[ (startPos - 1) ] ] = null;
          }
        }
        console.log( Object.keys( distinctElements ).length );
        break;

      default :
        break;
    }
  }
}