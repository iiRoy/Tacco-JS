/*
 * This file contains JavaScript code that processes numerical input.
 * It calculates a specific value based on frequencies of numbers.
 * This is a Type I clone, meaning only whitespace and comments
 * have been altered from the original source code.
 */

function   main  ( input )
{
  // Variable 'N' is initialized with the first element of the input array.
  // The '- 0' ensures explicit conversion to a number.
  var    N    =    input    [0]    -    0    ;

  // An empty object 'map' is created to store frequency counts of numbers.
  var    map    =    {    }    ;

  // 'max' is initialized to zero; it will track the highest number encountered.
  var    max    =    0    ;


  /*
   * The second element of the input array is expected to be a string
   * of space-separated numbers. This block processes these numbers.
   */
  input    [1]    .    split    (    " "    )    .    forEach    (    v    =>
  {
    // Convert the current string 'v' to a numeric type.
    v    =    v    -    0    ;

    // Increment the count for number 'v' in the 'map' object.
    // If 'v' is encountered for the first time, its count is set to 1.
    map    [v]    =    map    [v]    ?    map    [v]    +    1    :    1    ;

    // Update 'max' if the current number 'v' is larger than the current maximum.
    max    =    Math    .    max    (    max    ,    v    )    ;
  }    )    ;


  // 'ans' is initialized to 1, serving as the accumulator for the final result.
  var    ans    =    1    ;

  // 'ansmap' is another object, though its direct use here is limited to one entry.
  var    ansmap    =    {    }    ;

  // A specific entry in 'ansmap' is set. Its purpose might be for edge cases or specific problem logic.
  ansmap    [    -1    ]    =    1    ;


  // This loop iterates from 1 up to the maximum number found in the input.
  for    (    var    i    =    1    ;    i    <=    max    ;    i    ++    )
  {
    // 'ans' is multiplied by a calculated power.
    // Math.pow(base, exponent) is used.
    // The '|| 0' ensures that if map[key] is undefined, it defaults to 0, preventing NaN.
    ans    *=    Math    .    pow    (    map    [i    -    1]    ||    0    ,    map    [i]    ||    0    )    ;

    // If the count for the current number 'i' is zero (or undefined), 'ans' becomes zero.
    if    (    map    [i]    ||    0    ==    0    )
    ans    =    0    ;

    // The modulo operator is applied to 'ans' to keep the result within a specific range
    // (a common practice in competitive programming for large numbers).
    ans    %=    998244353    ;
  }


  // The final computed answer is printed to the standard output.
  console    .    log    (    ans    )    ;
}


/*
 * Below is a definition for a factorial function, named 'kaijo'.
 * It includes memoization to optimize performance for repeated calls
 * with the same input 'N'.
 */

// 'kaijomap' acts as a cache for computed factorial values.
var    kaijomap    =    {    }    ;

// The 'kaijo' function computes the factorial of 'N' recursively.
function    kaijo    (    N    )
{
  // Base case: The factorial of 1 is 1.
  if    (    N    ==    1    )
  return    1    ;

  // Check if the factorial of 'N' has already been computed and cached.
  if    (    kaijomap    [N]    )
  return    kaijomap    [N]    ;

  // If not cached, compute N! = N * (N-1)!, store it, and then return the result.
  return    kaijomap    [N]    =    N    *    kaijo    (    N    -    1    )    ;
}


/*
 * This is the entry point of the script.
 * It reads all data from standard input, splits it by newlines,
 * and passes the resulting array to the 'main' function for processing.
 */
main    (    require    (    'fs'    )    .    readFileSync    (    '/dev/stdin'    ,    'utf8'    )    .    split    (    "\n"    )    )    ;