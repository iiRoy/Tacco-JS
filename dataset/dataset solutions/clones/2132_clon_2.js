( function ProcessData ( rawData ) {
  /*
   * This function processes input data to calculate a specific value.
   * It reads two numbers, then applies a conditional logic based on the first number.
   */

  // Split the raw input string by spaces to get individual components.
  let parsedValues = rawData.split( ' ' );

  // Extract the first number and convert it to a numeric type.
  let firstNumber = parsedValues[ 0 ] - 0;

  // Extract the second number and convert it to a numeric type.
  let secondNumber = parsedValues[ 1 ] - 0;

  // Declare a variable to hold the computed outcome.
  let resultValue;

  // Apply conditional logic:
  // If the first number is greater than or equal to 10, the result is the second number.
  // Otherwise, the result is the second number plus 100 times the difference between 10 and the first number.
  if ( firstNumber >= 10 ) {
    resultValue = secondNumber;
  } else {
    resultValue = secondNumber + ( 100 * ( 10 - firstNumber ) );
  }

  // Output the final calculated value to the standard console.
  console.log( resultValue );

} ) ( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );
