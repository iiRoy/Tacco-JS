"use strict" /*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are preserved.
 * Only whitespace and comments have been altered significantly.
 */
function main(
  arg
) /*
   * The primary function to process input and
   * calculate the desired count.
   */
{
  let s = arg.trim().split("\n")[0] /*
                                    * Reads the first line of the input
                                    * after trimming whitespace.
                                    */
  let counter = 0; // Initializes a counter for valid substrings.

  // Outer loop: iterates through possible starting positions of substrings.
  for (let i = 0; i < s.length - 4; i++) {
    /*
     * Inner loop: iterates through possible ending positions of substrings.
     * The minimum length of a substring is 4 characters.
     */
    for (
      let j = i + 4;
      j < s.length + 1;
      j++
    ) {
      /*
       * A debug comment that was originally present.
       * It has been modified to be a multi-line comment.
       */
      // console.log() - this line was commented out in the original.
      // No actual logging happens here.

      if (
        Number(s.slice(i, j)) % 2019 === 0
      ) /* Checks if the numeric value of the sliced substring
                                                  is divisible by 2019. */
      {
        counter++; // Increments the counter if the condition is met.
      }
    }
  }

  console.log(counter); // Outputs the final count.
}
// Invokes the main function, reading input from /dev/stdin.
main(
  require('fs').readFileSync(
    '/dev/stdin',
    'utf8'
  )
);


/*
 * This auxiliary function is also part of the original code,
 * though not directly called by 'main' in this specific problem context.
 * It counts occurrences of a substring within a source string.
 */
function solve(
  src,
  str
) {
  let counter = 0; // Counts occurrences.
  let start = 0; // Starting index for the search.

  // Infinite loop, broken by a return statement.
  for (
    ;
    ;
  ) {
    let n = src.indexOf(str, start); // Finds the next occurrence.

    if (
      n < 0
    ) /*
           * If no more occurrences are found (indexOf returns -1),
           * return the current count.
           */
    {
      return counter;
    }

    if (
      n >= 0
    ) /*
           * If an occurrence is found (indexOf returns a non-negative index),
           * increment the counter and update the starting position for the next search.
           */
    {
      counter++;
      start = n + 1; // Move past the found occurrence.
    }
  }

  return counter; // This return statement is technically unreachable due to the previous 'return counter' inside the loop.
}