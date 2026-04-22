'use strict'; /* This directive enforces strict mode for the entire script,
                           which helps in catching common coding errors and
                           "unsafe" actions. */
console.log(  // This statement is used to output the final result
              // of the immediately invoked function expression (IIFE)
              // to the standard output.
  function( /* Anonymous function definition begins here.
              * This function processes the input data. */
    args    // The 'args' parameter will receive the content read from stdin.
  ){        // Start of the function body.

    /*
     * The following lines perform initial parsing of the input string.
     * 1. `args.trim()`: Removes any leading or trailing whitespace
     *    from the input string.
     * 2. `.split('\n')`: Divides the trimmed string into an array of
     *    individual lines, using the newline character as a delimiter.
     * 3. `.map( r => r.split(' ').map(v=>v|0) )`:
     *    - For each line (`r`), it splits the line by spaces (`r.split(' ')`)
     *      to get an array of string numbers.
     *    - Then, for each string number (`v`), it converts it to an integer
     *      using the bitwise OR operator with 0 (`v|0`). This is a common
     *      shorthand for `parseInt(v, 10)` or `Number(v)`.
     * The result is a 2D array of integers.
     */
    const tmp = args  .  trim()
                      .  split('\n')
                      .  map( r  =>  r.split(' ') . map( v => v | 0 )  )  ;

    // Extract the values for N and M from the first row of the 'tmp' array.
    // N typically represents the number of nodes/elements, and M the number of edges/operations.
    const N = tmp[0][0]  ,  M = tmp[0][1]  ;

    // Initialize two empty arrays, 'x' and 'y', which will store
    // pairs of coordinates or related values from the input.
    const x = []  ,  y = []  ;


    // Loop through the input data (starting from the second line)
    // to populate the 'x' and 'y' arrays.
    // This loop runs M times, reading M pairs of values.
    for  (  let  i  =  0  ;  i  <  M  ;  i++  )
    {
      x.push(  tmp[1+i][0]  )  ; // Add the first element of the (i+1)-th line to 'x'.
      y.push(  tmp[1+i][1]  )  ; // Add the second element of the (i+1)-th line to 'y'.
    }


    /*
     * Initialize a 2D array named 'dp' (dynamic programming table).
     * The dimensions are (M+1) rows and (N+1) columns.
     * - `Array(M+1)`: Creates an array with M+1 empty slots for rows.
     * - `.fill(0)`: Fills these slots with 0 (necessary for the next map to work correctly).
     * - `.map(_ => Array(N+1).fill(0))`: For each row, it creates a new
     *   array of size N+1 and fills it with zeros.
     * This effectively creates a table where `dp[i][j]` can store calculated values.
     */
    const dp  =  Array(M+1)
                  .  fill(0)
                  .  map( _  =>  Array(N+1)  .  fill(0)  )  ;


    // This nested loop populates the dynamic programming table 'dp'.
    // It appears to be solving a problem related to paths or sequences.
    // The outer loop iterates from 1 up to M (inclusive).
    for  (  let  i  =  1  ;  i  <=  M  ;  i++  )  {
      // The inner loop iterates from 0 up to M-1 (inclusive).
      for  (  let  j  =  0  ;  j  <  M  ;  j++  )  {
        // The core DP update step:
        // `dp[i][y[j]]` is updated to be the maximum of its current value
        // and `dp[i-1][x[j]] + 1`. This typically suggests finding the
        // longest path or sequence ending at `y[j]` after `i` steps/operations,
        // coming from `x[j]` in the previous step.
        dp[i][y[j]]  =  Math.max(  dp[i][y[j]]  ,  dp[i-1][x[j]]  +  1  )  ;
      }
    }


    // After filling the DP table, the final result is determined.
    // `dp[M]` retrieves the last row of the DP table.
    // `...dp[M]` uses the spread operator to pass all elements of this row
    //            as individual arguments to `Math.max()`.
    // `Math.max(...)` finds the largest value among these elements.
    // `.toString()` converts this maximum number into a string,
    // which is the required output format.
    return  Math.max(  ...dp[M]  )  .  toString()  ;

  }(  // End of the anonymous function definition.
    // This is the part that provides input to the anonymous function.
    require('fs')  // Accesses Node.js's built-in 'fs' (file system) module.
      .  readFileSync(  // Calls the `readFileSync` method to read a file synchronously.
        '/dev/stdin'  ,  // Specifies the path to the standard input stream.
        'utf8'          // Specifies the character encoding for reading the file.
      )
  ) // The result of `readFileSync` is immediately passed as 'args' to the function.
); // End of the `console.log` call.