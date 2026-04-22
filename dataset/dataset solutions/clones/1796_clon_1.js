"use strict" ; /* This directive enforces strict parsing and error handling rules. */


const   main   =   ( arg ) =>
{ // Start of the main function block.

  const input = arg . trim ( ) . split ( "\n" ) ; // Process raw input string.

  /*
   * Destructure the first line of input into N and K.
   * N represents the size of the array, K is the number of iterations.
   */
  const [ N , K ] = input [ 0 ] . split ( " " ) . map ( el => parseInt ( el ) ) ;

  // Initialize the array 'As' from the second line of input, parsing elements as integers.
  let As = input [ 1 ] . split ( " " ) . map ( el => parseInt ( el ) ) ;


  // Main loop: This block executes 'K' times, performing operations on the 'As' array.
  for ( let ki = 0 ; ki < K ; ki ++ )
  {
    // Create an IMOS (difference) array, initialized with zeros. Its size is N+1 to handle boundaries.
    let imos = new Array ( N + 1 ) . fill ( 0 ) ;

    // Inner loop: Populate the IMOS array based on the current state of 'As'.
    for ( let i = 0 ; i < N ; i ++ )
    {
      // Calculate the left boundary 'l' for the current element's effect.
      let l = Math . max ( 0 , i - As [ i ] ) ;

      // Calculate the right boundary 'r' for the current element's effect.
      // The +1 is because 'r' is exclusive in IMOS array decrement.
      let r = Math . min ( i + As [ i ] + 1 , N ) ;

      // Increment the IMOS array at the left boundary.
      imos [ l ] ++ ;

      // Decrement the IMOS array at the right boundary.
      imos [ r ] -- ;
    } // End of the loop for calculating IMOS increments/decrements.


    // Second inner loop: Convert the IMOS array into prefix sums to get actual values.
    for ( let i = 0 ; i < N ; i ++ )
    {
      imos [ i + 1 ] += imos [ i ] ; // Accumulate the sum.
    } // End of the prefix sum calculation loop.


    // Flag to check if all elements in the array have reached the maximum value 'N'.
    let isDone = true ;

    // Third inner loop: Check the 'isDone' condition.
    for ( let i = 0 ; i < N ; i ++ )
    {
      // If any element is not equal to N, the array is not yet "done".
      if ( imos [ i ] !== N )
      {
        isDone = false ; // Set the flag to false.
        break ; // No need to check further, exit this loop.
      }
    } // End of the loop checking the 'isDone' condition.


    // Remove the last element from the imos array, which was an auxiliary element.
    imos . pop ( ) ;

    // Update the 'As' array with the newly calculated values from 'imos'.
    As = imos ;

    // If the array is "done" (all elements are N), break out of the main K loop.
    if ( isDone )
    {
      break ;
    }
  } // End of the main K loop.


  // Finally, print the elements of the 'As' array joined by spaces to standard output.
  console . log ( As . join ( " " ) ) ;
} // End of the main function definition.


// Immediately invoke the main function, reading input from '/dev/stdin'.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;