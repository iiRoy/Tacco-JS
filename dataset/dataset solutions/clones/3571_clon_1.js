/*
 * This JavaScript module defines a function named 'Main'
 * which processes input data to calculate a specific value.
 * The input is expected to be a string.
 */
function Main(  input  )
{
  // The input string is expected to contain space-separated values.
  // We'll parse these into an array 'xy'.
  var   xy   =   input .  split (  ' '  ) ;


  // Extract N and k from the parsed input, converting them to integers.
  var   N   =   parseInt (  xy [ 0 ]  ) ;
  var   k   =   parseInt (  xy [ 1 ]  ) ;

  /*
   * Initialize the answer variable.
   * This variable will accumulate the final count.
   */
  var   ans   =   0 ;


  // Early exit condition: if 2*N is less than k, the answer is always 0.
  if  (  2   *   N   <   k  )
  {
    return   0 ;
  }

  // Outer loop: iterate 'a' from 1 to N (inclusive).
  for  (  var   a   =   1 ;   a   <=   N ;   a ++  )
  {

    // Calculate 'b' based on 'a' and 'k'.
    var   b   =   a   %   k ;

    // If 'b' is 0, reset it to 'k'.
    if  (  b   ==   0  )
    {
      b   =   k ;
    }

    // Middle loop: iterate 'b' while it's less than or equal to N.
    while  (  b   <=   N  )
    {

      // Check the condition for 'a' and 'b'.
      if  (  (  a   +   b  )   %   k   ==   0  )
      {
        // Calculate 'c' based on 'a' and 'k'.
        var   c   =   a   %   k ;

        // If 'c' is 0, reset it to 'k'.
        if  (  c   ==   0  )
        {
          c   =   k ;
        }

        // Inner loop: iterate 'c' while it's less than or equal to N.
        while  (  c   <=   N  )
        {
          // Check conditions for 'a', 'b', and 'c'.
          if  (  (  a   +   c  )   %   k   ==   0   &&   (  c   +   b  )   %   k   ==   0  )
          {
            // Increment the answer if all conditions are met.
            // console.log(a,b,c); // Debugging line, commented out in original.
            ans ++ ;
          }
          else
          {
            // If conditions not met, check for early break.
            if  (  (  a   +   c  )   >=   k   &&   (  c   +   b  )   >=   k  )
            {
              break ;
            }
          }
          // Increment 'c' by 'k'.
          c   +=   k ;
        }
      }
      else
      {
        // If the (a+b)%k condition is not met, check for early break.
        if  (  (  a   +   b  )   >=   k  )
        {
          break ;
        }
      }
      // Increment 'b' by 'k'.
      b   +=   k ;
    }
  }

  // Output the final calculated answer to the console.
  console .  log (  ans  ) ;
}

// This section handles reading input from /dev/stdin.
// It's crucial for execution environments like competitive programming platforms.
// The commented-out line shows an alternative for local testing.
// Main(require("fs").readFileSync(__dirname+'/in.txt', "utf8"));
Main (  require (  'fs'  ) .  readFileSync (  '/dev/stdin'  ,   'utf8'  )  ) ;