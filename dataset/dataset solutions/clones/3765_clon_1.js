/*
 * This JavaScript file contains a Type I clone of an original program.
 * The purpose of this clone is to demonstrate structural and logical identity
 * while introducing significant variations in whitespace and comments.
 * All core identifiers, keywords, operators, and expressions are strictly preserved.
 */


// Declare the main function responsible for processing the input.
function   Main  (  input  )
{
  // Initialize an empty array to hold parsed input parts.
  var   arr   =   [  ]  ;


  // Split the provided input string by a space character.
  // The resulting parts are assigned to the 'arr' array.
  arr   =   input  .  split  (  ' '  )  ;

  // Extract the first element from the array, converting it to a string.
  var   a   =   arr  [  0  ]  ;

  // Extract the second element from the array, also as a string.
  var   b   =   arr  [  1  ]  ;

  // Calculate the difference between 'b' and 'a'.
  // JavaScript's type coercion will attempt to convert 'a' and 'b' to numbers.
  var   diff   =   b   -   a  ;

  // Initialize a variable named 'result' with the value 1.
  var   result   =   1  ;


  // Commence a for loop.
  // The 'diff' variable is re-purposed here as the loop counter, starting from 0.
  // The loop continues as long as 'diff' is less than or equal to 999.
  // 'diff' is incremented by 1 in each iteration.
  for  (  diff   =   0  ;   diff   <=   999  ;   diff  ++  )
  {
    // This line is crucial: `result =+ diff` is equivalent to `result = +diff;`.
    // It means 'result' is assigned the numeric value of 'diff' in each iteration,
    // effectively overwriting the previous value of 'result'.
    // The initial `result = 1` is therefore relevant only for the first line.
    result   =+   diff  ;
  }


  // Output the final calculation to the console.
  // After the loop, 'result' will hold the value 999.
  // So, this effectively prints `999 - b` (where 'b' is coerced to a number).
  console  .  log  (  result   -   b  )  ;

}


// Execute the Main function.
// It reads the entire content of standard input (`/dev/stdin`) as a UTF-8 string.
// This string is then passed as the 'input' argument to the Main function.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,   "utf8"  )  )  ;