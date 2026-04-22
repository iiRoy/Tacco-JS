/*
 * This JavaScript file provides functionality to determine if a given string
 * and its first half are palindromes. It includes helper functions for
 * string reversal and palindrome checking.
 *
 * The script reads input from standard input, processes it, and prints
 * "Yes" or "No" to standard output.
 */


// Function definition: reversStr
// Purpose: To create a reversed version of the input string.
function   reversStr (   s   )
{
  // Initialize a mutable string variable to hold the reversed characters.
  var   rs   =   "" ;


  // Loop through the input string 's' from its end to its beginning.
  // 'n' stores the length of the string 's' for efficient access.
  for   (   var   i   =   0 ,   n   =   s . length ;   i   <   n ;   i ++   )
  {
    // Append the character from 's' at the calculated reverse index
    // to the 'rs' string.
    rs   +=   s [   n   -   i   -   1   ] ;
  }


  // Return the completely reversed string.
  return   rs ;
}


// Function definition: check
// Purpose: To verify if a string is a palindrome.
function   check (   s   )
{
  // A string is a palindrome if it reads the same forwards and backwards.
  // This is checked by comparing the original string with its reversed form.
  return   s   ===   reversStr (   s   ) ;
}


// Main program function: main
// Purpose: Orchestrates the palindrome checks based on user input.
function   main (   input   )
{
  // Clean the input string by removing leading/trailing whitespace.
  var   s   =   input . trim (   ) ;


  // Perform a compound logical check and print the result.
  // The condition is true if:
  // 1. The full string 's' is a palindrome AND
  // 2. The first half of 's' (integer division for length) is also a palindrome.
  // The | 0 (bitwise OR with 0) ensures the result of division is an integer.
  console . log (
    check (   s   )   &&   check (   s . slice (   0 ,   s . length   /   2   |   0   )   )   ?   "Yes"   :   "No"
  ) ;
}


// Entry point for the script execution.
// It reads the entire content of '/dev/stdin' as UTF-8
// and passes it to the 'main' function.
main (   require (   'fs'   ) . readFileSync (   '/dev/stdin' ,   'utf8'   )   ) ;