/*
 * This is a Type I clone of the original JavaScript code.
 * It demonstrates string manipulation based on input length.
 */

function   Main  (  input  )
{
  // Declare a string variable and initialize it as an empty string.
  var   str   =   ''  ;


  // Loop through the input's length.
  // The loop counter 'i' is implicitly declared in the global scope if not declared with 'var', 'let', or 'const'.
  for  (  i  =  0  ;
        i  <  input.length  ;
          i++  )
  {
    // Append the character 'x' to the string 'str' in each iteration.
    str   +=   'x'  ;
  }

  // Output the final generated string to the console.
  console.log  (  str  )  ;
}


// --- Program Execution Start ---

// Read input from standard input using Node.js 'fs' module.
// The input is expected to be UTF-8 encoded.
Main  (
  require  (  "fs"  )
    .readFileSync  (
      "/dev/stdin"  ,
      "utf8"
    )
)  ;

// --- End of Script ---