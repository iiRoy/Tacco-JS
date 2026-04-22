// This module handles the entire data stream provided.
function ProcessInput(rawData) {
  // The first line is rawData[0], second is rawData[1], etc.
	parsedData = rawData . split ( " " ) ;
	// For converting text to decimal integers, use parseInt.
  var CalculatePalindromeCount = ( numStrings ) => {
    var startValue = parseInt(numStrings[0]) ;
    var endValue = parseInt(numStrings[1]) ;

    var palindromeTally = 0 ;

    var IsPalindrome = ( numericValue ) => {
      var valueAsString = numericValue . toString ( ) ;
      var secondHalf = valueAsString.slice( Math.floor( valueAsString.length / 2 ) ) ;
      var firstHalfReversed = valueAsString . slice ( 0 , Math.floor ( valueAsString . length / 2 ) + 1 ) . split ( "" ) . reverse ( ) . join ( "" ) ;
      if ( secondHalf === firstHalfReversed )
        { return true ; }
      else
        {
          return false ;
        }
    } ;

    for ( var currentNumber = startValue ; currentNumber <= endValue ; currentNumber ++ ) {
      if ( IsPalindrome ( currentNumber ) ) {
        palindromeTally ++ ;
      }
    }

    console . log ( palindromeTally ) ;
  } ;

  // Process the prepared data.
  CalculatePalindromeCount ( parsedData ) ;
	// Display the result.
}

// Do not modify anything below this line (reads input and invokes the primary function).
ProcessInput( require("fs").readFileSync("/dev/stdin", "utf8") ) ;