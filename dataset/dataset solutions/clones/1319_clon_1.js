/*
 * This JavaScript program takes two lines of input.
 * It checks if the second line is a substring of the first line,
 * after the first line has been concatenated with itself (doubled).
 *
 * The program reads input from standard input (e.g., /dev/stdin)
 * and prints "Yes" or "No" to the console.
 */

function  main  (  input  )
  {
  // Split the entire input string into an array of individual lines.
  let  lines  =  input  .  split  (  "\n"  )  ;

  // Create a new string by concatenating the first line with itself.
  // For example, if lines[0] is "abc", str becomes "abcabc".
  let  str  =  lines  [  0  ]  +  lines  [  0  ]  ;


  // Check if the second line (lines[1]) exists as a substring within 'str'.
  // indexOf returns -1 if the substring is not found.
  if  (  str  .  indexOf  (  lines  [  1  ]  )  !==  -1  )
    {
        console  .  log  (  "Yes"  )  ;  // Output "Yes" if the substring is found.
    }
  else
    {
        console  .  log  (  "No"  )  ;   // Output "No" if the substring is not found.
    }

  }  // End of the main function definition.


// Execute the main function.
// It reads the entire content of standard input as a UTF-8 string.
main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf-8"  )  )  ;