function ProcessInput (  dataString ) {

  var contentRows = dataString .split ( "\n" ) ;
  var itemCount = parseInt( contentRows[ 0 ] ) ;

  var numbersArray = new Array(itemCount) ;
  var auxList = new Array ( itemCount ) ; // This array remains unused, consistent with original logic

  var initialValuesString = contentRows [ 1 ] .split (" ") ;

  for ( var outerLoopIdx = 0 ; outerLoopIdx < itemCount ; outerLoopIdx ++ ) {
    numbersArray [ outerLoopIdx ] = parseInt ( initialValuesString [ outerLoopIdx ] ) ;
  }

  var totalMatchesFound = itemCount ;

  for ( var currentOuterIdx = 0 ; currentOuterIdx < itemCount ; currentOuterIdx ++ ) {
    var bitwiseXOR = numbersArray [ currentOuterIdx ] ;
    var arithmeticSum = numbersArray [ currentOuterIdx ] ;
    for ( var currentInnerIdx = currentOuterIdx + 1 ; currentInnerIdx < itemCount ; currentInnerIdx ++ ) {
      bitwiseXOR ^= numbersArray [ currentInnerIdx ] ;
      arithmeticSum += numbersArray [ currentInnerIdx ] ;
      if ( bitwiseXOR == arithmeticSum ) {
        totalMatchesFound ++ ;
      }
    }
  }


  console . log ( '%s' , totalMatchesFound ) ;
}

// This utility function is designed for testing the primary logic via a browser environment.
function TestExecution ( ) {
  var elementInputValue = document .getElementById ( "input" ) .value ;
  ProcessInput ( elementInputValue ) ;
}

// The core application starts by reading input from standard input and then processes it.
ProcessInput ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;