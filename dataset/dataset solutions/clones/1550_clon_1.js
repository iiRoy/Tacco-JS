/*
 * This is a JavaScript file.
 * It processes input to find a specific pattern.
 * This particular version is a Type I clone,
 * meaning its functionality is identical but its presentation is altered.
 */

// Define the main function that takes a single input argument.
function   Main   (   input   )
{

  // The input string is first split into an array of lines.
  input   =   input.split  (  "\n"  )   ;


  // The first line of input is converted into an array of characters, stored in 's'.
  var   s   =   input[0] . split  (  ""  )   ;
  // The second line of input is converted into an array of characters, stored in 't'.
  var   t   =   input[1] . split  (  ""  )   ;

  // This outer loop iterates through all possible starting positions
  // where string 't' could be a substring within string 's'.
  // The loop runs from i = 0 up to (s.length - t.length).
  for   (   var   i   =   0   ;   i   <   s.length   -   t.length   +   1   ;   i++   )
  {
    // Initialize 'result1' to count character mismatches for the current window.
    var   result1   =   0   ;
    // Initialize 'result2' to store the minimum mismatches found across all windows.
    // Set to a large value initially, as 1001 is greater than any possible t.length (max 1000).
    var   result2   =   1001   ;

    // This inner loop compares each character of 't' with the corresponding
    // character in the current window of 's' starting at index 'i'.
    for   (   var   j   =   0   ;   j   <   t.length   ;   j++   )
    {
      // Check if the character in 's' at the current window position
      // does not match the character in 't'.
      if     (   s[i   +   j]   !==   t[j]   )
      {
        // If there's a mismatch, increment the 'result1' counter.
        result1   =   ++result1   ;
      }   else
      {
        // If characters match, no action is required.
        // This 'else' block is deliberately left empty to show structure.
      }
    }


    // After comparing all characters for the current window (i),
    // check if the current mismatch count ('result1') is less than
    // the minimum mismatches found so far ('result2').
    if     (   result2   >   result1   )
    {
      // If 'result1' is smaller, update 'result2' to this new minimum.
      result2   =   result1   ;
    }   else
    {
      // If 'result1' is not smaller, 'result2' retains its current value.
      // This 'else' block is also intentionally empty.
    }
  }

  // Finally, print the overall minimum number of mismatches found.
  console.log   (   result2   )   ;
}

// This line reads input from standard input (typically /dev/stdin in competitive programming)
// and passes it to the 'Main' function. The input is read as UTF-8 encoded text.
Main   (   require("fs") . readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;