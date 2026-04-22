// Strict mode declaration for the entire script.
"use strict" ;

// This is the main entry point of the application.
// It reads input from standard input, decodes it as UTF-8,
// and then passes this raw input data to the 'main' function for processing.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "UTF-8" ) ) ;


/*
 * The main function processes the given input to calculate the number
 * of anagram pairs among a list of strings.
 *
 * @param {string} input - The raw input string obtained from standard input.
 *                         It contains the number of strings on the first line,
 *                         followed by the strings themselves, each on a new line.
 */
function main ( input )
{
  // Split the entire input string into an array of individual lines.
  // Each element in this array will be one of the input strings or the count.
  input = input . split ( "\n" ) ;


  // The first element of the 'input' array is the count of strings.
  // We parse it as an integer and then remove it from the array using .shift().
  const stringNum = parseInt ( input . shift ( ) ) ;


  /*
   * Transform each string in the input array into its canonical form.
   * A canonical form for anagrams is achieved by sorting the characters
   * of the string alphabetically. For example, "listen" and "silent" both
   * become "eilnst" after this transformation.
   */
  input = input . map ( s =>
    s
      . split ( "" ) // Convert the string into an array of its characters.
      . sort ( )      // Sort the characters alphabetically.
      . join ( "" )   // Join the sorted characters back into a new string.
  ) ;


  // Initialize a variable to keep track of the total number of anagram pairs found.
  let result = 0 ;


  // Use nested loops to compare every unique pair of strings.
  // The outer loop iterates from the first string up to the second-to-last string.
  for ( let i = 0 ; i < stringNum ; i ++ )
  {
    // The inner loop starts from the string immediately after 'i'.
    // This ensures that each pair is checked only once and a string is not
    // compared with itself.
    for ( let f = i + 1 ; f < stringNum ; f ++ )
    {
      // If the canonical forms of two strings are identical,
      // it means they are anagrams of each other.
      if ( input [ i ] === input [ f ] )
      {
        result ++ ; // Increment the counter for anagram pairs.
      }
    }
  }


  // Finally, print the total count of anagram pairs to the console.
  console . log ( result ) ;
}