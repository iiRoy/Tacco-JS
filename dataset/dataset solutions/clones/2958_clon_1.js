'use strict' /* This directive enforces strict mode,
                          leading to cleaner code and fewer silent errors. */


/*
 * Main function that processes the input and calculates the result.
 * It takes a string 'input' which contains two space-separated numbers.
 */
function Main ( input )
{
  // --- Input Parsing ---
  // Split the input string by space and convert the parts to numbers.
  const   N   =   Number ( input . split ( " " ) [ 0 ] ) ; // The first number is N.
  const   K   =   Number ( input . split ( " " ) [ 1 ] ) ; // The second number is K.


  let   numerator   =   0 ; // Initialize a variable to accumulate the sum of probabilities.


  // --- Probability Calculation Loop ---
  // Iterate from 1 up to N (inclusive) to consider each possible starting value.
  for ( let   i   =   1 ;   i   <=   N ;   i ++ )
  {
    /*
     * If the current value 'i' is already greater than or equal to K,
     * then the probability of reaching K from 'i' (or staying at K) is 1.
     * We directly add 1 to the numerator.
     */
    if ( i   >=   K )
    {
      numerator ++ ; // Increment numerator by 1.
      continue ;     // Skip the rest of the loop body for this iteration and proceed to the next 'i'.
    }

    // --- For i < K, calculate the probability of reaching K ---
    let   num   =   i ;       // 'num' represents the current value being doubled.
    let   adder   =   1 ;     // 'adder' represents the probability contribution for this path, initially 1.

    /*
     * While 'num' is less than K, we simulate doubling 'num'.
     * Each doubling halves the probability of achieving that state,
     * so 'adder' is divided by 2.
     */
    while ( num   <   K )
    {
      num   *=   2 ;    // Double the current number.
      adder   /=   2 ;    // Halve the probability contribution.
    }
    // After the loop, 'adder' holds the probability that 'i' eventually reaches or exceeds K.
    numerator   +=   adder ; // Add this calculated probability to the total numerator.
  }


  // --- Output Result ---
  // The final answer is the total accumulated probability (numerator) divided by N.
  console . log ( numerator   /   N ) ;

}


// --- Program Entry Point ---
// Read the input from standard input, decode it as UTF-8, remove leading/trailing whitespace,
// and then pass it to the Main function for processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;