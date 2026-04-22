/*
 * This JavaScript code implements a specific string manipulation algorithm.
 * It aims to find the lexicographically smallest string that is longer than
 * the input string 's' or modify 's' based on certain conditions.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */

function   Main  (  s  )
{
  // Declare and initialize 'n' with the length of the input string 's'.
  const n  =  s.length;

  // 'a' stores the ASCII (or Unicode) value of the character 'a'.
  // This is used for character code arithmetic to convert characters to 0-25 indices.
  const a = "a" . charCodeAt ( ) ;


  // 'b' is an array of 26 elements, initially all set to 1.
  // It acts as a boolean array (or frequency map) for alphabet characters,
  // where 1 means available/not used, and 0 means used/not available.
  var b = Array ( 26 ) . fill ( 1 ) ;

  // 'i' is a loop counter variable, declared here for broader scope.
  var i ;

  // First major conditional block: executed if the input string length is less than 26.
  if ( n < 26 )
  {
    // Loop through each character of the input string 's'.
    // Mark characters present in 's' in the 'b' array by setting their corresponding index to 0.
    for ( i = 0 ; i < n ; i ++ )
    {
      b [ s . charCodeAt ( i ) - a ] = 0 ;  // Subtract 'a' to get a 0-25 index.
    }

    // After marking existing characters, find the first available (not present) character
    // in alphabetical order.
    for ( i = 0 ; i < 26 ; i ++ )
    {
      // If b[i] is 1, it means the character corresponding to index 'i' is not in 's'.
      if ( b [ i ] )
      {
        // Append this character to 's', effectively making 's' one character longer.
        s += String . fromCharCode ( a + i ) ;
        break ; // Exit this loop as we've found and appended the desired character.
      }
    }
  }
  else
  {
    /*
     * This 'else' block handles cases where the input string 's' has a length of 26 or more.
     * It's specifically looking for the next lexicographical string by changing existing characters.
     */

    // Special check for the largest 26-character string in reverse alphabetical order.
    // If 's' is "zyxwvutsrqponmlkjihgfedcba", there's no lexicographically larger string
    // that can be formed by simply changing its characters based on the problem's logic.
    if ( s === "zyxwvutsrqponmlkjihgfedcba" )
    {
      // Output -1 as per problem specification indicating no such string can be found.
      console . log ( -1 ) ;
      return ; // Terminate function execution.
    }

    // Initialize the 'b' array for this part of the algorithm.
    // Mark the last character of 's' (at index 25, assuming n >= 26) as used by setting its flag to 0.
    b [ s . charCodeAt ( 25 ) - a ] = 0 ;

    // This is a labeled loop, allowing a 'break loop' statement to exit both the inner and outer loops.
    // It iterates from the second-to-last character (index 24) backwards to the beginning of the string.
    loop:
    for ( i = 24 ; i >= 0 ; i -- )
    {
      // Iterate through possible characters (from the current character's value upwards) in the alphabet.
      for ( var j = s . charCodeAt ( i ) - a + 1 ; j < 26 ; j ++ ) // Start 'j' from char after s[i]
      {
        // If an unused character (b[j] === 0) is found that is greater than the current character s[i].
        if ( b [ j ] === 0 )
        {
          // Truncate 's' up to the current index 'i'.
          s = s . slice ( 0 , i ) ;
          // Append the found character (corresponding to index 'j').
          s += String . fromCharCode ( a + j ) ;
          break loop ; // Exit both 'for' loops (the inner 'j' loop and the outer 'i' loop labeled 'loop').
        }
        // If the character b[j] is not 0 (i.e., it's already used), we continue searching.
        // However, we also mark the current character s[i] as used for subsequent iterations of the outer loop.
        b [ s . charCodeAt ( i ) - a ] = 0 ;
      }
    }
  }

  // Finally, print the resulting modified string 's' to the console.
  console . log ( s ) ;
}

// Entry point of the script:
// 1. Use the 'fs' module to read synchronous file data.
// 2. Read the content of "/dev/stdin" (standard input) as "utf8" encoded text.
// 3. '.trim()' removes leading/trailing whitespace (like newlines) from the input.
// 4. The processed string is then passed as an argument to the 'Main' function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;