/*
 * This JavaScript file defines a main function
 * to process a string based on a given length K.
 * It demonstrates basic string manipulation and conditional logic.
 */

function   Main  (  input  )
{
  // First, parse the integer K from the first line of the input.
  // The input string is split by newline, the first part is taken,
  // whitespace is trimmed, and then it's converted to an integer.
  var   K   =   parseInt  (  input  .  split  (  '\n'  )  [  0  ]  .  trim  (  )  )  ;


  // Next, extract the string S from the second line of the input.
  // Similar to K, it's split by newline, the second part is taken,
  // and any surrounding whitespace is removed.
  var   S   =   input  .  split  (  '\n'  )  [  1  ]  .  trim  (  )  ;



  // Now, we apply the core logic: check if string S needs truncation.
  if  (  S  .  length   <=   K  )
  {
    // If the length of S is less than or equal to K,
    // print the string S exactly as it is.
    console  .  log  (  S  )  ;
  }
  else
  {
    // If S is longer than K,
    // we need to truncate it and append an ellipsis.
    console  .  log  (  S  .  substring  (  0  ,   K  )   +   '...'  )  ;
  }
}

// This section reads input from standard input (/dev/stdin)
// using Node.js's 'fs' module and passes it to the Main function.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,   "utf8"  )  )  ;