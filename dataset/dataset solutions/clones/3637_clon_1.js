'use strict' ; /* This directive enforces strict parsing and error handling in the script. */



function  main ( arg )
{ // Function definition starts here.
  // This function processes the input argument.

  // First check: the initial character of the input.
  if  ( arg [ 0 ]  !=  "A" )
  {
    console.log ( 'WA' ) ; // Output "WA" for Wrong Answer.
    return        ; // Terminate execution.
  }


  // Initialize a counter for the character 'C'.
  var   numC   =   0       ;

  // Iterate through the input string, starting from the second character.
  for ( var i = 1 ;  i < arg.length ;  i ++ )
  {
      // Check for 'C' in specific positions (from index 2 to length-3).
      if ( ( i  >=  2 )  &&  ( i  <=  arg.length - 2 )  &&  ( arg [ i ]  ==  "C" ) )
      {
          numC ++ ; // Increment the 'C' counter.

          // If more than one 'C' is found in the allowed range, it's an error.
          if  ( numC  >  1 )
          {
              console.log ( "WA" ) ; // Output "WA".
              return  0            ; // Exit with error code.
          }
      }
      // Check if the current character is a lowercase letter.
      // If search returns -1, it means no lowercase letters were found.
      else  if  ( arg [ i ] . search ( / [a-z] / )  ==  -1 )
      {
          console.log ( "WA" ) ; // Output "WA".
          return  0            ; // Exit with error code.
      }
  }

  // Final check: ensure exactly one 'C' was found.
  if  ( numC  !=  1 )
  {
      console.log ( "WA" ) ; // Output "WA" if 'C' count is not 1.
  }
  else
  {
      console.log ( 'AC' ) ; // Output "AC" for Accepted.
  }

} // End of the main function.

// Execute the main function with input from standard input.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ) ;