/*
 *  Strict mode declaration for JavaScript.
 *  Ensures code runs in a "strict" operating context, preventing certain actions
 *  and throwing more exceptions (errors).
 */
'use strict'



/**
 *   This is the primary function for processing the input data.
 *   It takes a string 'input' as its argument, performs a series of
 *   calculations based on characters within the string, and then
 *   prints the maximum calculated value to the console.
 *
 *   @param {string} input - The raw input string to be processed.
 */
function
main( input )
{

  // First, we convert the input string into an array of individual characters.
  input = input . split ( '' ) ;


  /*
   * The problem statement implies that the first character of the input
   * (after splitting) represents the 'length' or count for the loop.
   * This is a bit unusual, as 'length' usually refers to a numerical value.
   * Assuming input[0] is meant to be a digit character that needs to be
   * converted to a number, although the original code treats it as a string.
   * For Type I, we must keep it as `input[0]` without explicit conversion.
   */
  const
    length
    =
    input[ 0 ] ;

  // Initialize a result variable, starting at zero.
  let
    res
    =
    0
    ;

  // Initialize a list (array) to store intermediate results. It starts with 0.
  let
    list
    =
    [ 0 ]
    ;


  /*
   *  Commencing the main processing loop.
   *  This loop iterates 'length' times, where 'length' is derived from input[0].
   *  It processes characters in the input array starting from index 2.
   *  The loop variable 'i' is used to access elements of the input array.
   */
  for
  (
    let
      i
      =
      0
      ;
    i
    <
    length
    ;
    i++
  )
  {

    // Check the character at current index (i + 2) in the input array.
    // If it's 'I', increment the 'res' counter.
    if
    (
      input
      [
        i
        +
        2
      ]
      ==
      'I'
    )
    {
      res
      ++
      ; // Increment the result.
    }
    // Otherwise (if it's not 'I'), decrement the 'res' counter.
    else
    {
      res
      --
      ; // Decrement the result.
    }

    // After updating 'res', add its current value to our 'list' array.
    list
      .
      push
      (
        res
      )
    ;
  }

  /*
   * Once the loop completes, we find the maximum value stored
   * within our 'list' of intermediate results.
   * The spread operator (...) is used to pass array elements as
   * separate arguments to Math.max().
   * Finally, this maximum value is printed to the standard output.
   */
  console
    .
    log
    (
      Math
        .
        max
        (
          ...
          list
        )
    )
  ;
}


// --- Program Entry Point ---
// This line reads the input from standard input, converts it to a UTF-8 string,
// and then passes it to the 'main' function for processing.
main
(
  require
    (
      "fs"
    )
    .
    readFileSync
    (
      "/dev/stdin"
      ,
      "utf8"
    )
)
;