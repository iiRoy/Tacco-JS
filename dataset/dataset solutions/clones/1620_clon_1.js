/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are kept identical.
 * Only whitespace and comments have been altered extensively
 * to create a visually distinct but functionally equivalent file.
 */


// Define the main application function. This function processes the input.
function  main  (  input  )
{
  // Start of the main logic block.

  // Check if the provided input value meets a specific threshold.
  if  (  input   >=   30  )
  {
    // If the input is greater than or equal to 30,
    // then we execute the code within this block.
    console.log (  'Yes'  ) ; // Output 'Yes' to the console.
  }
  else
  {
    // Otherwise, if the input is less than 30,
    // execute the code within this 'else' block.
    console.log (  'No'  ) ;    /* Output 'No' to the console. */
  } // End of the conditional 'if-else' statement.

} // End of the 'main' function definition.


/*
 * This section handles the program's entry point.
 * It reads data from standard input and passes it to the 'main' function.
 * The 'fs' module is utilized for file system operations, specifically reading.
 */
main (  require (  'fs'  ) . readFileSync (  '/dev/stdin'  ,  'utf8'  )  ) ; // Call the main function with the content from stdin.