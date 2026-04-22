/*
 * This JavaScript program reads an integer from standard input,
 * processes it based on whether it's even or odd,
 * and then prints the result to standard output.
 */


// Declare a variable to store the parsed input value.
var     input    =    parseInt   (   require (  "fs"  ) .  readFileSync  (  "/dev/stdin"  ,  "utf-8"  ) .  trim  (  )   )   ;


// Declare a variable to hold the final computed answer.
var   answer   ;


// Check if the input number is even or odd.
if  (  input   %   2   ===   0  )
{
  // If the input is even, the answer is the input itself.
  answer    =    input   ;   // Assign the input value
}
else
{
  // If the input is odd, the answer is twice the input.
  answer   =   input   *   2   ;   /* Calculate and assign
                                     the doubled value */
}   // End of conditional block


// Output the final answer to the console.
console   .   log   (   answer   )   ;