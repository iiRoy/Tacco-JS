/*
 * This JavaScript program defines a main function to process a specific input format.
 * It aims to calculate a value based on an array of numbers and a window size K.
 */
function Main ( input )
{

  // Split the entire input string into an array of lines.
  const arr = input . split ( '\n' ) ;

  /*
   * The first line of input (arr[0]) contains two space-separated numbers: N and K.
   * These are parsed and assigned to respective constant variables.
   */
  const [ N , K ] = arr [ 0 ] . split ( ' ' ) . map ( Number ) ;

  // The second line of input (arr[1]) contains a sequence of space-separated numbers.
  // These are parsed and stored in the 'pi' array.
  const pi = arr [ 1 ] . split ( ' ' ) . map ( Number ) ;

  let answer = 0 ; // Initialize the variable that will hold the maximum sum found.

  // The core logic involves finding the maximum sum of a contiguous sub-array of length K.

  // First, calculate the sum of the initial K elements.
  let Knum = 0 ; // This variable will store the current sum of the K-sized window.

  // Loop through the first K elements of the 'pi' array.
  for ( let i = 0 ; i < K ; i ++ )
  {
    Knum += pi [ i ] ; // Add each element to Knum.
  }

  // The initial 'answer' should be set to the sum of the first K elements,
  // as this is the first window sum we've calculated.
  answer = Knum ;

  /*
   * Now, slide the window of size K across the rest of the 'pi' array.
   * This technique is known as the "sliding window" algorithm.
   */
  for ( let i = K ; i < pi . length ; i ++ )
  {
    // For debugging purposes, one might uncomment a line like this:
    // console.log ( { 'current_element': pi[i] , 'leaving_element': pi[i-K] , 'current_index': i } ) ;

    // Add the new element entering the window (pi[i]).
    Knum += pi [ i ] ;
    // Subtract the element leaving the window (pi[i-K]).
    Knum -= pi [ i - K ] ;

    // Check if the current window sum (Knum) is greater than the previously recorded maximum (answer).
    if ( answer < Knum )
    {
      answer = Knum ; // Update 'answer' if a new maximum sum is found.
    }
  }

  // After finding the maximum window sum, perform the final calculation.
  answer = ( answer + K ) / 2 ;

  // Output the computed answer to the console.
  console . log ( answer ) ;
}

// This block handles reading input from standard input and calling the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;