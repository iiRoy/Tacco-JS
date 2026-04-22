/* This is the primary function definition */
function main ( input )
{

  // Remove leading/trailing whitespace from the input string
  input = input . trim ( ) ;

  /* Declare a constant 'n' and parse the first part of the input string as an integer */
  const n = parseInt ( input . split ( " " ) [ 0 ] , 10 ) ;

  // Initialize an empty array to store calculated values
  var arr = [ ] ;

  /*
   * Start of the outer loop.
   * 'i' iterates from 0 to 25, inclusive.
   */
  for ( var i = 0 ; i <= 25 ; i ++ )
  {

    // Inner loop begins here. 'j' iterates from 0 to 15, inclusive.
    for ( var j = 0 ; j <= 15 ; j ++ )
    {
      // Calculate a value based on 'i' and 'j', then push it into the array
      arr . push ( 4 * i + 7 * j ) ;
    } // End of inner loop
  } /* End of outer loop */

  // Check if the target number 'n' exists in the generated array
  if ( arr . indexOf ( n ) >= 0 )
  {
    console . log ( "Yes" ) ; // Output 'Yes' if 'n' is found
  }
  else
  {
    /* Otherwise, if 'n' is not found */
    console . log ( "No" ) ; // Output 'No'
  }
} // End of conditional block

/*
 * Call the main function with input read from standard input.
 * The 'fs' module is used to read the file, and 'utf8' specifies the encoding.
 */
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;