/*
 * This function calculates a custom XOR-like operation on two numbers.
 * It handles large numbers by splitting them into 'up' (higher order)
 * and 'down' (lower order) parts based on a defined modulus 'm'.
 */
function   xor  ( a , b )
{
  // Define the modulus for splitting numbers.
  const  m  =  10000000 ;


  /*
   * Calculate the 'up' part of the XOR.
   * This involves integer division, XORing, and then multiplying by 'm'.
   */
  var   tmp_up   =   (  parseInt ( a / m )   ^   parseInt ( b / m )  )   *   m ;


  // Calculate the 'down' part of the XOR using the modulo operator.
  var   tmp_down   =   (  a % m  )   ^   (  b % m  ) ;


  // --- Conditional adjustments for 'tmp_up' based on input values ---

  // If both numbers are smaller than 'm', the 'up' part is irrelevant.
  if  ( a < m   &&   b < m )
  {
    return   tmp_down ;
  }


  // If 'a' is smaller than 'm', adjust 'tmp_up' using only 'b'.
  if  ( a < m )
  {
    tmp_up   =   parseInt ( b / m )   *   m ;
  }


  // If 'b' is smaller than 'm', adjust 'tmp_up' using only 'a'.
  if  ( b < m )
  {
    tmp_up   =   parseInt ( a / m )   *   m ;
  }


  // Return the sum of the adjusted 'down' and 'up' parts.
  return   tmp_down   +   tmp_up ;
}


/*
 * The main function processes input, performs calculations based on
 * number parity and count, and then prints the result using the
 * custom 'xor' function.
 */
function   main  ( input )
{
  // Split the input string by newline characters.
  const   formatted_input   =   input . split ( '\n' ) ;


  // Parse the first number (A) from the first line of input.
  const   A   =    parseInt ( formatted_input [ 0 ] . split ( ' ' ) [ 0 ] ) ;


  // Parse the second number (B) from the first line of input.
  const   B   =    parseInt ( formatted_input [ 0 ] . split ( ' ' ) [ 1 ] ) ;


  // Calculate the count of numbers in the range [A, B].
  const   count   =   B   -   A   +   1 ;


  // --- Logic branch based on whether 'count' is even or odd ---

  // Case 1: If the total count of numbers is even.
  if  ( count % 2   ==   0 )
  {
    // Sub-case 1.1: If 'A' (the starting number) is even.
    if  ( A % 2   ==   0 )
    {
      // Sub-case 1.1.1: If (count/2) is even.
      if  ( ( count / 2 ) % 2   ==   0 )
      {
        console . log ( 0 ) ; // Print 0.
      }
      else  // Sub-case 1.1.2: If (count/2) is odd.
      {
        console . log ( 1 ) ; // Print 1.
      }
    }
    else  // Sub-case 1.2: If 'A' (the starting number) is odd.
    {
      // Initialize 'unified' based on (count/2) modulo 2.
      var   unified   =   ( count / 2 ) % 2 ;

      // Special handling for count == 2.
      if  ( count   ==   2 )
      {
        unified   =   0 ;
      }

      // Special handling for count > 2.
      if  ( count   >   2 )
      {
        unified   =   ( ( count - 2 ) / 2 ) % 2 ;
      }

      // Print the result of a nested XOR operation.
      console . log ( xor ( xor ( A , B ) , unified ) ) ;
    }
  }
  else  // Case 2: If the total count of numbers is odd.
  {
    // Sub-case 2.1: If 'A' (the starting number) is even.
    if  ( A % 2   ==   0 )
    {
      // Initialize 'unified' based on (count/2) modulo 2.
      var   unified   =   ( ( count ) / 2 ) % 2 ;

      // Special handling for count == 1.
      if  ( count   ==   1 )
      {
        unified   =   0 ;
      }

      // Special handling for count > 1.
      if  ( count   >   1 )
      {
        unified   =   ( ( count - 1 ) / 2 ) % 2 ;
      }

      // Print the result of XORing B with 'unified'.
      console . log ( xor ( B , unified ) ) ;
    }
    else  // Sub-case 2.2: If 'A' (the starting number) is odd.
    {
      // Initialize 'unified' based on ((count-1)/2) modulo 2.
      var   unified   =   ( ( count - 1 ) / 2 ) % 2 ;

      // Print the result of XORing A with 'unified'.
      console . log ( xor ( A , unified ) ) ;
    }
  }
}


// Execute the main function with input read from stdin.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;