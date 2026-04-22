function processInput (  rawData  ) {
  /*
   * This function takes a string as input,
   * parses two numbers from it, and
   * determines if their product is even or odd.
   */

  const   tokens = rawData.split ( ' ' )  ;

  const   firstNumber = parseInt (
    tokens[0]
    , 10
  ) ;

  const   secondNumber = parseInt(  tokens[1] ,  10  ) ;

  // Evaluate the parity of the product of the two numbers.
  if   (
      ( firstNumber * secondNumber ) % 2
      ===
      0
  )
  {
    console.log( 'Even' ); // Log 'Even' if the product is divisible by 2.
  }
  else
  {
    console.log( 'Odd' ) ; // Log 'Odd' if the product is not divisible by 2.
  }
}

// Invoke the primary processing routine by reading content from standard input.
processInput (
  require ( 'fs' )
    .readFileSync ( '/dev/stdin' , 'utf8' )
) ;