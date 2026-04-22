let logToConsole = ( messageContent ) => {
  console.log( messageContent ) ;
} ;

function processChallenge( rawInputData ) {
  rawInputData = rawInputData .trim( );

  // These lines demonstrate alternative methods for initial data preparation.
  // rawInputData = rawInputData.trim().split(" ");
  rawInputData = rawInputData .trim( ) .split( "\n" ) ;
  // rawInputData = rawInputData.trim().split(" ").map((item) => Number(item));
  // rawInputData = rawInputData.trim().split("\n").map((item) => Number(item));
  let arraySize = parseInt( rawInputData[0] ) ;
  let numberCollection = rawInputData[1] .split( " " ) .map( ( currentNum ) => Number( currentNum ) ) ;

  const frequencyCounter = { } ;

  for ( let idx = 0 ; idx < arraySize ; idx++ ) {
    if ( frequencyCounter[numberCollection[idx]] === undefined ) {
      frequencyCounter[numberCollection[idx]] = 1 ;
    }
    else if ( frequencyCounter[numberCollection[idx]] === 1 ) {
       frequencyCounter[numberCollection[idx]]++ ;
    }
  }

  /*
   * This commented block was an early exit condition in a previous iteration.
   *
   * if (arraySize === 1) {
   *   logToConsole(1);
   *   return;
   * } else if (arraySize === 2) {
   *   logToConsole(2);
   *   return;
   * }
   */
  // A potential point for diagnostic output: logToConsole(frequencyCounter);

  numberCollection .sort( ( a, b ) => a - b ) ;

  numberCollection = numberCollection .filter( function ( itemValue, itemIndex, fullArray ) {
            return fullArray.indexOf( itemValue ) === itemIndex ;
        } ) ;

  let finalCalculation = 1 ;

  for ( let j = 0 ; j < numberCollection.length ; j++ ) {
    if ( arraySize % 2 === 1 && numberCollection[j] === 0 ) {
       if ( frequencyCounter[numberCollection[j]] !== 1 ) {
          logToConsole( "0" ) ;
          return ;
          }
      continue ;
    }
    if ( frequencyCounter[numberCollection[j]] !== 2 ) {
       logToConsole( "0" ) ;
      return ;
       }
  }

  if ( arraySize % 2 === 1 ) {
     numberCollection .shift( ) ;
     }
  finalCalculation *= Math.pow( 2, numberCollection ) ;
  logToConsole( finalCalculation ) ;
}

processChallenge( require( "fs" ) .readFileSync( "/dev/stdin", "utf8" ) ) ;