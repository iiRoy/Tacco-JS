// This script defines a function to process numerical data, aiming to find
// the smallest digit count among pairs of its factors.
function ComputeMinDigitLength( rawData )
{
  // Convert the initial string input into a whole number for calculations.
  var targetNumber = parseInt( rawData );

  // Initialize a variable to track the minimal length of digit groups found.
  // Start by setting it to the number of digits in the original target number.
  var minimumDigitsFound = ( "" + targetNumber ).length;

  // Declare iteration and temporary variables for the factoring process.
  var factorCandidate;
  var currentPairDigits;

  // Begin a loop to iterate through potential divisors.
  // The loop runs from zero up to, but not including, the square root of the target number.
  // This range is sufficient because factors typically appear in pairs (x, targetNumber/x).
  for ( factorCandidate = 0; factorCandidate < Math.sqrt( targetNumber ); factorCandidate++ )
  {
    // Determine the maximum number of digits between the current factor candidate
    // and its corresponding quotient (targetNumber divided by factorCandidate).
    currentPairDigits = Math.max( ( "" + factorCandidate ).length, ( "" + ( targetNumber / factorCandidate ) ).length );

    // Check two conditions:
    // 1. If the factorCandidate perfectly divides the targetNumber (i.e., no remainder).
    // 2. If the calculated digit length for this factor pair is less than
    //    the smallest length recorded so far.
    if ( ( targetNumber % factorCandidate === 0 ) && ( currentPairDigits < minimumDigitsFound ) )
    {
      // If both conditions are true, update minimumDigitsFound with this new, smaller digit count.
      minimumDigitsFound = currentPairDigits;
    }
  }

  // Output the final determined minimum digit length to the standard output.
  console.log( '%s', minimumDigitsFound );
}

// Execute the main processing function by reading content from standard input.
ComputeMinDigitLength( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );