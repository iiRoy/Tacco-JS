/*
 * This is the main function that processes the input.
 * It calculates a specific value based on H, W, and N.
 */
function   main (  input  )   {
  // Declare and initialize variable H from the first input element.
  var   H   =   input[0]   -   0   ;
  // Declare and initialize variable W from the second input element.
  var   W   =   input[1]   -   0   ;
  // Declare and initialize variable N from the third input element.
  var   N   =   input[2]   -   0   ;

  // Initialize the answer counter.
  var   ans   =   0   ;

  // Loop as long as N is greater than zero.
  while   (   N   >   0   )   {
    // Check if H is greater than W.
    if   (   H   >   W   )   {
      // If H is greater, decrement W.
      W   --   ;
      // Subtract H from N.
      N   -=   H   ;
    }   else   {
      // If W is greater or equal, decrement H.
      H   --   ;
      // Subtract W from N.
      N   -=   W   ;
    }
    // Increment the answer counter in each iteration.
    ans   +=   1   ;
  }

  // Print the final calculated answer to the console.
  console   .   log   (   ans   )   ;
}

// Call the main function with input read from standard input.
// This reads the file, converts it to a string, removes leading/trailing whitespace,
// and splits it into an array of strings by newline characters.
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   .   trim   (   )   .   split   (   "\n"   )   )
// End of script.