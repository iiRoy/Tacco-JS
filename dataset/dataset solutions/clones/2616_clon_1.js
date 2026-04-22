/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact logical and structural identity.
 * Only whitespace and comments have been altered.
 */

function   Main   (   arg   )   {

  // Declare variables to store parsed input values.
  var M = arg.trim().split(" ")[0] - 0;
  var D = arg.trim().split(" ")[1] - 0;

  var ans = 0; /* Initialize the counter for valid combinations. */

  // Check for an early exit condition based on the day value.
  if ( D < 22 ) {
    console.log(0);
  }

  // Outer loop iterates through possible month values.
  for ( var i = 4; i <= M; i++ ) {

    // Inner loop iterates through possible day values, starting from 22.
    for ( var j = 22; j <= D; j++ ) {

      /*
       * Extract the second digit of the day 'j'.
       * Note: j is converted to string, then split into characters.
       */
      var d0 = j.toString().split("")[1];

      // Extract the first digit of the day 'j'.
      var d10 = j.toString().split("")[0];

      // Check if the month 'i' is equal to the product of the day's digits.
      if ( i === d0 * d10 ) {
        ans++; // If the condition is met, increment the answer counter.
      }
    }
  }

  // Output the final calculated answer.
  console.log(ans);

} // End of Main function

// Read input from standard input and pass it to the Main function.
Main( require("fs").readFileSync("/dev/stdin", "utf8") );