// This function serves to analyze a provided numerical input
// to find the minimum possible total digit count among pairs of its factors.
function ProcessData( incomingValue )
{
  // Convert the initial string input into an integer for numerical operations.
  let numericValue = parseInt( incomingValue ) ;

  // Initialize a variable to track the smallest digit count observed so far.
  // It starts with the digit count of the original number itself.
  let minDigitsCount = ( numericValue + "" ).length ;

  // Begin an iteration to find factors of the numeric value.
  // The loop runs up to the square root of the numeric value for efficiency.
  for ( let iteratorIndex = 0 ; iteratorIndex < Math.sqrt( numericValue ) ; iteratorIndex++ )
  {
    // Determine the maximum number of digits between the current iterator and its corresponding divisor.
    // Numbers are converted to strings to easily get their digit length.
    let currentMaxDigits = Math.max(
      ( iteratorIndex + "" ).length ,
      ( numericValue / iteratorIndex + "" ).length
    ) ;

    // Check two conditions:
    // 1. If the current iterator is a perfect divisor of the numeric value.
    // 2. If the calculated 'currentMaxDigits' is smaller than our current 'minDigitsCount'.
    if ( ( numericValue % iteratorIndex === 0 ) && ( currentMaxDigits < minDigitsCount ) )
    {
      // If both conditions are met, update 'minDigitsCount' with this new, smaller value.
      minDigitsCount = currentMaxDigits ;
    }
  }

  // Output the final determined minimum digit count to the standard output.
  console.log( "%s" , minDigitsCount ) ;
}

// The program's entry point: reads input from standard I/O and passes it
// to the 'ProcessData' function for execution.
ProcessData( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;