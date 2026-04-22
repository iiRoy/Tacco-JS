// This processing unit handles incoming textual data to derive a calculated outcome.
function processInputData( initialDataString )
{
  // Parse the input string: split by spaces and transform each segment into a numerical value.
  const parsedNumbersArray = initialDataString . split ( " " ) . map ( Number ) ;

  /*
   * Retrieve the individual operands from the parsed array.
   * Expecting two distinct numerical entities for the operation.
   */
  const valOne = parsedNumbersArray [ 0 ] , valTwo = parsedNumbersArray [ 1 ] ;

  // Compute the result using the formula (operand1 * operand2) / (operand1 + operand2) and output it.
  console . log ( valOne * valTwo / ( valOne + valTwo ) ) ;
}

// Fetch the content from standard input and then initiate the data processing.
processInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;