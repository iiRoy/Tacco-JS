"use strict" ; /* Enable strict mode for cleaner code */


const main =   arg   =>   {
  // Process input argument
  arg  =  arg . trim ( ) . split ( "\n" ) ;

  /* Parse input values from the first line */
  const   N   =   parseInt ( arg [ 0 ] . split ( " " ) [ 0 ] ) ;
  const   A   =   parseInt ( arg [ 0 ] . split ( " " ) [ 1 ] ) ;

  const   B   =   parseInt ( arg [ 0 ] . split ( " " ) [ 2 ] ) ;


  /* Calculate maximum and minimum possible values based on N, A, B */
  const   max   =   A   +   (   B   *   (   N   -   1   )   ) ;
  const   min   =   B   +   (   A   *   (   N   -   1   )   ) ;


  // Initialize the answer variable
  let   answer   =   max   -   min   +   1 ;

  // Handle edge cases
  if   (   A   >   B   )   {
    // If A is greater than B, no valid range exists
    answer   =   0 ;
  }   else   if   (   N   ===   1   )   {
    // If N is 1, the range is just A or B
    answer   =   A   ===   B   ?   1   :   0 ;
  }


  // Output the final calculated answer to console
  console . log ( answer ) ;
}


// Read input from stdin and pass it to the main function
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ; /* End of program */