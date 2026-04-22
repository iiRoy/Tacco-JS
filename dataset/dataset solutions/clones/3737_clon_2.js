/*
 * This JavaScript module processes an input string to generate a specific numerical sequence.
 * It reads data from standard input, parses it as a number, and then constructs a list
 * of values based on a unique digit sum-based criterion.
 */
function ComputeSeries ( sourceText ) {
  // Convert the incoming string data into an integer representing the desired sequence length.
  const targetCount = +sourceText ;
  // This array will store the generated sequence items.
  var outputList = [ ] ;
  // 'previousTerm' tracks the last number successfully added to the sequence.
  let previousTerm = 0 ;
  // 'incrementFactor' is used to adjust the next candidate value, often by powers of 10.
  let incrementFactor = 1 ;
  // The primary loop continues until the 'outputList' reaches the 'targetCount' in length.
  while ( outputList.length < targetCount ) {
    // Calculate a 'candidateValue' by adding the 'previousTerm' and 'incrementFactor'.
    var candidateValue = previousTerm + incrementFactor ;
    /*
     * This conditional statement evaluates a specific mathematical property.
     * It compares the ratio of a number to its sum of digits for the 'candidateValue'
     * against the same ratio for 'candidateValue + incrementFactor'.
     * The logic determines whether to accept the 'candidateValue' or adjust the 'incrementFactor'.
     */
    if ( ( candidateValue / getSumOfDigits( candidateValue ) ) <= ( ( candidateValue + incrementFactor ) / getSumOfDigits( candidateValue + incrementFactor ) ) ) {
      // If the condition holds true, the 'candidateValue' is added to the results.
      outputList.push( candidateValue ) ;
      // The 'previousTerm' is updated to the newly added 'candidateValue'.
      previousTerm = candidateValue ;
    }
    else
      // If the condition is false, the 'incrementFactor' is multiplied by 10, effectively
      // exploring a different range of numbers in the next iteration.
      incrementFactor *= 10 ;
  }
  // Finally, the generated sequence is printed to the console, with each number on a new line.
  console.log( outputList.join( "\n" ) ) ;
}

/*
 * Recursive helper function to calculate the sum of the digits of a given number.
 * It works for non-negative integers.
 */
function getSumOfDigits( targetNumber ) {
  // Base case: if the number is less than 10, its sum of digits is itself.
  if ( targetNumber < 10 ) {
    return targetNumber ;
  }
  // Recursive step: add the last digit to the sum of digits of the remaining part of the number.
  return ( targetNumber % 10 ) + getSumOfDigits( Math.floor( targetNumber / 10 ) ) ;
}

// Entry point: read the entire content of standard input as a UTF-8 string
// and pass it to the main processing function.
ComputeSeries( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;