function   main   (   input   )   { 

  // This function takes an array of strings as input.
  // It expects the first element of the array (input[0]) to be a string
  // containing four space-separated numbers.
  // The purpose is to compare the sum of the first two numbers
  // with the sum of the last two numbers and print a result.


  // Extract the first number from the input string.
  // `input[0]` gets the first line of input.
  // `.split(" ")` divides the string into an array of substrings using space as a delimiter.
  // `[0]` selects the first substring (which is the first number).
  // `-0` is a common JavaScript idiom to convert a string to a number.
  var   a   =   input  [  0  ]  .  split  (  " "  )  [  0  ]  -  0  ;


  // Extract the second number from the same input string.
  // This follows the same logic as extracting 'a', but takes the second element.
  var   b   =   input  [  0  ]  .  split  (  " "  )  [  1  ]  -  0  ;


  // Extract the third number.
  // This is the first number for the 'right' side of the comparison.
  var   c   =   input  [  0  ]  .  split  (  " "  )  [  2  ]  -  0  ;


  // Extract the fourth number.
  // This is the second number for the 'right' side of the comparison.
  var   d   =   input  [  0  ]  .  split  (  " "  )  [  3  ]  -  0  ;


  // Calculate the sum of the first two numbers.
  // This sum will represent the 'left' value for our comparison.
  var   l   =   a   +   b   ;


  // Calculate the sum of the last two numbers.
  // This sum will represent the 'right' value for our comparison.
  var   r   =   c   +   d   ;


  // Compare the 'left' sum (l) and the 'right' sum (r).
  // The `console.log` statement uses a ternary operator for concise conditional output.
  // If 'l' is strictly equal to 'r', it prints "Balanced".
  // Otherwise, it checks if 'l' is greater than 'r'. If true, it prints "Left".
  // If neither of the above conditions is met (meaning 'l' must be less than 'r'), it prints "Right".
  console  .  log  (  l   ==   r   ?   "Balanced"   :   (   l   >   r   ?   "Left"   :   "Right"   )  )  ;


 }


 // This is the main execution entry point for the script.
 // It handles reading input from the standard input stream (stdin)
 // and then calls the `main` function with the processed input.
 //
 // `require('fs')` imports the Node.js file system module.
 // `.readFileSync('/dev/stdin', 'utf8')` reads the entire content of the standard input
 //   file descriptor (`/dev/stdin`) as a string, using UTF-8 encoding.
 // `.trim()` removes any leading or trailing whitespace from the read string,
 //   which is useful for handling potential newline characters at the end of input.
 // `.split("\n")` splits the cleaned string into an array of strings,
 //   where each element corresponds to a line from the input.
 // This array is then passed as the `input` argument to our `main` function.
 main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,  'utf8'  )  .  trim  (  )  .  split  (  "\n"  )  )  ;