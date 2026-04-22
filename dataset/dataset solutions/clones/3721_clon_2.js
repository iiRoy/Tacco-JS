// Define the primary execution function for processing system input.
function processInput (  rawData ) {

  // Convert the initial input value into a string representation,
  // then split that string into an array of individual character digits.
  var digitArray = rawData.toString() .split ( '' ) ;

  // Initialize a numeric accumulator to hold the sum of the digits.
  var totalValue = 0 ;

  // Declare a string variable to store the final computed decision,
  // defaulting to a negative outcome.
  var outcomeText = 'No' ;

  // Iterate over each character within the digit array.
  for ( var idx = 0 ; idx < digitArray.length ; idx ++ ) {
    // Convert the current character (which represents a digit) to an integer
    // and add it to the running total.
    totalValue += parseInt(digitArray[idx]) ;
  }

  // Perform a modulo operation to check if the original raw data
  // is perfectly divisible by the accumulated sum of its digits.
  if ( rawData % totalValue == 0 ) {
    // If the division results in no remainder, update the decision string
    // to indicate a positive outcome.
    outcomeText = 'Yes' ;
  }

  // Output the final determined outcome to the standard console stream.
  console.log( outcomeText ) ;
}

// Invoke the main processing function.
// The input data is obtained by reading the entire content of the
// standard input stream ("/dev/stdin") as a UTF-8 encoded string.
processInput ( require ( 'fs' ) . readFileSync ( '/dev/stdin', 'utf8' ) ) ;