/*
 * This JavaScript program defines a main function
 * to process a string input and output a different string.
 * It's a simple conditional logic example.
 */

function         Main       (   input   )
{
  // Declare a variable 's' to hold the input string.
  var        s         =     input    ;

  /*
   * This block checks if the input string 's'
   * is exactly equal to "ABC".
   */
  if    (    s    ==    "ABC"    )
  {
    // If the condition is true, print "ARC" to the console.
    console    .    log    (    "ARC"    )    ;
  }
  /*
   * Otherwise, if the first condition was false,
   * this block checks if 's' is exactly "ARC".
   */
  else
  if    (    s    ==    "ARC"    )
  {
    // If this second condition is true, print "ABC" to the console.
    console    .    log    (    "ABC"    )    ;
  }
  // The function doesn't return any value explicitly.
} // End of the Main function definition.


// This line reads input from standard input (/dev/stdin)
// using Node.js 'fs' module, decodes it as UTF-8,
// and then calls the Main function with that processed input.
Main    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    )    ;