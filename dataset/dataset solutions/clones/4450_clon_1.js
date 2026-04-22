/*
 *   This is a Type I clone example.
 *   The original source code's functionality is preserved entirely.
 *   Only whitespace and comments have been altered.
 */

"use strict"
; /* Enable strict mode for better error handling and cleaner code */


const main = arg =>
{
  // Process the input argument: trim whitespace and split by newlines.
  arg = arg
    .trim()
    .split("\n")
  ;


  /*
   * Extract dimensions H and W from the first line of the input.
   * H is the first number, W is the second.
   */
  const H = parseInt(arg[0] .split(" ") [0])
  ;
  const W = parseInt(arg[0] .split(" ") [1])
  ;


  // Get the number of distinct items from the second line.
  const N = parseInt(arg[1])
  ;

  /*
   * Parse the array A from the third line.
   * Each element represents the count of a specific item.
   */
  const A = arg[2] .split(" ") .map(n => parseInt(n))
  ;


  /*
   * Initialize a temporary array.
   * This array will store the sequence of items based on their counts.
   */
  let temp = []
  ;


  // Special case: if N is 1, simply print 1 and exit.
  if (N === 1)
  {
    console.log(1)
    ;
    return
    ;
  }


  /*
   * Populate the 'temp' array.
   * For each item 'i' from 1 to N, add 'i' to 'temp' A[i-1] times.
   */
  for (let i = 1; i <= N; i++)
  {
    for (let j = 0; j < A[i - 1]; j++)
    {
      temp.push(i)
      ;
    }
  }


  // Initialize 'answer' to store the final output rows.
  let answer = []
  ;
  // Initialize 'list' to store items for the current row.
  let list = []
  ;


  /*
   * Iterate through the 'temp' array to form rows.
   * Each row has 'W' elements.
   */
  for (let i = 0; i < temp.length; i++)
  {
    list.push(temp[i])
    ;

    /*
     * Check if the current row is complete (has 'W' elements)
     * or if it's the end of the input (and the row might be partial).
     */
    if ( (i !== 0) && ( (~~i + 1) % W === 0 ) )
    {

      /*
       * If the row index 'i' is odd, reverse the 'list' (current row)
       * to simulate a snake-like pattern.
       */
      if (i % 2 !== 0)
      {
        list.reverse()
      }

      // Add the completed row (joined by spaces) to the 'answer' array.
      answer.push(list.join(" "))
      ;
      // Clear 'list' to start a new row.
      list = []
      ;
    }
  }

  // Print all rows, joined by newline characters.
  console.log(answer.join("\n"))
  ;
}

// Call the main function with input read from stdin.
main(require('fs') .readFileSync('/dev/stdin', 'utf8'))
;