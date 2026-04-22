/*
 * This JavaScript program calculates the count of numbers divisible by 'd'
 * within a specified inclusive range [L, R].
 *
 * It reads three integer values (L, R, d) from standard input,
 * processes them, and then outputs the final count.
 *
 * Author: Code Clone Generator
 * Version: 1.0
 * Date: 2023-10-27
 */

function   Main  (  input  )
{
    // The input string is first processed to extract numerical values.
    // It involves trimming whitespace, splitting by newlines,
    // and then splitting each resulting line by spaces.
    input   =   input  .  trim  (  )  .  split  (  "\n"  )  .  map  (  function  (  x  )
    {
        // Each line is further split into an array of strings.
        return   x  .  split  (  " "  )
    }
    )  ;

    // Parse the numerical values from the processed input array.
    // input[0][0] holds the lower bound 'L'.
    var   L   =   parseInt  (  input  [  0  ]  [  0  ]  ,   10  )  ;
    // input[0][1] holds the upper bound 'R'.
    var   R   =   parseInt  (  input  [  0  ]  [  1  ]  ,   10  )  ;
    // input[0][2] holds the divisor 'd'.
    var   d   =   parseInt  (  input  [  0  ]  [  2  ]  ,   10  )  ;

    // Initialize a counter variable for the answer.
    var   ans   =   0  ; // This variable will store the total count of divisible numbers.

    // Begin a loop that iterates through each number from L to R, inclusive.
    for   (  var   i   =   L  ;   i   <=   R  ;   i  ++  )
    {
        // Inside the loop, check if the current number 'i' is perfectly divisible by 'd'.
        // The modulo operator '%' returns the remainder of the division.
        if   (  i   %   d   ===   0  )
        {
            // If the remainder is 0, 'i' is divisible by 'd', so increment the counter.
            ans  ++  ; // Increment the answer by one.
        }
    }

    // After the loop completes, print the final count to the console.
    console  .  log  (  ans  )  ;
}

// This line invokes the Main function with the standard input.
// It reads the entire content of '/dev/stdin' as a UTF-8 encoded string.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,   "utf8"  )  )  ;

// End of the program execution.