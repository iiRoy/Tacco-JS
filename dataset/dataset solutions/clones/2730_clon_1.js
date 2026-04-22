/*
 * This is a Type I clone generated from an original JavaScript snippet.
 * It demonstrates processing input for a specific calculation,
 * adhering strictly to the Type I cloning definition.
 *
 * All original identifiers, operators, and expressions are preserved exactly.
 * Only whitespace and comments have been altered or added to create
 * a visually distinct but functionally identical code fragment.
 */

// Define the main function that processes the input string.
function   main (  input  )
{

  // Split the input string by newline characters to get an array of arguments.
  const   args   =   input .   split (  '\n'  ) ;

  // The first line of input (args[0]) contains space-separated values.
  // We split this line by spaces to get individual components.
  const   tmp   =   args[  0  ] .   split (  ' '  ) ;

  // Parse the first component of the 'tmp' array as an integer for 'n'.
  // The '10' indicates base-10 parsing.
  const   n   =   parseInt (  tmp[  0  ] ,   10  ) ;

  // Parse the second component of the 'tmp' array as an integer for 'd'.
  // This 'd' likely represents a distance or a span value.
  const   d   =   parseInt (  tmp[  1  ] ,   10  ) ;

  // Perform the core calculation:
  // 1. Calculate the effective span: d * 2 + 1.
  // 2. Divide 'n' by this effective span.
  // 3. Use Math.ceil to round the result up to the nearest whole number.
  // 4. Print the final calculated value to the console.
  console .   log (  Math .   ceil (  n   /   (  d   *   2   +   1  )  )  ) ;
}


// This line reads the input from standard input (/dev/stdin)
// using Node.js's 'fs' module. The input is read as a UTF-8 string.
// The read string is then passed to the 'main' function for processing.
main (  require (  'fs'  ) .   readFileSync (  '/dev/stdin' ,   'utf8'  )  ) ;