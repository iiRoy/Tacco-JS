/*
 * This file contains a Type I clone of a JavaScript program.
 * A Type I clone means the code is exactly equal to the original,
 * except for variations in whitespace and comments.
 *
 * This particular script reads a numerical input from standard input,
 * calculates its square, and then prints the result to the console.
 */


function  main  (  input  )
{
  // The 'main' function takes one argument, 'input'.
  // This 'input' is expected to be a number (or a string that can be coerced to a number).

  // It then calculates the square of the input.
  // The multiplication operator '*' is used for this purpose.
  // console.log() is used to output the result to standard output.
  console  .  log  (  input  *  input  )  ;

} // End of the main function definition.


// The following block of code is responsible for the program's execution flow.
// It first reads the necessary input and then calls the main function.

main  (
  // The 'require' function is used to import the built-in 'fs' (file system) module.
  require  (  "fs"  )
    // The 'readFileSync' method of the 'fs' module is used to read the content of a file synchronously.
    // In this case, it reads from '/dev/stdin', which represents standard input on POSIX systems.
    // The 'utf8' encoding is specified to correctly interpret the input string.
    .  readFileSync  (
      "  /dev/stdin  "  ,
      "  utf8  "
    )
)  ;  // The main function is invoked with the processed input.


/*
 * This concludes the Type I cloned JavaScript code.
 * Notice the extensive use of additional whitespace and comments
 * while maintaining the exact sequence of tokens and identifiers.
 */