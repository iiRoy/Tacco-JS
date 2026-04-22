/*
 * This JavaScript code snippet analyzes an input string.
 * Its purpose is to determine if the first character of the trimmed input
 * is a vowel (a, i, u, e, o) or a consonant.
 *
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 */

// Define the primary function for processing the input.
function   Main   ( input )
{
  // Step 1: Normalize the input string by removing leading and trailing whitespace.
  input   =   input.trim() ;

  // Step 2: Use a regular expression to check if the input starts with a vowel.
  // The `match` method returns an array if a match is found, otherwise null.
  var   mat   =   input.match ( "[aiueo]" ) ;

  // Step 3: Conditional logic based on the match result.
  if   ( mat )
  {
    // If 'mat' is not null (i.e., a vowel was found), output "vowel".
    console.log ( "vowel" ) ;
  }
  else
  {
    // Otherwise (if no vowel was found at the beginning), output "consonant".
    console.log ( "consonant" ) ;
  }
} // End of the Main function.


// This section handles reading input from the standard input stream
// and passing it to the Main function for processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// End of program execution.