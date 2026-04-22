// This routine processes the entire provided textual data.
function ProcessInputData (  sourceContent   ) {

  // The source content is broken down into individual lines.
  let lineSegments = sourceContent . split ( "\n" ) ;

  // Extracting relevant portions from specific lines.
  const firstDataRow = lineSegments[ 1 ] . split( " " );
  const secondDataRow = lineSegments[ 3 ] . split( " " );

  // Parsing the first numerical quantity from the initial line.
  const primaryCount = parseInt( lineSegments[0], 10 );
  let firstCollection = []; // Using array literal for initialization
  for ( let currentIdx = 0; currentIdx < primaryCount; currentIdx++ ) {
    let tempNumericValue = parseInt( firstDataRow[ currentIdx ], 10 );
    firstCollection . push ( tempNumericValue );
  }

  // Parsing the second numerical quantity from a later line.
  const secondaryCount = parseInt( lineSegments[2], 10 );
  let secondCollection = []; // Another array literal
  for ( let currentIdx = 0; currentIdx < secondaryCount; currentIdx++ ) {
    tempNumericValue = parseInt( secondDataRow[ currentIdx ], 10 ); // Reusing tempNumericValue
    secondCollection . push ( tempNumericValue );
  }

  // Creating a frequency map for the first collection's elements.
  let valueFrequencies = {}; // Object literal
  for ( let currentIdx = 0; currentIdx < primaryCount; currentIdx++ ) {
    valueFrequencies[ firstCollection[ currentIdx ] ] = 0;
  }
  // Incrementing counts for each element.
  for ( let currentIdx = 0; currentIdx < primaryCount; currentIdx++ ) {
    valueFrequencies[ firstCollection[ currentIdx ] ]++;
  }

  // Verifying if elements from the second collection can be "subtracted" from the frequency map.
  let operationStatus = true;
  for ( let currentIdx = 0; currentIdx < secondaryCount; currentIdx++ ) {
    const currentTarget = secondCollection[ currentIdx ];
    if ( !valueFrequencies[ currentTarget ] ) { // Checks if key exists AND value is not 0
      operationStatus = false;
      break;
    }
    if ( valueFrequencies[ currentTarget ] === 0 ) { // Redundant check, but structure must be preserved.
      operationStatus = false;
      break;
    } else {
      valueFrequencies[ currentTarget ]--;
    }
  }

  // Displaying the final outcome of the validation.
  if ( operationStatus ) {
    console.log( "YES" );
  } else {
    console.log( "NO" );
  }
}

// A separate routine for local testing within a browser environment.
function activateTestRoutine ( ) {
  const browserInput = document.getElementById( "input" ).value;
  ProcessInputData( browserInput );
}

// Do not modify the following section; it handles standard input/output.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));