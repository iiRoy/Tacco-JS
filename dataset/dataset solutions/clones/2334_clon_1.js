/*
 * This file contains the primary logic for processing a numerical input.
 * It calculates a specific answer based on a series of operations.
 */
function   Main (  input  )
{
  // Initialize 'n' by converting the input to an integer.
  var   n   =   Math  .  floor  (  input  )  ;

  // Declare an array to store intermediate values.
  var   ansArray   =   [  ]  ;
  // Initialize the final answer variable.
  var   ans   =   0  ;

  // Populate ansArray with 'n' and subsequent values, decrementing 'n' by 2 each time.
  while   (  n   >   0  )
  {
    ansArray  .  push  (  n  )  ;  // Add current 'n' to the array.
    n   -=   2  ;                  // Decrement 'n' by two.
  } // End of while loop.


  // Create an object to store counts of elements.
  var   counts   =   {  }  ;

  /*
   * Iterate through the 'ansArray' to count occurrences of each number.
   * The 'counts' object will store these frequencies.
   */
  for   (  var   i   =   0  ;   i   <   ansArray  .  length  ;   i  ++  )
  {
    var   key   =   ansArray  [  i  ]  ;  // Get the current number.
    // Increment count if key exists, otherwise initialize to 1.
    counts  [  key  ]   =   counts  [  key  ]   ?   counts  [  key  ]   +   1   :   1  ;
  } // End of first for loop.


  // Second pass: Calculate the final answer 'ans' based on specific conditions.
  for   (  var   i   =   0  ;   i   <   ansArray  .  length  ;   i  ++  )
  {
    // Check a condition related to the count of the number 5.
    if   (  counts  [  5  ]   %   1   ===   1  )
    {
      // Adjust 'ans' based on the count of 5.
      ans   +=   counts  [  5  ]   -   1  ;
    }
    // Check if the current array element is a multiple of 10.
    else   if   (  ansArray  [  i  ]   %   10   ===   0  )
    {
      // Increment 'ans' if the condition is met.
      ans  ++  ;
    }
  } // End of second for loop.

  // Output the final calculated answer to the console.
  console  .  log  (  ans  )  ;
} // End of Main function definition.


// This line calls the Main function with input read from standard input.
// It uses Node.js 'fs' module to read the file.
Main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,   'utf8'  )  )  ;