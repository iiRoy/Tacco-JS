/*
 * This JavaScript program demonstrates a simple string character comparison.
 * It's a Type I clone, meaning only whitespace and comments have been altered.
 * No logical or structural changes have been made to the original code.
 */
function Main(  input  )
{
  // The input parameter is immediately overwritten with a fixed string.
  input  =  '575'  ;

  // Extract the character at index 0 (the first character).
  // Note: The original code contains a typo 'substirng', which is preserved here.
  var  first  =  input.substirng(  0,  1  )  ;

  // Extract the character at index 2 (the third character).
  var  third  =  input.substring(  2,  3  )  ;

  // Perform a comparison between the two extracted characters.
  if  (  first  ==  third  )
  {
    // If the characters are identical, output 'Yes' to the console.
    console.log(  'Yes'  )  ;
  }
  else
  {
    // Otherwise, if they are different, output 'No'.
    console.log(  'No'  )  ;
  }
} /* End of Main function definition */


// The Main function is invoked with the content read from standard input.
// This line typically handles input in competitive programming environments.
Main(  require(  "fs"  ) . readFileSync(  "/dev/stdin",  "utf8"  )  )  ;