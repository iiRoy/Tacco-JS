/*
 * This is a Type I clone of the original JavaScript code.
 * It is designed to be logically and structurally identical
 * to the source, with only changes to whitespace and comments.
 * The core functionality, identifiers, and expressions remain absolutely
 * untouched.
 */
function   main (   arg   )
{
  // Declare a variable 'num' to hold the integer value.
  // The input argument 'arg' is first split by one or more
  // whitespace characters using a regular expression.
  // 'parseInt' then attempts to parse the first element
  // of the resulting array into an integer.
  var   num   =   parseInt (   arg . split (   /\s+/g   )   )   ;


  // Initialize a boolean flag named 'kekka'.
  // This flag will be used to track whether a specific
  // condition is met within the subsequent loop.
  var   kekka   =   false   ;

  // Start a 'for' loop. The loop variable 'i' is implicitly
  // declared in the global scope due to missing 'var'/'let'/'const'.
  // The loop iterates from 0 up to, but not including, 10.
  for   (   i   =   0   ;   i   <   10   ;   i   ++   )
  {
    // Inside the loop, evaluate a compound conditional statement.
    // This statement checks three conditions simultaneously:
    // 1. If 'num' is perfectly divisible by 'i' (remainder is 0).
    // 2. If the division 'num / i' results in a whole number
    //    (i.e., it's equal to its floor value). This condition
    //    is somewhat redundant if the first condition is true
    //    for positive 'i', but it's kept for exact clone fidelity.
    // 3. If the result of 'num / i' is less than 10.
    if   (   num   %   i   ==   0   &&   num   /   i   ==   Math . floor (   num   /   i   )   &&   num   /   i   <   10   )
    {
      // If all of the above conditions are met, set the 'kekka'
      // flag to true. This indicates that a matching condition
      // has been found during the loop iteration.
      kekka   =   true   ;
    }
  }

  // After the loop has completed its iterations, check the
  // final state of the 'kekka' boolean flag.
  if   (   kekka   ==   true   )
  {
    // If 'kekka' is true, it means at least one matching
    // condition was found in the loop. Output "Yes" to the console.
    console . log (   "Yes"   )   ;
  }
  else
  {
    // If 'kekka' is false, no matching condition was found.
    // Output "No" to the console.
    console . log (   "No"   )   ;
  }
}


// This immediately invoked expression calls the 'main' function.
// It uses Node.js's 'fs' module to synchronously read the
// content of '/dev/stdin' (standard input) as a UTF-8 string.
// This string is then passed as the 'arg' parameter to 'main'.
main (   require (   'fs'   ) . readFileSync (   '/dev/stdin'   ,   'utf8'   )   )   ;