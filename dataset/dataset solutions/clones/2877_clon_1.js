/*
 * This JavaScript file contains a solution for a string manipulation problem.
 * The primary goal is to identify and replace occurrences of the substring "ABC"
 * within an input string, while also counting these replacements.
 *
 * This implementation processes the input string from left to right.
 * When "ABC" is found, it is replaced with "BCA", and the search
 * continues from an adjusted position to handle overlapping possibilities.
 */

function Main (  input  )
{
  // Declare and initialize variables that will be used throughout the function.
  // S will hold the input string after initial processing.
  var   S   =   input . trim (  ) ;

  // N will store the current length of the string S.
  var   N   =   S . length ;

  // output will count the number of successful "ABC" to "BCA" replacements.
  var   output   =   0   ;

  // The core logic proceeds only if the string is long enough to contain "ABC".
  if   (   N   >=   3   )
  {
    // Iterate through the string, checking for "ABC" starting at each position 'i'.
    // The loop condition 'i < N - 2' ensures that S[i+2] is a valid index.
    for   (   var   i   =   0   ;   i   <   N   -   2   ;   i ++   )
    {
      // Concatenate the three characters from the current position 'i'
      // and compare them to the target string "ABC".
      if   (   S [ i ]   +   S [ i + 1 ]   +   S [ i + 2 ]   ==   "ABC"   )
      {
        // If "ABC" is found, perform the replacement.
        // First, extract the part of the string before "ABC".
        var   beforeS   =   S . slice (   0 ,   i   ) ;

        // Next, extract the part of the string after "ABC".
        var   afterS    =   S . slice (   i + 3   ) ;

        // Reconstruct the string S with "ABC" replaced by "BCA".
        S   =   beforeS   +   "BCA"   +   afterS   ;

        // Increment the counter for replacements.
        output ++   ;

        // Adjust the loop index. We decrement by 2 because after replacing "ABC"
        // at index 'i', the new "BCA" might create a new "ABC" starting at 'i-2'
        // or 'i-1'. By decrementing 'i' by 2, the next iteration (due to i++)
        // will effectively re-examine the character at original 'i-1'.
        i   -=   2   ;
      }
    }
  }

  // After the loop completes, print the total number of replacements made.
  console . log (   output   ) ;
}

// This section handles the input reading for the Main function,
// specifically designed for environments like Node.js where input
// is read from standard input.
Main (
  require (   "fs"   ) . readFileSync (   "/dev/stdin"   ,   "utf8"   )
) ;