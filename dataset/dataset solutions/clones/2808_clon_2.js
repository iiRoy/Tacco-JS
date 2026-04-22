/*
 * Entry point for the data processing pipeline.
 * This routine handles input parsing and dispatches calculations.
 */
function processInput ( sourcePayload )
{
  // Divide the incoming string payload into individual line segments.
  const   textRows = sourcePayload
    . split ( '\n' )
  ;

  // Iterate through each detected row to apply core logic.
  textRows . forEach ( ( currentRow ) =>
  {
    // If a row is found to be empty, it is skipped entirely.
    if ( currentRow . length === 0 )
    {
      return ;
    }

    // Break down the current row into constituent string tokens, separated by spaces.
    const   stringTokens = currentRow
      . split ( ' ' )
    ;

    // Output the computed result by invoking the primary calculation function.
    // Each token is converted to an integer before being passed.
    console . log (
      calculateInterval (
        parseInt ( stringTokens [ 0 ] , 10 ) , // The initial boundary value.
        parseInt ( stringTokens [ 1 ] , 10 ) , // The terminal boundary value.
        parseInt ( stringTokens [ 2 ] , 10 ) , // The first specific divisor.
        parseInt ( stringTokens [ 3 ] , 10 )   // The second specific divisor.
      )
    ) ;
  } ) ;
}

/*
 * Computes the quantity of integers within a given numerical span [startValue, endValue]
 * that are neither perfectly divisible by divisorOne nor by divisorTwo.
 * This calculation employs the principle of inclusion-exclusion.
 */
function calculateInterval ( startValue , endValue , divisorOne , divisorTwo )
{
  // Ascertain the total count of numbers present within the defined range.
  const totalNumbersInRange = endValue - startValue + 1 ;

  // Determine the count of numbers divisible by the first specified factor.
  const countDivisibleByFactorA = countMultiples ( startValue , endValue , divisorOne ) ;

  // Determine the count of numbers divisible by the second specified factor.
  const countDivisibleByFactorB = countMultiples ( startValue , endValue , divisorTwo ) ;

  // Calculate the count of numbers divisible by the product of both factors
  // to correct for double-subtraction.
  const countDivisibleByBothFactors = countMultiples ( startValue , endValue , divisorOne * divisorTwo ) ;

  // Apply the inclusion-exclusion principle to find the final result.
  return totalNumbersInRange
    - countDivisibleByFactorA
    - countDivisibleByFactorB
    + countDivisibleByBothFactors
  ;
}

/*
 * Provides a count of how many integers within a closed range [rangeMin, rangeMax]
 * are exact multiples of the provided divisorFactor.
 */
function countMultiples ( rangeMin , rangeMax , divisorFactor )
{
  // Calculate how many multiples of the divisor exist up to the range's upper limit.
  const   multiplesUpToMax = Math . floor ( rangeMax / divisorFactor ) ;

  // Calculate how many multiples of the divisor exist just before the range's lower limit.
  const   multiplesBeforeMin = Math . floor ( ( rangeMin - 1 ) / divisorFactor ) ;

  // The difference between these two counts yields the multiples within the range.
  return multiplesUpToMax - multiplesBeforeMin ;
}

// Execute the primary processing function by reading content from standard input
// via Node.js's file system module, ensuring UTF-8 encoding.
processInput (
  require ( 'fs' )
    . readFileSync ( '/dev/stdin' , 'utf8' )
) ;