/*
 * This is a JavaScript program that calculates a specific value.
 * It reads input from /dev/stdin, processes it, and then
 * enters a loop to compute a result based on some conditions.
 * The final result is printed to the console.
 */
var input =   require (   'fs'   ) .   readFileSync (   '/dev/stdin'   ,   'utf8'   )   ; // Read input data

// Destructure the input array into individual variables
var   [ a ,   b ,   c ]   =   input .   trim (   ) .   split (   " "   ) .   map (   Number   )   ;

var   i   =   0   ;   // Initialize counter i
var   j   =   0   ;   // Initialize counter j, often used for weekly cycles
var   sum   =   0   ;   // Initialize the running sum

// Main loop for calculation
while   (   true   )   {
  // Check if the target 'c' has been reached or exceeded by 'sum'
  if   (   c   <=   sum   )   {
    break   ;   // Exit the loop if condition met
  }

  // Increment counters
  i   ++   ;
  j   ++   ;

  // Add 'a' to the sum in each iteration
  sum   +=   a   ;

  // Check for weekly cycle completion (j reaches 7)
  if   (   j   ==   7   )   {
    sum   +=   b   ;   // Add 'b' for the weekly bonus
    j   =   0   ;   // Reset weekly counter
  }
}

// Output the final calculated value of 'i'
console .   log (   i   )   ;