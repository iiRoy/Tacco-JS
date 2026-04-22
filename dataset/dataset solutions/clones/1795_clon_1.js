'use strict'
; /* This directive ensures strict mode for the entire script. */

function Main ( stdin )
{
  // Start of the main function processing logic.
  const input = stdin . trim ( ) . split ( / \r? \n / g )
  ; /* Read and preprocess the input data from stdin.
       The input is trimmed and split into lines. */

  const N_K = input [ 0 ] . split ( ' ' ) . map ( str => Number ( str ) )
  ; // Parse the first line to get N and K.

  const N = N_K [ 0 ]
  ,     K = N_K [ 1 ]
  ; // Destructure N and K from the parsed array.

  let A = input [ 1 ] . split ( ' ' ) . map ( str => Number ( str ) )
  ; /* Initialize array A from the second line of input.
       This array will be updated in each iteration. */

  let max = 0
  ,   min = 0
  ; // Declare and initialize max and min variables.

  let result = new Array ( N )
  ; // Create a new array of size N to store intermediate results.


  // Begin the main loop, iterating K times.
  for ( let i = 0 ; i < K ; i ++ )
  {
    /* Before each iteration, the result array is reset to all zeros.
       This is crucial for correct calculation. */
    result . fill ( 0 )
    ;

    // Inner loop to process each element of array A.
    for ( let j = 0 ; j < N ; j ++ )
    {
      // Calculate the maximum reachable index.
      // Ensure it does not exceed N-1.
      max = ( j + A [ j ] ) > N ? N - 1 : j + A [ j ]
      ;

      // Calculate the minimum reachable index.
      // Ensure it does not go below 0.
      min = ( j - A [ j ] ) < 1 ? 0 : j - A [ j ]
      ;

      /* Innermost loop: Iterate from min to max,
         incrementing the count in the result array. */
      for ( let k = min ; k <= max ; k ++ )
      {
        result [ k ] += 1
        ; // Increment the count for the current index.
      }
    }

    // After processing all elements for the current iteration,
    // update array A with the new counts from 'result'.
    // A shallow copy is made using slice(0).
    A = result . slice ( 0 )
    ;
  }

  // Finally, print the elements of the result array joined by spaces.
  console . log ( result . join ( ' ' ) )
  ;
}

/*
 * This section handles the standard input/output mechanism.
 * It reads the entire content of /dev/stdin synchronously
 * and passes it to the Main function.
 * This part is typically fixed for competitive programming environments.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) )
;