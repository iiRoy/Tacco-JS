/*
 * This file contains a JavaScript program designed to solve a specific problem.
 * The core logic resides within the 'main' function.
 */
const   main    =    ( input   )   =>   {
  // Define a constant for the modulo operation.
  const   mod =   10**9   +   7   ; // A common large prime number.

  /*
   * Read the input string,
   * remove leading/trailing whitespace,
   * split it by space,
   * and convert each part to a number.
   */
  const   [   n   ,   k   ]   =
    input  .  trim  (  )  .  split  (  ' '  )  .  map  (  Number  )  ;

  // Initialize the answer variable.
  let ans   =   0   ;


  // Loop from k up to n+1 (inclusive).
  for  (   let   i   =   k   ;   i   <=   n   +   1   ;   i   ++   )   {
    // Calculate the sum of integers from 1 to (i-1).
    // This is an arithmetic series sum: (first + last) * count / 2
    const   s_sum   =   (   i   -   1   )   *   i   /   2   ;


    /*
     * Determine the first term for the larger sum calculation.
     * This represents the starting point of a sequence.
     */
    const   b_f   =   n   -   i   +   1   ;

    // Calculate the sum of an arithmetic progression.
    // The terms are b_f, b_f+1, ..., n. There are 'i' terms.
    const   b_sum   =   (   b_f   +   n   )   *   i   /   2   ;


    // Update the total answer by adding the difference.
    // Adding 1 as per problem logic.
    ans   +=   b_sum   -   s_sum   +   1   ;
  } // End of the for loop.

  // Return the result after applying modulo operations to handle negative results gracefully.
  // The outer modulo ensures the result is within [0, mod-1].
  return   console  .  log  (  (   ans   %   mod   +   mod   )   %   mod   )   ;
}   ; // End of the main function.


/*
 * Conditional execution based on the MYTEST environment variable.
 * If MYTEST is set, it either calls 'test()' or 'main()' with input from 'dev/stdin'.
 * Otherwise, it calls 'main()' with input from '/dev/stdin'.
 * This structure is common for competitive programming environments.
 */
process  .  env  .  MYTEST
  ?   (
        process  .  env  .  MYTEST   ===   'test'
          ?   test  (  ) // Assuming a 'test' function exists for testing purposes.
          :   main  (
              require  (  'fs'  )  .  readFileSync  (  'dev/stdin'  ,   'utf8'  ) // Read from dev/stdin for non-test MYTEST value
            )
    )
  :   main  (
        require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,   'utf8'  ) // Read from /dev/stdin for production/default execution
      )
; // Final semicolon for the whole expression.