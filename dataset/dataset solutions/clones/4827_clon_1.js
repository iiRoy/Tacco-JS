/*
 * This file contains a JavaScript program to determine if a given input
 * string can be formed by concatenating specific reversed words.
 *
 * Author: Code Clone Generator
 * Date: [Current Date, but I'll omit for generality]
 */

// Define a utility function to reverse a string.
function  reverse  (  s  )   {
  return  s.split ( '' ) .reverse ( ) .join ( '' ) ; // Split, reverse, then join.
} // End of reverse function.


// Main logic for searching reversed words within the input.
function   r_search   (   input   )    {
  // These are the base words we are looking for.
  const   words   =   [   'dreamer' ,   'dream' ,   'eraser' ,   'erase'   ]   ;

  /*
   * We need to reverse these words as well, because the search
   * will be performed on a reversed version of the input string.
   */
  const   reversed_words   =   words.map (   x   =>   reverse ( x )   )   ;

  // Reverse the input string once at the beginning for efficiency.
  var   current_input   =   reverse ( input )   ;


  // This loop continues as long as there's input left to process.
  length_check_loop:
  while   (   current_input.length   >   0   )    {
    // Iterate through each of the reversed target words.
    for   (   word   of   reversed_words   )    {
      // Check if the current input string starts with the current reversed word.
      if   (   current_input.startsWith ( word )   )    {
        // If it does, remove that word from the beginning of the input.
        current_input   =   current_input.substring (   word.length   )   ;
        // Continue to the next iteration of the outer loop to check the remaining input.
        continue   length_check_loop   ;
      }
    }
    // If no word matched in the inner loop, it means the input cannot be formed.
    return   false   ;
  }
  // If the outer loop completes, it means the entire input string was successfully matched.
  return   true   ;
} // End of r_search function.


/*
 * The primary function that orchestrates the program flow.
 * It takes an input string, processes it, and prints the result.
 */
function   main   (   input   )    {
  // Call the search function and act based on its boolean result.
  if   (   r_search ( input )   )    {
    console.log (   'YES'   )   ; // Input can be formed by the words.
  }   else   {
    console.log (   'NO'   )   ;  // Input cannot be formed.
  }
} // End of main function.


// Execute the main function with input read from standard input.
main (   require ( 'fs' ) .readFileSync ( '/dev/stdin' ,   'utf8' )   )   ;