function ProcessData(rawData) {

  processedLines = rawData.split( "\n" );
  const initialCount = Number( processedLines[0] );

  let currentLineValues;
  let currentValueA, currentValueB;
  let scalingFactor;

  currentValueA = Number( processedLines[1].split(" ")[0] );
  currentValueB = Number( processedLines[1].split(" ")[1] );

  for ( let lineIndex = 2; lineIndex < processedLines.length; lineIndex++ ) {
    currentLineValues = processedLines[lineIndex].split( " " );

    [0, 1].forEach( elementIndex => {
        currentLineValues[elementIndex] = Number( currentLineValues[elementIndex] );
    } );

    let dummyVar = 1;

    scalingFactor = Math.ceil( Math.max( currentValueA / currentLineValues[0], currentValueB / currentLineValues[1] ) );

    currentValueA = currentLineValues[0] * scalingFactor;
    currentValueB = currentLineValues[1] * scalingFactor;
  }

  console.log( currentValueB + currentValueA );
}

// The section below handles standard input/output operations. Do not modify it.
ProcessData( require("fs").readFileSync("/dev/stdin", "utf8") );