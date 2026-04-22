/*
 * This is the main function that processes the input for a specific problem.
 * It performs several checks and calculations based on the provided data.
 * The primary goal is to determine a final value for 'c'.
 */
function Main(  input  )
{
    // Step 1: Process the raw input string.
    // It's split into an array of strings, where each element is a line from the input.
    input  =  input . split ( "\n" ) ;

    // Step 2: Extract the second line of input (index 1) and split it by spaces.
    // This typically represents a list of numbers or tokens.
    tmp   =   input[ 1 ] . split( " " ) ;

    // Step 3: Initialize key variables.
    // 'c' acts as a flag or a result accumulator, starting with a default success value.
    var   c   =   1   ;
    // 'd' is declared but currently unused in the algorithm's logic.
    var   d   =   0   ;
    // 'e' is an array intended to store frequency counts of elements.
    var   e   =   [ ]   ;


    // Step 4: Initialize the frequency array 'e'.
    // All elements are set to zero before counting begins.
    // The size of 'e' is based on the number of elements in 'tmp'.
    for (  k = 0 ;   k < tmp . length ;   k ++  )
    {
       e [ k ] = 0 ; // Set initial count for index 'k' to 0.
    }


    // Step 5: Count frequencies and perform an initial validation.
    // This loop iterates through the 'tmp' array.
    for (  i = 0 ;   i < tmp . length ;   i ++  )
    {
      // Increment the count for the number represented by tmp[i].
      // Note: tmp[i] is a string, but JavaScript's implicit conversion handles it as an index.
      e [ tmp [ i ] ] ++ ;

      // Check if any number appears more than twice.
      // If so, the condition for 'c' being 1 is violated.
      if (   e [ tmp [ i ] ] > 2   )
      {
        c   =   0   ; // Set 'c' to 0, indicating a failure condition.
        break   ;     // No need to continue checking, exit the loop.
      }
    }


    // Step 6: Perform conditional checks based on the first input line and frequency of '0'.
    // This condition checks if the first line (input[0]) is odd AND the frequency of '0' is not 1.
    if (   input [ 0 ] % 2 == 1   &&   e [ 0 ] != 1   )
    {
      c   =   0   ; // If this specific combination occurs, 'c' is set to 0.
    }
    else
    {
      // If the above condition is not met, a more complex set of checks is performed.
      // This loop starts from index 1 (skipping 0) and goes up to tmp.length.
      for (  j = 1 ;   j < tmp . length ;   j ++  )
      {
         /*
          * This is a critical and complex validation step.
          * It checks four different scenarios, combining the parity of input[0],
          * the parity of the current index 'j', and the expected frequency e[j].
          * If any of these conditions are true, it means the input does not conform
          * to the required pattern, and 'c' must be set to 0.
          */
         if (   (   input [ 0 ] % 2 == 0   &&   j % 2 == 1   &&   e [ j ] != 2   )   || // Scenario 1
              (   input [ 0 ] % 2 == 1   &&   j % 2 == 0   &&   e [ j ] != 2   )   || // Scenario 2
              (   input [ 0 ] % 2 == 0   &&   j % 2 == 0   &&   e [ j ] != 0   )   || // Scenario 3
              (   input [ 0 ] % 2 == 1   &&   j % 2 == 1   &&   e [ j ] != 0   )   )   // Scenario 4
         {
           c   =   0   ; // Set 'c' to 0 if any of the scenarios are met.
           break   ;     // Terminate the loop early as a failure is confirmed.
         }
      }
    }


    // Step 7: Final calculation if all validation checks pass.
    // If 'c' is still 1, it means all conditions were met, and we proceed with the final calculation.
    if (   c == 1   )
    {
      // Calculate (tmp.length / 2) as an integer, then square it.
      // Finally, take the result modulo (10^9 + 7), which is a common practice in competitive programming
      // to prevent integer overflow and keep results within a manageable range.
      c   =   Math . pow (   parseInt (   tmp . length   /   2   )   ,   2   )   %   (   Math . pow (   10   ,   9   )   +   7   )   ;
    }

    // Step 8: Output the final computed value of 'c'.
    console . log (   '%s'   ,   c   ) ;
}

/*
 * This 'debug' function provides a way to run the 'Main' function
 * in a browser environment. It fetches input from an HTML element
 * with the ID "input".
 */
function debug ( )
{
	var   input   =   document . getElementById ( "input" ) . value ;
	Main (   input   ) ;
}

// This is the entry point for running the script in a Node.js environment.
// It reads the entire content of '/dev/stdin' (standard input) as a UTF-8 string,
// and then passes this string to the 'Main' function for processing.
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" )   ) ;