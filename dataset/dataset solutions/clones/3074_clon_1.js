/*
 * This JavaScript code implements a specific algorithm.
 * It's an alternative approach to solve the problem.
 * File generated on: 2023-10-27
 */

'use strict'; // Enforce strict mode for better error handling and cleaner code.

function   main  (  input  )   {
  // First, preprocess the raw input string.
  input = input.trim().split('\n') ;

  // Extract the counts from the first line of the input.
  const   counts   =   input.shift() .split(' ') ;

  // Process the remaining input lines, splitting each into an array of strings.
  input = input.map(  val  =>   val.split(' ')  ) ;

  let   result   =   [ ] ; // Initialize an empty array to store computed results.

  // Sort items within each sub-array in descending numerical order.
  // Note: The original problem context implies these are numbers.
  input.map(  items  =>   items.sort(  (a,   b)   =>   Number(b)   -   Number(a)  )  ) ;


  // Begin the triple-nested loop to generate combinations.
  // The loop iterates based on the 'counts' extracted earlier.
  for   (  let   i   =   0  ;   i   <   counts[0]  ;   i++  )   {
    for   (  let   j   =   0  ;   j   <   counts[1]  ;   j++  )   {
      for   (  let   k   =   0  ;   k   <   counts[2]  ;   k++  )   {
        // Check a specific condition involving the loop indices.
        // This condition acts as an optimization or constraint.
        if   (  (i + 1)   *   (j + 1)   *   (k + 1)   <=   3000  )   {
          // If the condition is met, calculate the sum of corresponding elements
          // from the processed input arrays and add it to the result array.
          result.push(  Number(input[0][i])   +   Number(input[1][j])   +   Number(input[2][k])  ) ;
        }   else   {
          // If the condition is not met, break out of the innermost loop.
          // This assumes subsequent 'k' values will also fail the condition due to monotonicity.
          break ;
        }
      } // End of innermost 'k' loop.
    } // End of middle 'j' loop.
  } // End of outermost 'i' loop.

  // After generating all possible sums, sort the 'result' array in descending order.
  // Then, take only the top 'counts[3]' elements.
  result = result.sort(  (a,   b)   =>   b   -   a  ) .slice(  0,   counts[3]  ) ;

  // Finally, print the selected results, each on a new line.
  console.log(  result.join('\n')  ) ;
} // End of the main function definition.


// Call the main function with input read from standard input.
// This is a common pattern for competitive programming environments.
main(  require('fs') .readFileSync(  '/dev/stdin',   'utf8'  )  ) ;