/* This is a utility function for outputting text to the console. */
function   myout (   text   )   {
  console.log(   text   )   ; /* Logs the provided text. */
}


// The primary function that processes the input for this program.
function Main(  input  ) {

  // First, we prepare the input by parsing it as an integer after trimming any whitespace.
  input   =   parseInt(   input.trim()   )   ;

  // The following lines are commented out as they represent alternative input parsing strategies
  // that are not utilized in this specific execution path. They are kept for reference.
  // input = input.trim().split(" ");
  // input = input.trim().split("\n");
  // input = input.trim().split(" ").map((a)=>Number(a));
  // input = input.trim().split("\n").map((a)=>Number(a));


  var   count   =   0   ; /* Initialize a counter variable to keep track of numbers meeting specific criteria. */

  // Loop through numbers starting from 1 up to and including the given input value.
  for (   var   i   =   1   ;   i   <=   input   ;   i++   )   {

    // We are only interested in processing odd numbers in this loop iteration.
    if   (   i   %   2   ==   1   )   {

      var   div   =   0   ;   // Initialize a divisor counter for the current number 'i'.

      // Inner loop to find all positive divisors of the current number 'i'.
      for   (   var   j   =   1   ;   j   <=   i   ;   j++   )   {

        // If 'j' divides 'i' evenly (i.e., the remainder is 0), then 'j' is a divisor.
        if   (   i   %   j   ==   0   )   {
          div++   ;   // Increment the divisor count for 'i'.
        }

      } // End of the inner loop, all divisors for 'i' have been counted.

      // If the current odd number 'i' has exactly 8 divisors, it meets our condition.
      if   (   div   ==   8   )   {
        count++   ;   // Increment the main counter, as we've found such a number.
      }

    } // End of the 'if' block that checks if 'i' is an odd number.

  } // End of the outer loop, all numbers from 1 to 'input' have been processed.

  // Output the final accumulated count using our custom output function.
  myout(   count   )   ;

} // End of the Main function definition.


// This section handles reading input from standard input and then invoking the Main function.
Main(   require("fs").readFileSync(   "/dev/stdin"   ,   "utf8"   )   )   ;
// The program execution begins here, providing the file content to the Main function.