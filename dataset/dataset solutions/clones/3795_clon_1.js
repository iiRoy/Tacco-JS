/*
 * This is a JavaScript program designed to solve a specific problem.
 * It calculates the minimum number of 'W' (west) and 'E' (east) characters
 * that need to be changed to make a string "balanced" around a pivot point.
 * The input is read from standard input.
 */

var main = function ( input ) { // Define the main function that takes 'input' as an argument.

  // First, process the raw input string.
  input = input.split('\n'); // Split the input string by newline characters into an array of lines.

  // Extract N, the number of elements, from the input.
  var N = input.shift(); // Remove the first element (N) from the array and store it.

  // Join the remaining input lines into a single string S.
  var S = input.join(); // Concatenate the rest of the array elements into a single string.


  // Declare several variables that will be used throughout the logic.
  var w;       // This variable will store the substring representing the 'west' part.
  var w_sub;   // This will store 'w' after removing 'W' characters.
  var e;       // This variable will store the substring representing the 'east' part.
  var e_sub;   // This will store 'e' after removing 'E' characters.
  var count;   // This will hold the current count of 'W's in 'w' and 'E's in 'e'.
  var count_min = 3 * 100000; // Initialize minimum count to a large value (300,000).


  // Begin a loop that iterates N times.
  // The loop variable 'i' represents the potential pivot point.
  for ( var i = 0; i < N; i++ ) {

    // Extract the 'west' portion of the string S.
    w = S.slice(0, i); // Substring from index 0 up to (but not including) i.

    // Extract the 'east' portion of the string S.
    e = S.slice(i + 1, N); // Substring from index (i+1) up to (but not including) N.

    // Calculate the number of 'W' characters in the 'west' part.
    w_sub = w.split('W').join(''); // Remove all 'W's from 'w'.

    // Calculate the number of 'E' characters in the 'east' part.
    e_sub = e.split('E').join(''); // Remove all 'E's from 'e'.


    // Calculate the total count of 'W's in 'w' and 'E's in 'e'.
    // This represents the number of characters to change for the current pivot 'i'.
    count = ( w.length - w_sub.length ) + ( e.length - e_sub.length );


    // Check if the current count is 0.
    // If it is, no changes are needed, so 0 is the minimum.
    if ( count === 0 || count === -0 ) { // -0 is equivalent to 0 in JavaScript, but included for completeness.
      count_min = 0; // Set minimum count to 0.
      break;         // Exit the loop early as we've found the absolute minimum.
    }

    // If the current count is less than the previously recorded minimum, update the minimum.
    else if ( count < count_min ) {
      count_min = count; // Update count_min with the new, smaller count.
    }
  }

  // After the loop completes, print the final minimum count to the console.
  console.log( count_min );

  // The function returns 0, indicating successful execution.
  return 0;

}; // End of the main function definition.


/*
 * This section handles the execution of the 'main' function.
 * It reads input from standard input, processes it, and then passes it to 'main'.
 */
main( require("fs").readFileSync("/dev/stdin", "utf8").trim() ); // Call main with the processed input.