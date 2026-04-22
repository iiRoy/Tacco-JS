// This module handles reading input, processing data, and outputting results.

function getSourceInput ( ) {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim( ) ;
}

function displayOutput( resultVal ) {
  console.log( resultVal ) ; // Emits the computed numerical outcome to the standard console.
}

function reportError ( issueMessage ) {
  console.error( issueMessage ) ; // Transmits an error notification to the standard error stream.
}

/*
 * This utility function provides various methods to parse and convert raw string input.
 * The 'conversionType' parameter determines the specific parsing logic applied:
 *
 * 0: Returns the string untouched.
 * 1: Converts the string into an integer.
 * 2: Splits the string by single spaces.
 * 3: Splits the string by newline characters.
 * 4: Splits by spaces and then converts each resulting part to a number.
 * 5: Splits by newlines and then converts each resulting part to a number.
 * 6: Breaks the string into an array of individual characters.
 * 7: Breaks the string into individual characters and converts each to a number.
 */
function transformInput ( rawString , conversionType ) {
  switch ( conversionType ) {
    case 0 :
      return rawString ;
    case 1 :
      return parseInt( rawString ) ;
    case 2 :
      return rawString.split(" ") ;
    case 3 :
      return rawString.split("\n") ;
    case 4 :
      return rawString.split(" ").map( ( elem ) => Number( elem ) ) ;
    case 5 :
      return rawString.split("\n").map( ( elem ) => Number( elem ) ) ;
    case 6 :
      return rawString.split("") ;
    case 7 :
      return rawString.split("").map( ( elem ) => Number( elem ) ) ;
  }
}

function ProcessData ( incomingData ) {
  /*
   * The primary processing logic begins here.
   * First, the input array of numbers is sorted in ascending order.
   * The core task involves adjusting three numbers (valOne, valTwo, valThree)
   * to reach a state where they are all equal and even/odd parity is consistent.
   * If initial parities are mismatched, one increment operation is performed
   * to align two of the numbers' parities, and then further increments
   * are calculated to make all numbers equal to the maximum.
   */
  incomingData = transformInput( incomingData , 4 ) . sort( function ( firstNum , secondNum ) {
    return firstNum - secondNum ;
  } ) ;

  // Extract the three sorted numerical values.
  var valOne = incomingData[0] ;
  var valTwo = incomingData[1] ;
  var valThree = incomingData[2] ;

  var finalTally = 0 ;

  // Check if all three numbers have the same parity (all even or all odd).
  // If not, exactly two numbers will share parity, and those two must be incremented.
  if ( ! ( ( valOne % 2 == valTwo % 2 ) && ( valOne % 2 == valThree % 2 ) && ( valThree % 2 == valTwo % 2 ) ) ) {

    if ( valOne % 2 == valTwo % 2 ) {
      valOne ++ ;
      valTwo ++ ;
    } else if ( valOne % 2 == valThree % 2 ) {
      valOne ++ ;
      valThree ++ ;
    } else if ( valThree % 2 == valTwo % 2 ) {
      valTwo ++ ;
      valThree ++ ;
    }
    // Increment the total operations count for the parity adjustment.
    finalTally ++ ;
  }

  // Add the required increments to make all numbers equal to the current maximum.
  // Each increment operation on a pair of numbers counts as one step for the pair.
  // So, the difference between a number and the maximum is divided by two
  // to get the number of operations needed for that specific number.
  finalTally += ( Math.max.apply( null , [ valOne , valTwo , valThree ] ) - valOne ) / 2 ;
  finalTally += ( Math.max.apply( null , [ valOne , valTwo , valThree ] ) - valTwo ) / 2 ;
  finalTally += ( Math.max.apply( null , [ valOne , valTwo , valThree ] ) - valThree ) / 2 ;

  displayOutput( finalTally ) ;
}

// Initiate the data processing pipeline by reading input and passing it to the main logic.
ProcessData( getSourceInput( ) ) ;