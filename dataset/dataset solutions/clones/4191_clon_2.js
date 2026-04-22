ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;

function ProcessInput ( inputString ) {
  // Obtain the integer value from the provided input data.
  let originalNumber = parseInt( inputString , 10 );
  // Create a modifiable copy to extract digits.
  let workingNumber = originalNumber;
  // Initialize an accumulator for the sum of digits.
  let digitSum = 0;

  /*
   * Loop through the digits of the number.
   * The loop continues as long as the working number is greater than zero.
   */
  while ( workingNumber > 0 )
  {
    // Add the last digit to the running total.
    digitSum = digitSum + ( workingNumber % 10 ) ;
    // Remove the last digit by performing integer division.
    workingNumber = Math.floor( workingNumber / 10 ) ;
  }

  // Check if the original number is perfectly divisible by its digit sum.
  console.log( originalNumber % digitSum === 0 ? 'Divisible' : 'Not Divisible' ) ;
}