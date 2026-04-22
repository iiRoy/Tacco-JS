"use strict" ; /* Enforce strict mode for better error handling */


// Main function definition to process input
function   main ( input )
{
  // Trim whitespace from the beginning and end of the input string
  input = input . trim ( ) ; // Remove leading/trailing whitespace

  /* Parse the input string into an integer */
  let N = parseInt ( input ) ;


  // Evaluate N against various ranges and print corresponding output
  // This section determines a category based on the input number N
  if  ( N >= 400  &&  N <= 599 )    console . log ( "8" ) ; // First category
  if  ( N >= 600  &&  N <= 799 )    console . log ( "7" ) ; // Second category
  if  ( N >= 800  &&  N <= 999 )    console . log ( "6" ) ; // Third category
  if  ( N >= 1000 && N <= 1199 )    console . log ( "5" ) ; // Fourth category
  if  ( N >= 1200 && N <= 1399 )    console . log ( "4" ) ; // Fifth category
  if  ( N >= 1400 && N <= 1599 )    console . log ( "3" ) ; // Sixth category
  if  ( N >= 1600 && N <= 1799 )    console . log ( "2" ) ; // Seventh category
  if  ( N >= 1800 && N <= 1999 )    console . log ( "1" ) ; // Eighth category
} // End of main function


// Helper function to sort an array of numbers
function   numberSort ( array )
{
  /* Use the custom comparison function 'f' for sorting */
  array . sort ( f ) ;
  return array ; // Return the sorted array
}


// Anonymous function assigned to variable 'f' for number comparison
var f = function ( a , b )
{
  // Returns a negative value if a < b, zero if a == b, positive if a > b
  return a - b ; // Standard comparison for ascending numerical sort
} ;


// Read input from stdin, convert to UTF-8, and pass to the main function
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf-8" ) ) ; // Execute the program entry point