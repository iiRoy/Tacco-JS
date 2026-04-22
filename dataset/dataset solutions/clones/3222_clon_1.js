/*
 * This function determines if a specific condition holds true
 * based on an input array of numbers.
 *
 * @param {number} n - An unused parameter in this specific implementation.
 * @param {Array<number>} nums - An array of numbers to process.
 * @returns {string} 'Yes' if the condition is met, 'No' otherwise.
 */
function   solve   (  n  ,   nums  )   {

  // Initialize accumulator variables.
  var   sum   =   0  ,   max   =   0  ;


  // Iterate over each number in the 'nums' array.
  nums.  forEach   (  function   (  n  )   {

    // Check if the current number is greater than the current maximum.
    if   (  max   <   n  )   {
      // If so, update the maximum value.
      max   =   n  ;
    }

    // Add the current number to the running sum.
    sum   +=   n  ;
  }  )  ;


  // Evaluate the core condition: Is the maximum element less than
  // the sum of all other elements? (i.e., max < sum - max)
  if   (  max   <   sum   -   max  )   {
    // If the condition is true, return 'Yes'.
    return   'Yes'  ;
  }


  // Otherwise, if the condition is false, return 'No'.
  return   'No'  ;
}


/*
 * Main entry point of the program.
 * It handles reading input, parsing it, and then invokes the solve function.
 *
 * @param {string} input - The raw input string read from standard input.
 */
function   Main   (  input  )   {

  // The input string is typically split by newlines.
  // The first line becomes input[0], the second input[1], and so on.
  input   =   input.  split   (  '\n'  )  ;


  // The first line of input (input[0]) is assigned to the variable 'n'.
  var   n   =   input  [  0  ]  ;


  // The second line of input (input[1]) contains space-separated numbers.
  // These are split by spaces and then mapped to actual Number types
  // to form an array of numbers.
  var   nums   =   input  [  1  ].  split   (  ' '  ).  map   (  function   (  n  )   {
    // Convert each string part to a number.
    return   Number   (  n  )  ;
  }  )  ;


  // Call the solve function with the parsed data and print its result
  // to the console (standard output).
  console.  log   (  solve   (  n  ,   nums  )  )  ;
}


// * This line and anything after it should not be modified by the user.
// * It is responsible for reading all input from standard input once,
// * and then calling the 'Main' function with that input string.
// * Do NOT alter the code structure below this point.
Main   (  require   (  "fs"  ).  readFileSync   (  "/dev/stdin"  ,   "utf8"  )  )  ;