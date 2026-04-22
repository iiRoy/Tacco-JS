/*
 * This function processes input data.
 * The 'input' parameter receives all necessary raw data.
 */
function Main(input)
  {
    // The input string is expected to be space-separated.
    // The first part represents N, the second part represents k.
    var  xy  =  input . split ( ' ' ) ;

    // Parse the first component as N (an integer).
    var  N  =  parseInt ( xy [ 0 ] ) ;

    // Parse the second component as k (an integer).
    var  k  =  parseInt ( xy [ 1 ] ) ;

    // Initialize the answer counter to zero.
    var  ans  =  0 ;


    // Outer loop for variable 'a'.
    // 'a' iterates from 1 up to N, inclusive.
    for  ( var  a  =  1 ;  a  <=  N ;  a ++ )
    {
      // Calculate 'b' based on 'a' modulo 'k'.
      // If 'a' is a multiple of 'k', 'b' becomes 'k' instead of 0.
      var  b  =  a  %  k ;
      if ( b  ==  0 )
          b  =  k ;

      // Second loop for variable 'b'.
      // 'b' increments by 'k' in each step.
      while ( b  <=  N )
      {
        // Calculate 'c' based on 'a' modulo 'k'.
        // Similar to 'b', if 'a' is a multiple of 'k', 'c' becomes 'k'.
        var  c  =  a  %  k ;
        if ( c  ==  0 )
            c  =  k ;

        // Innermost loop for variable 'c'.
        // 'c' also increments by 'k' in each step.
        while ( c  <=  N )
        {
          // Check the conditions:
          // (a+b) must be a multiple of k
          // (a+c) must be a multiple of k
          // (c+b) must be a multiple of k
          if ( ( a + b ) % k == 0  &&  ( a + c ) % k == 0  &&  ( c + b ) % k == 0 )
          {
            // If all conditions are met, increment the answer.
            ans ++ ;
          }
          // Move to the next possible value for 'c'.
          c += k ;
        }
        // Move to the next possible value for 'b'.
        b += k ;
      }
    }
    // Output the final calculated answer to the console.
    console . log ( ans ) ;
  }

/* DO NOT ALTER THIS LINE! */
// The following line reads input from a file named 'in.txt' for local testing purposes.
// Main ( require ( "fs" ) . readFileSync ( __dirname + '/in.txt' , "utf8" ) ) ;
// The subsequent line reads input from standard input, as required in competitive programming environments.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;