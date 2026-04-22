/*
 * This is a Type I clone of the provided JavaScript code.
 *
 * According to the definition:
 * "Code fragments are exactly equal, except for possible variations
 * in whitespace and comments."
 *
 * This means:
 * - Every identifier, variable name, function name, operator, and expression
 *   must remain completely unchanged.
 * - The only permitted changes are whitespace (indentation, spacing, blank lines)
 *   and comments (add, remove, or modify them).
 *
 * This version extensively modifies whitespace and adds numerous comments
 * to appear visually distinct, while preserving the exact logical structure
 * and every non-whitespace/non-comment character sequence.
 */


function     main     (     input     )
{
  // Declare a constant 's' and initialize it by trimming the 'input' string.
  const     s     =     input.trim     ()

  // Initialize an array to count the occurrences of 'a', 'b', and 'c'.
  // The reduce method iterates over each character of the string 's'.
  let     array     =     s.split     ('')
    .reduce     (
      (     a     ,     c     )     =>     {
        // Calculate the index based on the character's ASCII value minus 'a's ASCII value.
        // For 'a' -> index 0, for 'b' -> index 1, for 'c' -> index 2.
        a     [     c.charCodeAt     ()     -     'a'.charCodeAt     ()     ]++
        return     a     // Return the updated accumulator array.
      }     ,
      [     0     ,     0     ,     0     ]     // Initial accumulator array with three zeros.
    )

  // Determine if the difference between the maximum and minimum character counts is 2 or more.
  if     (     Math.max     (     ...array     )     -     Math.min     (     ...array     )     >=     2     )
  {
    // If the condition is true, print 'NO' to the console.
    console.log     (     'NO'     )
  }     else     {
    // Otherwise (if the difference is less than 2), print 'YES' to the console.
    console.log     (     'YES'     )
  }

} // End of the main function definition.


// This line executes the 'main' function.
// It reads the input from '/dev/stdin' as a UTF-8 string using Node.js's 'fs' module.
main     (     require     (     'fs'     )
  .readFileSync     (     '/dev/stdin'     ,     'utf8'     )
)

/*
 * End of the Type I cloned JavaScript code.
 * All original identifiers, operators, and expressions are preserved.
 */