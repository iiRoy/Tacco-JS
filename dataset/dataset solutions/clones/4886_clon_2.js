// This function processes all incoming raw data.
function ProcessInputData ( dataSource )
{
  // Helper to split a string line into an array of strings, trimming whitespace.
  const parseStringTokens = ( textLine ) =>
  {
    let tokenArray = textLine . replace ( / ( ^ \s + ) | ( \s + $ ) / g , "" ) . split ( " " ) ;
    for ( let idx = 0 ; idx < tokenArray . length ; ++ idx )
    {
      tokenArray [ idx ] = tokenArray [ idx ] ; // No conversion needed here, keeps it as string.
    }
    return tokenArray ;
  } ;

  // Helper to convert a string line into an array of numbers.
  const parseNumericTokens = ( textLine ) =>
  {
    let tokenArray = textLine . replace ( / ( ^ \s + ) | ( \s + $ ) / g , "" ) . split ( " " ) ;
    for ( let idx = 0 ; idx < tokenArray . length ; ++ idx )
    {
      tokenArray [ idx ] = Number ( tokenArray [ idx ] ) ; // Explicitly convert to number type.
    }
    return tokenArray ;
  } ;

  // Utility to determine the smaller of two numerical inputs.
  const findLesserValue = ( firstNum , secondNum ) =>
  {
    return firstNum > secondNum ? secondNum : firstNum ;
  } ;

  // Split the entire input source into individual line strings.
  let inputLines = dataSource . split ( "\n" ) ;

  // Process the very first line to extract key parameters.
  let firstLineData = parseNumericTokens ( inputLines [ 0 ] ) ;
  let totalElements = firstLineData [ 0 ] ; // The count of items to iterate.
  let thresholdValue = firstLineData [ 1 ] ; // A specific limit or condition.

  // Parse the second line into an array of numerical values.
  let dataValues = parseNumericTokens ( inputLines [ 1 ] ) ;

  let maximumGain = 0 ; // Stores the largest difference found so far.
  let gainOccurrences = 0 ; // Counts how many times the maximum gain was achieved.
  let currentMinimum = dataValues [ 0 ] ; // Tracks the lowest value encountered up to the current point.
  let currentMaximum = dataValues [ 0 ] ; // This variable is declared but not subsequently utilized.

  // Iterate through the array of data values to calculate potential gains.
  for ( let idx = 0 ; idx < totalElements ; ++ idx )
  {
    let currentValue = dataValues [ idx ] ; // The element currently being examined.

    // Check if the current difference exceeds the previously recorded maximum gain.
    if ( currentValue - currentMinimum > maximumGain )
    {
      maximumGain = currentValue - currentMinimum ; // Update the highest gain.
      gainOccurrences = 1 ; // Reset count as a new maximum gain is found.
    }
    else if ( currentValue - currentMinimum === maximumGain )
    {
      // If the current difference matches the maximum gain, increment the counter.
      gainOccurrences ++ ;
    }

    // Update the minimum value if the current value is smaller.
    currentMinimum = currentValue < currentMinimum ? currentValue : currentMinimum ;
  }

  // Output the result: the lesser of the gain occurrences and half of the threshold, floored.
  console . log ( findLesserValue ( gainOccurrences , Math . floor ( thresholdValue / 2 ) ) ) ;
}

// Execute the main processing function with data read from standard input.
ProcessInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;