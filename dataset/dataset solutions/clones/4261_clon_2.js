function logToConsole( displayString ) {
  console.log( displayString ); // Show the computed result on the console
}

function ExecuteCalculation( initialValue ) {
  initialValue = parseInt( initialValue ); // Convert the raw input string into an integer
  // This section contains commented-out input processing examples for different formats:
  // initialValue = initialValue.trim().split(" ");
  // initialValue = initialValue.trim().split("\n");
  // initialValue = initialValue.trim().split(" ").map( ( element ) => Number( element ) );
  // initialValue = initialValue.trim().split("\n").map( ( element ) => Number( element ) );

  var smallestDigitSum = 1000000000; // Initialize with a very large number to facilitate finding the minimum sum
  for ( var loopIndexOuter = 1; loopIndexOuter <= 100000; loopIndexOuter++ ) {
    var numberDigits = ( initialValue * loopIndexOuter ) .toString() .split( "" ) .map( ( digitCharacter ) => Number( digitCharacter ) );
    var currentDigitSum = 0; // This variable will accumulate the sum of digits for the current product
    for ( var loopIndexInner = 0; loopIndexInner < numberDigits.length; loopIndexInner++ ) {
      currentDigitSum += numberDigits[ loopIndexInner ];
    }
    smallestDigitSum = Math.min( smallestDigitSum, currentDigitSum ); // Update the overall minimum sum found so far
  }
  logToConsole( smallestDigitSum ); // Output the final smallest sum of digits
}

ExecuteCalculation( require( "fs" ) .readFileSync( "/dev/stdin", "utf8" ) .trim() );