/*
 * This is a JavaScript file
 * It calculates a path based on input coordinates.
 * The path generation algorithm is hardcoded based on specific rules.
 */
'use strict'; // Enforce strict mode for cleaner code and to catch common coding errors.

// The main function that processes the input and generates the path string.
function    main   (  input  )
{
    // Process the input string:
    // 1. Trim leading/trailing whitespace.
    // 2. Split the string by space into an array of strings.
    // 3. Map each string in the array to its number representation.
    input  =  input
               .trim ( ) // Removes any extraneous whitespace from the start and end of the string.
               .split ( ' ' ) // Breaks the string into an array of substrings, using a space as the delimiter.
               .map ( Number ) ; // Converts each element of the array from a string to a number.

  // Extracting coordinates from the processed input array.
  const   sx   =   input[0] ; // Starting X coordinate.
  const   sy   =   input[1] ; // Starting Y coordinate.
  const   tx   =   input[2] ; // Target X coordinate.
  const   ty   =   input[3] ; // Target Y coordinate.

  // Calculate the differences between target and starting coordinates.
  // These represent the total displacement needed in X and Y directions.
  const   dx   =   tx   -   sx ; // The horizontal displacement required.
  const   dy   =   ty   -   sy ; // The vertical displacement required.

  let   ans   =   '' ; // Initialize an empty string to build the path.

  // First part of the path: Move Up to reach the target Y-coordinate.
  for   ( let   i   =   0 ;   i   <=   dy ;   i++   )
  {
    ans   +=   'U' ; // Append 'U' for an 'Up' movement.
  }

  // First part of the path: Move Right to reach the target X-coordinate.
  for   ( let   i   =   0 ;   i   <=   dx ;   i++   )
  {
    ans   +=   'R' ; // Append 'R' for a 'Right' movement.
  }


  // Second part of the path: Move Down from the target Y-coordinate back to the starting Y-coordinate.
  for   ( let   i   =   0 ;   i   <=   dy ;   i++   )
  {
    ans   +=   'D' ; // Append 'D' for a 'Down' movement.
  }

  // Second part of the path: Move Left from the target X-coordinate back to the starting X-coordinate.
  for   ( let   i   =   0 ;   i   <=   dx ;   i++   )
  {
    ans   +=   'L' ; // Append 'L' for a 'Left' movement.
  }

  // Additional specific movements to form a more complex path.
  ans   +=   'L' ; // One extra step to the Left.

  // Third part of the path: Move Up one step beyond the target Y-coordinate.
  for   ( let   i   =   0 ;   i   <=   dy   +   1 ;   i++   )
  {
    ans   +=   'U' ; // Append 'U'.
  }

  // Third part of the path: Move Right one step beyond the target X-coordinate.
  for   ( let   i   =   0 ;   i   <=   dx   +   1 ;   i++   )
  {
    ans   +=   'R' ; // Append 'R'.
  }

  // A specific sequence of movements.
  ans   +=   'DR' ; // Append 'D' (Down) then 'R' (Right).

  // Third part of the path: Move Down one step beyond the target Y-coordinate.
  for   ( let   i   =   0 ;   i   <=   dy   +   1 ;   i++   )
  {
    ans   +=   'D' ; // Append 'D'.
  }

  // Third part of the path: Move Left one step beyond the target X-coordinate.
  for   ( let   i   =   0 ;   i   <=   dx   +   1 ;   i++   )
  {
    ans   +=   'L' ; // Append 'L'.
  }

  ans   +=   'U' ; // Final step: an 'Up' movement.

  // Output the final generated path string to the console.
  console.log   (   ans   ) ;
}


// --- Program execution starts here ---
// This line reads input from standard input, decodes it as UTF-8,
// and then passes it to the `main` function for processing.
main   (   require   (   'fs'   ) // Import the 'fs' (file system) module.
                       .readFileSync   (   '/dev/stdin' ,   'utf8'   ) // Read the entire content of '/dev/stdin' as a string, using UTF-8 encoding.
       ) ;