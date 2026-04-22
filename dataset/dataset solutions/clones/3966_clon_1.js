"use strict"
; /* This directive enforces strict mode,
    * which helps catch common coding errors and
    * prevents unsafe actions. */


// The main function that orchestrates the program's logic.
function   main ( input )
{
  // First, process the raw input string.
  // It splits the input by newlines or spaces into an array of strings.
  input = input . split ( /\n|\s/ ) ;

  // Extract 'n' from the first element of the processed input array.
  // The '~~' operator is a fast way to convert a string to an integer.
  const   n   =   ~~input [ 0 ] ;

  // Extract 'm' from the element at index n + 1.
  const   m   =   ~~input [ n + 1 ] ;

  // Slice the input array to get the 'blue' words.
  // These are from index 1 up to (but not including) n + 1.
  const   blue   =   input . slice ( 1 , n + 1 ) ;

  // Slice the input array to get the 'red' words.
  // These start from index n + 2 to the end of the array.
  const   red   =   input . slice ( n + 2 ) ;


  // Initialize an empty object to store word counts.
  let   obj   =   new   Object ( ) ;

  // Iterate over the 'blue' words.
  // For each blue word, increment its count in the 'obj' object.
  // If the word is encountered for the first time, initialize its count to 1.
  for   ( let   i   in   blue )
  {
    obj [ blue [ i ] ]   =   obj [ blue [ i ] ]   +   1   ||   1 ;
  }


  // Iterate over the 'red' words.
  // For each red word, decrement its count in the 'obj' object.
  // If the word is encountered for the first time, initialize its count to -1.
  for   ( let   i   in   red )
  {
    obj [ red [ i ] ]   =   obj [ red [ i ] ]   -   1   ||   -1 ;
  }


  // Initialize a variable 'max' to store the maximum count found.
  let   max   =   0 ;

  // Iterate through the values (counts) stored in the 'obj' object.
  // Update 'max' if a larger count is found.
  for   ( let   v   in   obj )
  {
    max   =   Math . max ( max , obj [ v ] ) ; // Compare current max with the object's value.
  }

  // Ensure that 'max' is not negative; if it is, set it to 0.
  // This handles cases where all counts are negative or zero.
  max   =   max   >=   0   ?   max   :   0 ;

  // Finally, print the calculated maximum value to the console.
  console . log ( max ) ;
}

// Invoke the main function.
// It reads the input from standard input using Node.js's 'fs' module.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;