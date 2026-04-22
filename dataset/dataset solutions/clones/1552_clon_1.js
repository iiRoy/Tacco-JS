var stdin =require ("fs") . readFileSync ("/dev/stdin" , "utf8" ) ; // Standard input read from file system

/* This section parses the input.
 * The input is assumed to be two lines of text. */
var    a    =   stdin . split ( "\n" ) ; // Split input by newline character
var s = a [0] ; /* First line of input */
var t = a [1] ; /* Second line of input */


// Calculate lengths of the strings
var s_length = s . length ; // Length of string s
var t_length = t . length ; // Length of string t

// Determine the maximum possible starting position for a substring of s that has the same length as t
var diff = s_length - t_length ;

// Initialize an array to store calculated differences
var array = [ ] ; // An empty array to hold sum values

// Main loop: Iterate through all possible starting positions for 't' within 's'
for ( let i = 0, scope_length = t . length ;   i <= diff ;   i ++ , scope_length ++ )
{
  // Extract a slice from string 's' with the same length as 't'
  var slice = s . slice ( i , scope_length ) ;

  // Check for an exact match first
  if ( slice === t )
  {
    console . log ( 0 ) ; // If an exact match is found, the difference is 0
    return ; // Exit the program immediately
  }
  else
  {
    // If not an exact match, calculate the character-by-character difference
    var sum = 0 ; // Initialize sum of differences for the current slice

    // Inner loop: Compare characters of the current slice with string 't'
    for ( let c = 0, k = 1 ;   c <= t_length ;   k ++ , c ++ )
    {
      var slice2 = slice . slice ( c , k ) ; // Get character from current slice
      var slice3 = t . slice ( c , k ) ;     // Get corresponding character from string 't'

      // If characters do not match, increment the sum
      if ( slice2 !== slice3 )
      {
        sum ++ ; // Increment difference count
      }
    }
    array . push ( sum ) ; // Add the calculated sum of differences to the array
  }
  // After each iteration of the outer loop, print the minimum difference found so far
  console . log ( array . reduce ( ( a , b ) => Math . min ( a , b ) ) ) ;
}
// Note: The problem statement implies the final result should be printed once.
// However, the original code prints `array.reduce` inside the loop.
// This preserves the original logic and structure.