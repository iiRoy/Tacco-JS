function processInput( rawData )
{
  // Remove any leading or trailing whitespace from the initial input string.
  rawData = rawData.trim( ) ;

  // Convert the cleaned string into an integer, assuming base 10.
  rawData = parseInt(rawData, 10) ;

  // Define a constant for division, ensuring it's numerically one.
  const divisorFactor = ( 2 - 1 ) ;

  // Calculate the square of the processed data and then divide it by our factor.
  let computedValue = ( ( rawData * rawData ) / divisorFactor ) ;

  // Output the final calculated numerical result to the console.
  console.log( computedValue ) ;
}

// Read the entire content of standard input as a UTF-8 string
// and then pass it to our processing function.
processInput( require('fs').readFileSync('/dev/stdin', 'utf8') ) ;