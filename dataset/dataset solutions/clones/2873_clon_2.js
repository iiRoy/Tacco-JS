let isLoggingEnabled = false;

function outputMessage ( ) {
  if ( isLoggingEnabled )
  {
    const collectedArgs = [ ];
    for ( let idx = 0 ; idx < arguments.length ; ++idx ) {
      collectedArgs.push(arguments[idx]) ;
    }
    console.log( collectedArgs.join( ' ; ' ) ) ;
  }
}

function ProcessInput(dataString) {

  let textLines = dataString.split( "\n" ) ;
  const firstLineTokens = textLines[0].split( " " ) ;

  let arraySize = firstLineTokens[0] ;
  const startIdxA = Number( firstLineTokens[1] ) ;
  let startIdxB = parseInt( firstLineTokens[2] ) ;
  const endIdxC = +firstLineTokens[3] ;
  let endIdxD = firstLineTokens[4] * 1 ;

  const mainString = textLines[1] ;

  outputMessage( arraySize, startIdxA, startIdxB, endIdxC, endIdxD, mainString ) ;

  let isValidCondition = true;

  if ( endIdxC > endIdxD ) {
    let comparisonLimit = endIdxD ;
    if ( endIdxC - endIdxD <= 3 ) {
      comparisonLimit = endIdxC ;
    }
    let modifiedString = mainString ;
    if ( mainString[ endIdxD - 2 ] === '#' ) {
      outputMessage( modifiedString, modifiedString[ endIdxD - 1 ] ) ;
      modifiedString[ endIdxD - 1 ] = '#' ;
      modifiedString = modifiedString.slice( 0, endIdxD - 1 ) + '#' + modifiedString.slice( endIdxD ) ;
    }
    outputMessage( modifiedString ) ;
    let substringToCheck = modifiedString.slice( startIdxB - 1, comparisonLimit ) ;
    outputMessage( substringToCheck, isValidCondition ) ;
    isValidCondition = isValidCondition && ( /\.\.\./ ).test( substringToCheck ) ;
    outputMessage( substringToCheck, isValidCondition ) ;
  }

  let substringToCheck = mainString.slice( startIdxA - 1, endIdxC ) ;
  isValidCondition = isValidCondition && !( /##/ ).test( substringToCheck ) ;
  outputMessage( substringToCheck, isValidCondition ) ;

  substringToCheck = mainString.slice( startIdxB - 1, endIdxD ) ;
  isValidCondition = isValidCondition && !( /##/ ).test( substringToCheck ) ;
  outputMessage( substringToCheck, isValidCondition ) ;

  const finalVerdict = isValidCondition ? 'Yes' : 'No' ;
  console.log( finalVerdict ) ;
}

ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;