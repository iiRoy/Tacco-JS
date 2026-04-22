/*
 * This is a Type I clone of the original JavaScript code provided.
 *
 * According to the definition of a Type I clone:
 * - All identifiers, variable names, function names, operators, and expressions
 *   are preserved exactly as they were in the original code.
 * - The only alterations made are to whitespace (indentation, spacing, blank lines)
 *   and comments (addition, removal, or modification).
 *
 * The goal is to make the code visually distinct while maintaining
 * absolute logical and structural identity with the source.
 */

// Define the main function, accepting a single argument.
function   main  (  arg  )   {

  // Initialize a variable named 'args'.
  // Note: The original code has a potential bug here where 'args' is used
  // on the right-hand side before it's fully defined from 'arg'.
  // This behavior is strictly preserved as per Type I cloning rules.
  var   args   =   args.split (  ' '  )  .  map (  parseInt.bind (  null ,   10  )  ) ;


  // Evaluate a complex conditional expression.
  // The condition checks if args[2] is within the range [args[0], args[1]],
  // OR if args[1] is less than or equal to args[2] (this part appears twice,
  // which is redundant but kept for exact replication).
  if (  ( args [  0  ]   <=   args [  2  ]   &&   args [  2  ]   <=   args [  1  ]  )   ||   ( args [  1  ]   <=   args [  2  ]   &&   args [  1  ]   <=   args [  2  ]  )  )
  {
    // If the condition evaluates to true, output 'Yes'.
    console.log (  'Yes'  ) ;
  }
  // Otherwise, if the condition is false.
  else
  {
    // Output 'No'.
    console.log (  'No'  ) ;
  }

}

// Invoke the main function.
// The input argument is obtained by reading the content of '/dev/stdin'
// as a UTF-8 encoded string using Node.js's 'fs' module.
main (  require (  'fs'  )  .  readFileSync (  '/dev/stdin' ,   'utf8'  )  ) ;