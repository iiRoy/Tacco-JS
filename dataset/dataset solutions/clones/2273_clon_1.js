/*
 * This is a Type I clone example.
 * The original code's functionality remains absolutely identical.
 * Only whitespace and comments have been altered.
 */

function   Main(   input   )   {

  // Split the input string by spaces to get individual values.
  input   =   input.split(" ")   ;


  var   k   =   input[0]   ;   // Assign the first value to variable 'k'.
  var   n   =   input[1]   ;   // Assign the second value to variable 'n'.


  // Check if k multiplied by 500 is greater than or equal to n.
  if   (   k   *   500   >=   n   )   {

    console.log("YES")   ;   // Output "YES" if the condition is true.

  }   else   {

    console.log("NO")   ;   // Otherwise, output "NO".

  }   // End of if-else block.

} // End of Main function definition.


// This line reads input from standard input and passes it to the Main function.
Main   (   require("fs").readFileSync("/dev/stdin",   "utf8")   )   ;