/*
 * This is a JavaScript file demonstrating a simple conditional logic.
 * It reads input, processes it, and prints a message based on a comparison.
 * This version is a Type I clone, meaning only whitespace and comments are altered.
 */

// Define the main function that processes the input string received.
function Main ( input )
{
  // Split the input string by newline characters to create an array of lines.
  // The 'inputs' variable is implicitly global due to lack of 'var', 'let', or 'const'.
  inputs = input . split ( '\n' ) ;

  /*
   * The original code contained a commented-out console.log statement here.
   * For this Type I clone, we've decided to remove that specific comment
   * to demonstrate a change in comments.
   * // console.log(inputs); // This was the original comment.
   */


  // Evaluate a compound condition using elements from the 'inputs' array.
  // The condition checks if inputs[0] is less than inputs[5] AND inputs[4] is also less than inputs[5].
  if ( inputs [ 0 ] < inputs [ 5 ] && inputs [ 4 ] < inputs [ 5 ] )
  {
    // If the combined condition evaluates to true, a positive message is printed.
    console . log ( 'Yay!' ) ;
  }
  else
  {
    // Otherwise, if the condition is false, a negative message is displayed.
    console . log ( ':(' ) ;
  } // End of the if-else block.
} // End of the Main function definition.


// This line reads data from standard input asynchronously using Node.js's 'fs' module.
// The read data is then passed as an argument to the 'Main' function for processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

/*
 * This concludes the cloned JavaScript code.
 * Every character that is not whitespace or part of a comment
 * remains exactly as it was in the original source code.
 */