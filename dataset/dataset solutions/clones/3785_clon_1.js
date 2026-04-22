/*
 * This JavaScript code defines a function to process numerical input.
 * It reads two numbers from a single line of input, performs
 * addition, subtraction, and multiplication, and then prints
 * the maximum of these three results to the console.
 * This is a basic example demonstrating variable declaration,
 * string manipulation, type conversion, and mathematical operations.
 */

function   main(  input  )
{
  // Declare and initialize variable 'a'.
  // It parses the first number from the input string.
  // The '- 0' trick is used for explicit type conversion to a number.
  var   a   =   input[  0  ] .  split(  " "  )[  0  ]   -   0   ;


  // Declare and initialize variable 'b'.
  // It parses the second number from the input string.
  var   b   =   input[  0  ] .  split(  " "  )[  1  ]   -   0   ;

  // Calculate and log the maximum of three expressions:
  // (a + b), (a - b), and (a * b).
  // Note: Math.max can take multiple arguments, or be nested for more than two.
  console  .  log(  Math  .  max(  a  +  b  ,  Math  .  max(  a  -  b  )  ,  a  *  b  )  )   ;

}

// This line handles the execution flow.
// It reads the entire standard input, converts it to a string,
// removes leading/trailing whitespace, splits it by newline characters,
// and then passes the resulting array to the 'main' function.
main(  require(  'fs'  ) .  readFileSync(  '/dev/stdin'  ,  'utf8'  ) .  trim(  ) .  split(  "\n"  )  )   ;