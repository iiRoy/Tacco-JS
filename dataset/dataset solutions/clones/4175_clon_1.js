/*
 * This JavaScript function processes an array of numbers based on their
 * minimum and maximum values, applying specific transformations to sort
 * the array indirectly and recording these operations.
 *
 * It reads input from standard input, performs calculations, and then
 * outputs the number of operations followed by the operations themselves.
 */

function Main(input) { // Main function definition starts here.
  // Split the entire input string by newline characters into an array of strings.
  input = input.split("\n");

  // Parse the first number from the first line of input.
  // The first line is expected to contain 'n' followed by other space-separated values,
  // but only the first value (n) is used.
  var n = parseInt(input[0].split(" ")[0]);

  // Split the second line of input by spaces to get the raw string array of numbers.
  tmp = input[1].split(" ");

  // Initialize array 'a' of size 'n' with all elements set to 0.
  // This array will store the parsed integer values from 'tmp'.
  a = new Array(n).fill(0);

  // Initialize an empty array 'b'. This array will store the operations performed.
  b = new Array();

  // Initialize 'max' with a very small number (negative 10^6) to ensure
  // any input number will be greater than or equal to it.
  var max = -Math.pow(10, 6);

  // Initialize 'min' with a very large number (positive 10^6) to ensure
  // any input number will be less than or equal to it.
  var min = Math.pow(10, 6);

  // Loop through the 'tmp' array to parse numbers and find the actual min and max.
  for (i = 0; i < n; i++) {
    // Parse the string element from 'tmp' into an integer and store it in 'a'.
    a[i] = parseInt(tmp[i]);

    // Update 'max' if the current element 'a[i]' is greater.
    max = Math.max(a[i], max);

    // Update 'min' if the current element 'a[i]' is smaller.
    min = Math.min(a[i], min);
  }

  // --- Conditional logic based on min and max values ---

  // Scenario 1: All numbers are non-negative (min >= 0).
  if (min >= 0) {
    // Iterate through the array to make it non-decreasing.
    // If an element is smaller than its predecessor, add the predecessor to it.
    for (i = 0; i < n; i++) {
      // Check if it's not the first element and if the current element is smaller than the previous one.
      if (i > 0 && a[i] < a[i - 1]) {
        // Record the operation: add a[i-1] (at index i) to a[i] (at index i+1).
        // Indices are 1-based for output.
        bsub = [i + 1, i + 2];
        b.push(bsub);

        // Perform the addition.
        a[i] = a[i - 1] + a[i];
      }
    }
  }
  // Scenario 2: All numbers are negative (max < 0).
  else if (max < 0) {
    // Iterate through the array in reverse to make it non-increasing.
    // If an element is greater than its successor, add the successor to it.
    for (i = n - 1; i >= 0; i--) {
      // Check if it's not the last element and if the current element is greater than the next one.
      if (i < n - 1 && a[i] > a[i + 1]) {
        // Record the operation: add a[i+1] (at index i+2) to a[i] (at index i+1).
        // Indices are 1-based for output.
        bsub = [i + 2, i + 1];
        b.push(bsub);

        // Perform the addition.
        a[i] = a[i + 1] + a[i];
      }
    }
  }
  // Scenario 3: Mixed signs, and the absolute maximum positive value is greater than the absolute minimum negative value.
  else if (max > Math.abs(min)) {
    // First pass: Add the global maximum 'max' to all elements except itself.
    // This makes all elements positive or zero, and likely increases their values.
    for (i = 0; i < n; i++) {
      // Find the index of the first occurrence of 'max'. If it's not the current element's index.
      if (a.indexOf(max) != i) {
        // Record the operation: add 'max' (at its original position) to a[i].
        // Indices are 1-based.
        bsub = [a.indexOf(max) + 1, i + 1];
        b.push(bsub);

        // Perform the addition.
        a[i] = a[i] + max;
      }
    }
    // Second pass: After potentially making all values positive, sort non-decreasingly.
    // This is similar to Scenario 1.
    for (i = 0; i < n; i++) {
      // Check for non-decreasing order.
      if (i > 0 && a[i] < a[i - 1]) {
        // Record the operation: add a[i-1] (at index i) to a[i] (at index i+1).
        // Indices are 1-based.
        bsub = [i, i + 1]; // Note: 'i' for source, 'i+1' for target (1-based)
        b.push(bsub);

        // Perform the addition.
        a[i] = a[i - 1] + a[i];
      }
    }
  }
  // Scenario 4: Mixed signs, and the absolute minimum negative value is greater than the absolute maximum positive value.
  else if (Math.abs(min) > max) {
    // First pass: Add the global minimum 'min' to all elements except itself.
    // This makes all elements negative or zero, and likely decreases their values.
    for (i = 0; i < n; i++) {
      // Find the index of the first occurrence of 'min'. If it's not the current element's index.
      if (a.indexOf(min) != i) {
        // Record the operation: add 'min' (at its original position) to a[i].
        // Indices are 1-based.
        bsub = [a.indexOf(min) + 1, i + 1];
        b.push(bsub);

        // Perform the addition.
        a[i] = a[i] + min;
      }
    }
    // Second pass: After potentially making all values negative, sort non-increasingly.
    // This is similar to Scenario 2.
    for (i = n - 1; i >= 0; i--) {
      // Check for non-increasing order.
      if (i < n - 1 && a[i] > a[i + 1]) {
        // Record the operation: add a[i+1] (at index i+2) to a[i] (at index i+1).
        // Indices are 1-based.
        bsub = [i + 2, i + 1];
        b.push(bsub);

        // Perform the addition.
        a[i] = a[i + 1] + a[i];
      }
    }
  }

  // Prepare the final output string.
  // Start with the total number of operations.
  var ans = b.length;

  // Append each recorded operation to the 'ans' string.
  for (i = 0; i < b.length; i++) {
    // Each operation is on a new line, with two 1-based indices separated by a space.
    ans += "\n" + b[i][0] + " " + b[i][1];
  }

  // Print the final answer to the console.
  console.log('%s', ans);
}

// Read input from standard input using Node.js 'fs' module.
// The input is read synchronously and encoded as UTF-8.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// End of Main function and script.