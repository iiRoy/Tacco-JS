function processData ( rawData ) {
 /*
  * This function analyzes a given input string.
  * It determines if the numeric value of the input
  * is perfectly divisible by the sum of its digits.
  */
 
  var charArray = rawData . toString ( ) . split ( '' ) ; // Break down the input into individual character digits.
  var numericValue = parseInt ( rawData ) ; // Convert the entire input string into an integer.
  
  var digitSum = 0 ; // Initialize a variable to accumulate the sum of digits.
  
  // Loop through each character in the array to sum its numeric value.
  for ( var idx = 0 ; idx < charArray . length ; idx ++ ) {
   	digitSum += parseInt ( charArray [ idx ] ) ; // Convert character to integer and add to the running sum.
  }
  
  // Check if the overall numeric value is perfectly divisible by the calculated digit sum.
  if ( numericValue % digitSum === 0 ) {
  	console . log ( 'Yes' ) ; // If divisible, print 'Yes'.
  } else {
  	console . log ( 'No' ) ; /* Otherwise, print 'No'. */
  }
  
}

// Call the primary function, reading input from standard input.
processData ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;