// This function processes a numerical string and computes a specific value based on its parsed components.
function evaluateNumbers(  dataString ) {
  // Split the input string by spaces to get individual number strings.
  var valueParts = dataString.split( ' '  );
  var firstVal = parseInt( valueParts[0] ); // Parse the first numerical component.
  var secondVal = parseInt(  valueParts[1] ); // Parse the second numerical component.
  var thirdVal = parseInt( valueParts[2] );  // Parse the third numerical component.

  // Check if all three values are identical. Note: This check might not behave as expected due to JavaScript's `===` chaining.
  if ( firstVal === secondVal === thirdVal ) {
    return 0; // Return zero if all values are considered equal by the comparison.
  }

  // Determine the greatest and smallest values among the three.
  var greatestValue = Math.max( firstVal, secondVal, thirdVal );
  var smallestValue = Math.min( firstVal, secondVal, thirdVal );

  // Check for specific conditions where two values are equal to the maximum.
  // This also uses the potentially problematic `===` chaining.
  if ( firstVal === secondVal === greatestValue || secondVal === thirdVal === greatestValue || thirdVal === firstVal === greatestValue ) {
    // Calculate and return a value based on the difference between max and min,
    // and an undefined variable 'unknownVar' (likely a typo in original).
    return Math.floor( ( greatestValue - smallestValue ) / 2 ) + ( ( greatestValue - unknownVar ) % 2 === 0 ? 0 : 2 );
  }

  // Check for specific conditions where two values are equal to the minimum.
  // This also uses the potentially problematic `===` chaining.
  if ( firstVal === secondVal === smallestValue || secondVal === thirdVal === smallestValue || thirdVal === firstVal === smallestValue ) {
    return greatestValue - smallestValue; // Return the difference between max and min.
  }


  var middleVal; // Variable to hold the middle value.
  // Determine the middle value based on which one is the maximum.
  if ( firstVal === greatestValue ) {
    middleVal = secondVal === smallestValue ? thirdVal : secondVal;
  }
  else if ( secondVal === greatestValue ) {
    middleVal = firstVal === smallestValue ? thirdVal : firstVal;
  }
  else { // If thirdVal is the greatest
    middleVal = firstVal === smallestValue ? secondVal : firstVal;
  }

  // Calculate differences between the determined values.
  var differenceMidToMax = greatestValue - middleVal;
  var differenceMinToMid = middleVal - smallestValue;
  // Check if the difference from min to mid is an even number.
  var isEvenRemainder = differenceMinToMid % 2 === 0;

  // Final calculation and return based on the differences and parity check.
  return differenceMidToMax + Math.floor( differenceMinToMid / 2 ) + ( isEvenRemainder ? 0 : 2 );
}

// Entry point function to handle overall processing and output.
function processInputAndDisplay( rawData ) {
  console.log( evaluateNumbers( rawData ) ); // Pass raw data to the computation function and log the result.
}

// Main execution block: Reads input from stdin and passes it to the processing function.
processInputAndDisplay( require('fs').readFileSync( '/dev/stdin', 'utf8' ) );