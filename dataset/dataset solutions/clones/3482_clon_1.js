/**
 *  This JavaScript file implements a solution for a problem involving string comparisons
 *  and number theory concepts like Greatest Common Divisor (GCD).
 *  It includes helper functions for GCD calculation and index generation.
 */

// Function to calculate the Greatest Common Divisor (GCD) of two numbers.
// This uses the Euclidean algorithm, which is an efficient method.
function  gcd ( a ,  b )
{
  // The base case for the Euclidean algorithm:
  // if 'b' is zero, then 'a' is the GCD.
  if  ( b  ===  0 )
  {
    return  a ;
  }
  // Recursive step: GCD(a, b) is the same as GCD(b, a % b).
  // The modulo operator (%) gives the remainder of the division.
  return  gcd ( b ,  a  %  b ) ;
}


// Function to generate a specific array of indices.
// These indices are derived from 'n' and 'l' parameters.
function  get_indexs ( n ,  l )
{
  // Initialize an empty array to store the computed indices.
  var  array  =  [ ] ;

  // The first element of the array is always 0, as per problem requirements.
  array . push ( 0 ) ;

  // Loop from 1 up to 'n - 1' to populate the rest of the array.
  // Each iteration calculates a new index.
  for  ( var  i  =  1 ;  i  <=  n  -  1 ;  i ++ )
  {
    // The formula for each subsequent index involves 'i', 'l', and 'n'.
    // This scales 'i' by 'l/n'.
    array . push ( ( i  *  l )  /  n ) ;
  }

  // Return the fully populated array of indices.
  return  array ;
}


// The main entry point of the program.
// It takes a single argument, which is expected to be the input string.
function  main ( arg )
{
  // Split the input string into an array of lines based on newline characters.
  var  arg  =  arg . split ( "\n" ) ;

  // Parse the first line of input to extract 'n' and 'm'.
  // It's assumed the first line contains two space-separated numbers.
  var  tmp  =  arg [ 0 ] . split ( " " ) ;
  var  n  =  Number ( tmp [ 0 ] ) ; // Convert the first part to a number.
  var  m  =  Number ( tmp [ 1 ] ) ; // Convert the second part to a number.

  // The second line is the first string 's'.
  var  s  =  arg [ 1 ] ;
  // The third line is the second string 't'.
  var  t  =  arg [ 2 ] ;


  // Calculate the Greatest Common Divisor (GCD) of 'n' and 'm'.
  // This 'k' value is crucial for later calculations, particularly for LCM.
  var  k  =  gcd ( n ,  m ) ;

  // Initialize an 'ans' variable, though it's mostly unused in this specific logic path.
  var  ans  =  -1 ;

  // Check for a special case: if the two strings 's' and 't' are identical.
  if  ( s  ===  t )
  {
    // If they are identical, print 'n' and terminate the function.
    console . log ( n ) ;
    return ;
  }

  // Check for another special case: if 'n' is a multiple of 'm', or 'm' is a multiple of 'n'.
  // This implies a direct relationship between their lengths.
  if  ( n  %  m  ===  0  ||  m  %  n  ===  0 )
  {
    // In this scenario, print -1, indicating no valid solution under the main logic.
    console . log ( -1 ) ;
  }
  else
  {
    // If neither of the special cases applies, proceed with the main algorithm.
    // Initialize a loop variable 'i'.
    var  i  =  0 ;

    // The main loop iterates to find a common "period" or "length".
    // The starting value for 'i' is the Least Common Multiple (LCM) of 'n' and 'm',
    // which is (n * m) / GCD(n, m).
    // The loop continues as long as 'i' is less than 10^5 (a predefined upper limit).
    // 'i' increments by the LCM in each step.
    for  ( i  =  ( n  *  m )  /  k ;  i  <  Math . pow ( 10 ,  5 ) ;  i += ( ( n  *  m )  /  k ) )
    {
      // Generate two arrays of indices based on 'n', 'm', and the current 'i'.
      var  n_arr  =  get_indexs ( n ,  i ) ;
      var  m_arr  =  get_indexs ( m ,  i ) ;

      // A boolean flag to track if a match is found for the current 'i'.
      var  flg  =  true ;


      // Inner loop: iterate from 0 up to 'i - 1' to compare characters.
      for  ( var  j  =  0 ;  j  <  i ;  j ++ )
      {
        // Find the index 'j' within 'n_arr' and 'm_arr'.
        // If 'j' is present, its index in 's' or 't' is 'n_i' or 'm_i' respectively.
        var  n_i  =  n_arr . indexOf ( j ) ;
        var  m_i  =  m_arr . indexOf ( j ) ;

        // If 'j' is not found in either 'n_arr' or 'm_arr' (indexOf returns -1),
        // then this specific 'j' value is not relevant for comparison, so skip.
        if  ( n_i  <  0  ||  m_i  <  0 )
        {
          continue ;
        }

        // If 'j' is found in both, compare the characters at the determined indices.
        // If characters do not match, set 'flg' to false and break the inner loop.
        // This means the current 'i' value is not a solution.
        if  ( s [ n_i ]  !==  t [ m_i ] )
        {
          flg  =  false ;
          break ;
        }
      }


      // After the inner loop, if 'flg' is still true, it means all relevant characters matched.
      // This indicates that the current 'i' is the solution.
      if  ( flg )
      {
        break ; // Exit the outer loop as the solution is found.
      }

    }
    // Print the final 'i' value, which represents the solution.
    console . log ( i ) ;
  }

}

// This line reads input from standard input (typically '/dev/stdin' on Linux-like systems)
// and passes it as a UTF-8 string to the 'main' function to start the program execution.
main (
  require ( 'fs' )
    . readFileSync ( '/dev/stdin' ,  'utf8' )
) ;