// This JavaScript module is designed to process a four-character input string.
// It checks for a specific pattern among the sorted characters.

function analyzeDigits ( rawSequence )
{
  // Extract individual characters from the provided input string.
  // Each character is treated as a distinct unit for subsequent operations.
  const firstDigit  = rawSequence.substr( 0, 1 );
  const secondDigit = rawSequence.substr( 1, 1 );
  const thirdDigit  = rawSequence.substr( 2, 1 );
  const fourthDigit = rawSequence.substr( 3, 1 );

  // A temporary variable to hold the original sequence.
  // This variable is assigned but not utilized further in the logic flow.
  const originalSequence = rawSequence;

  // Create an array containing the extracted characters for easier manipulation.
  let digitArray = [ firstDigit, secondDigit, thirdDigit, fourthDigit ];

  // Sort the array of characters in ascending order.
  // For strings, this typically means lexicographical sorting.
  digitArray.sort();

  // Assign the sorted characters to new, more descriptive variables.
  // This makes the subsequent conditional logic more readable.
  const lowestDigit       = digitArray[ 0 ];
  const secondLowestDigit = digitArray[ 1 ];
  const thirdLowestDigit  = digitArray[ 2 ];
  const highestDigit      = digitArray[ 3 ];

  // Initialize a numeric flag to track whether the specific pattern condition is met.
  // A value of 0 signifies that the condition has not yet been satisfied.
  let conditionMet = 0;

  // Begin the multi-level logical evaluation based on the sorted digits.
  // First, verify if the two numerically lowest digits are identical.
  if ( lowestDigit == secondLowestDigit )
  {
    // If the first two digits match, proceed to check if the lowest digit
    // is distinct from the third lowest digit.
    if ( lowestDigit !== thirdLowestDigit )
    {
      // Should both prior conditions hold true, finally determine if the
      // third lowest digit is identical to the numerically highest digit.
      if ( thirdLowestDigit == highestDigit )
      {
        // If all specified criteria are met, update the flag to indicate success.
        conditionMet = 1;
      }
    }
  }

  // Output the final determination based on the state of the condition flag.
  if ( conditionMet === 1 )
  {
    console.log( 'Yes' ); // Display 'Yes' if the unique pattern was successfully identified.
  }
  else
  {
    console.log( 'NO' );  // Display 'NO' if the pattern was not found.
  }
}

// Entry point for execution: The main processing function is invoked
// with data read from standard input. The file system module is used
// to synchronously read the input, assuming 'utf8' encoding.
analyzeDigits( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );