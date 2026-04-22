/*
 * This is a JavaScript function designed to process input.
 * It reads lines, stores unique ones (excluding the first line),
 * and then prints the count of unique lines.
 */
function main(   input   )
{
  // First, we'll process the raw input string.
  // Trim any leading/trailing whitespace from the entire input.
  const arr   =    input .  trim ( ) .  split (  '\n'  ) ;

  // Create a new Set to store unique elements.
  // We slice the array starting from the second element (index 1)
  // to exclude what might be a header or count.
  const   set   =   new   Set (  arr .  slice (  1  )  )  ;

  // Finally, print the number of unique elements found in the set.
  console .  log (  set .  size  ) ;
} // End of main function

// This part of the script is responsible for reading input
// and then calling the main function with that input.
main (  require (  'fs'  ) .  readFileSync (  '/dev/stdin'  ,  'utf8'  )  ) ;
// The script finishes after the main function executes.