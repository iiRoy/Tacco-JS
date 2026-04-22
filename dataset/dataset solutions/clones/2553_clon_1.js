function     Main(   input   ) {
  // This function serves as the primary entry point for processing the input data.

  input     =     input.split(  "\n"  )   ; /* Split the input string by newline characters
                                             to get an array of lines. */

  inputStr    =    input[0]    .split(   " "   )    ; // The first line is further split by spaces.

  var    S    =    inputStr[0]   ; // Extract the first part of the first line as string S.

  var    ans    =    "Yes"    ; // Initialize the answer variable to "Yes".

  // A previously used debug statement for string length, now commented out.
  // console.log( S.length );

  // Initiate the core logic for string validation.
  // This section checks each character of the input string 'S'.
  for (  var   i = 0  ;  i < S.length  ;  i++   ) {

    if  (  (i + 1) % 2 === 0  )  {
      // For characters at an even position (1-indexed)
      // An even position means i is odd (0-indexed).
      var    str    =    "LUD"    ; // Allowed characters for even positions.
    }
    else
    {
      // For characters at an odd position (1-indexed)
      // An odd position means i is even (0-indexed).
      var    str    =    "RUD"    ; // Allowed characters for odd positions.
    }

    // Another debug statement, previously used to check character and its presence in 'str'.
    // console.log( str, S.substr( i, 1 ), str.indexOf( S.substr( i, 1 ) ) );

    // Check if the current character from S is NOT among the allowed characters for its position.
    if  (  str.indexOf(  S.substr(  i,  1  )  )  ===  -1  )  {
      ans    =    "No"    ; // If an invalid character is found, set answer to "No".
      break    ; // No need to check further, so exit the loop immediately.
    }
  }

  // Output the final determined answer.
  console.log(   ans   )   ;
}

/*
 * This part executes the Main function with input read from standard input.
 * It uses Node.js 'fs' module to read the file synchronously.
 */
Main(   require(   "fs"   )   .readFileSync(   "/dev/stdin"   ,   "utf8"   )   )   ;