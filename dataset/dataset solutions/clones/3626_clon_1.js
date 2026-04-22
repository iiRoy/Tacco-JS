/*
 * This is the primary function responsible for processing the input data.
 * It calculates and outputs a specific sequence based on the integer value of 'n'.
 */
function Main (  input  )
{

  // The input string is expected to contain multiple lines.
  // We split it by newline characters to get an array of individual lines.
  input  =  input . split ( "\n" ) ;


  // The first line of the input array (input[0]) is parsed as an integer.
  // This integer value is assigned to the variable 'n'.
  var  n  =  parseInt (  input [ 0 ]  ) ;


  // 'ans' will store the final result as a string. It is initialized with "1".
  var  ans  =  "1" ;
  // 'x' is a working variable, initialized to 0. Its purpose varies based on 'n'.
  var  x  =  0 ;
  // 'a' is another auxiliary variable, also initialized to 0.
  var  a  =  0 ;


  // --- Conditional block to handle positive values of 'n' ---
  if (  n  >  0  )
  {

    /*
     * This loop iteratively sums powers of 2.
     * 'i' starts at 0 and increments by 2 in each step.
     * The loop continues as long as 'x' is less than 'n'.
     */
    for (  i  =  0  ;  x  <  n  ;  i  =  i  +  2  )
    {
      // Add 2 raised to the power of 'i' to 'x'.
      x  +=  Math . pow (  2  ,  i  ) ;
      // The current value of 'i' is stored in 'a'.
      a  =  i
    }


    /*
     * This second loop, for positive 'n', constructs the 'ans' string.
     * It iterates from 'i = 0' up to (but not including) the value stored in 'a'.
     */
    for (  i  =  0  ;  i  <  a  ;  i  ++  )
    {
      // A complex condition involving 'n', 'x', and powers of 2.
      if (  n  >  x  -  Math . pow (  2  ,  a  -  i  )  /  2  )
      {

        // If the condition above is true, check if 'i' is an even number.
        if (  i  %  2  ==  0  )
        {
          ans  +=  "0" ; // Append "0" to the answer string.
          x  =  x ;      // 'x' remains unchanged in this specific path.
        }
        else
        {
          ans  +=  "1" ; // Append "1" to the answer string.
          x  =  x ;      // 'x' also remains unchanged here.

        }
      }
      // If the primary condition (n > x - Math.pow(...) / 2) is false.
      else
      {

        // Again, check the parity of 'i'.
        if (  i  %  2  ==  0  )
        {
          ans  +=  "1" ; // Append "1".
          x  =  x  -  Math . pow (  2  ,  a  -  i  )  /  2 ; // Update 'x' with a subtraction.
        }
        else
        {
          ans  +=  "0" ; // Append "0".
          x  =  x  -  Math . pow (  2  ,  a  -  i  )  /  2 ; // Update 'x' with the same subtraction.

        }
      }
    }

  } // End of the 'if (n > 0)' block.


  // --- Conditional block to handle negative values of 'n' ---
  else  if (  n  <  0  )
  {

    /*
     * This loop handles negative 'n'. It sums powers of -2.
     * 'i' starts at 1 and increments by 2.
     * The loop continues as long as 'x' is greater than 'n'.
     */
    for (  i  =  1  ;  x  >  n  ;  i  =  i  +  2  )
    {
      // Add -2 raised to the power of 'i' to 'x'.
      x  +=  Math . pow (  -2  ,  i  ) ;
      // Store the current 'i' in 'a'.
      a  =  i
    }

    /*
     * This second loop, for negative 'n', also builds the 'ans' string.
     * It iterates from 'i = 1' up to (and including) the value in 'a'.
     */
    for (  i  =  1  ;  i  <=  a  ;  i  ++  )
    {

      // Another complex condition, adjusted for negative 'n'.
      if (  n  >  x  +  Math . pow (  2  ,  a  -  (  i  -  1  )  )  /  2  )
      {
        // If this condition is met, check 'i' parity.
        if (  i  %  2  ==  0  )
        {
          ans  +=  "0" ; // Append "0".
          x  =  x ;      // 'x' remains unchanged.
        }
        else
        {
          ans  +=  "1" ; // Append "1".
          x  =  x ;      // 'x' also remains unchanged here.

        }
      }
      // If the primary condition for negative 'n' is false.
      else
      {
        // Check 'i' parity.
        if (  i  %  2  ==  0  )
        {
          ans  +=  "1" ; // Append "1".
          x  =  x  +  Math . pow (  2  ,  a  -  (  i  -  1  )  )  /  2 ; // Update 'x' with an addition.
        }
        else
        {
          ans  +=  "0" ; // Append "0".
          x  =  x  +  Math . pow (  2  ,  a  -  (  i  -  1  )  )  /  2 ; // Update 'x' with the same addition.

        }
      }
    }

  } // End of the 'else if (n < 0)' block.


  // --- Handling the special case where 'n' is zero ---
  else
  {
    ans  =  0 ; // If 'n' is exactly 0, the answer is simply "0".
  }


  // Finally, print the computed answer to the console.
  console . log (  '%s'  ,  ans  ) ;

} // End of the Main function definition.


// The Main function is called here, providing input read from standard input.
// 'require("fs").readFileSync("/dev/stdin", "utf8")' reads the entire content
// of standard input as a UTF-8 encoded string.
Main (  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )  ) ;