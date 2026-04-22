/*
 * This is a JavaScript file that processes numerical input.
 * It simulates a linked list or chain traversal based on array indices.
 */

"use strict"; // Enforce strict mode for better code quality.

// The main function that encapsulates the program logic.
var main = function main(input) {
  // Split the input string by newline characters to get individual lines.
  var args = input.split('\n');

  // Parse the first line as an integer N, which represents the number of elements.
  var N = parseInt(args[0], 10);

  // Initialize an empty array 'a' to store the subsequent integer inputs.
  var a = [];

  // Loop from 1 to N to populate the array 'a' with parsed integers.
  for (var i = 1; i <= N; i++) {
    // Parse each argument line as an integer and push it into array 'a'.
    a.push(parseInt(args[i], 10));
  }


  // Initialize 'next' with the first element of array 'a'. This is the starting point of our traversal.
  var next = a[0];
  // Initialize a boolean flag to track if the target value (2) is reached.
  var flag = false;
  // Initialize a counter to keep track of the number of steps taken.
  var count = 0;

  // This loop simulates traversing a chain or linked list.
  // It iterates up to N times to prevent infinite loops in case of cycles.
  for (var _i = 0; _i < N; _i++) {
    // Increment the step counter for each iteration.
    count++;

    // Check if the current 'next' value is equal to 2.
    if (next == 2) {
      // If 2 is found, set the flag to true and break out of the loop.
      flag = true;
      break;
    }

    // Update 'next' to the value at the index (next - 1) in array 'a'.
    // This simulates following a pointer or link.
    next = a[next - 1];
  }

  // After the loop, check the flag.
  if (flag) {
    // If flag is true, it means 2 was found, so print the number of steps.
    console.log(count);
  } else {
    // If flag is false, 2 was not found within N steps, so print -1.
    console.log(-1);
  }
}; // End of main function.


// Read input from stdin, decode it as UTF-8, and pass it to the main function.
main(require('fs').readFileSync('/dev/stdin', 'utf-8'));
// This line executes the main logic with the provided input.