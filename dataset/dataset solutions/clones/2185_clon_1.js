/* This function processes the input string. */
  function Main ( input )
  {
    [ a , b ] = input . split ( ' ' ) . map ( x => + x ) ; // Destructure input into two numbers.

    if ( a * b % 2 == 1 )
    {
      console . log ( 'Odd' ) ; // Output 'Odd' if the product is odd.
    }
    else
    {
      console . log ( 'Even' ) ; // Otherwise, output 'Even'.
    }
  }

  // The following line handles reading input and calling the main function.
  Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;