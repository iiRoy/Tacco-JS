// This variable will accumulate all incoming data from standard input.
let input = '';


// Begin processing standard input.
// This ensures the Node.js process does not exit until all input is handled.
process.stdin.resume();

// Set the encoding for the standard input stream to UTF-8.
// This is crucial for correctly interpreting text data.
process.stdin.setEncoding('utf8');

// Attach an event listener for the 'data' event on standard input.
// This function is called whenever a chunk of data is received.
process.stdin.on('data', function (chunk) {

  // Append the received data chunk to the 'input' string.
  input += chunk;

}); // End of 'data' event handler.


// Attach an event listener for the 'end' event on standard input.
// This function is called once all input has been received.
process.stdin.on('end', function () {

  // Process the accumulated input:
  // 1. Remove leading/trailing whitespace using trim().
  // 2. Split the string into an array of lines based on the newline character.
  input = input.trim().split('\n');

  // After all input is processed and formatted,
  // call the main function to start the core logic of the program.
  main();

}); // End of 'end' event handler.


// This is the primary function where the main logic of the application resides.
function main() {

  // The first line of input is expected to be the number of datasets.
  dataset_num = input[0];

  // A basic validation check for the dataset count.
  // If it exceeds 1000, we consider it an invalid input and exit.
  if (dataset_num > 1000) {
    return; // Terminate function execution.
  }


  // Loop through each dataset starting from the second line of input
  // (index 1), as the first line was the dataset count.
  for (i = 1; i < input.length; i++) {

    // For each line, split it by spaces to get individual numbers.
    input_line = input[i].split(' ');

    // Sort the numbers in descending order using a custom comparison function.
    // This is important for the Pythagorean theorem check later,
    // assuming the largest side is the hypotenuse.
    input_line.sort(compareNumbers);

    // The following blocks perform validation on the input numbers.
    // Each number in the line must be within the range [0, 1000].
    // If any number is outside this range, the program returns early.

    if (0 > input_line[0] || input_line[0] > 1000) {
      return; // Invalid number, exit.
    }

    if (0 > input_line[1] || input_line[1] > 1000) {
      return; // Invalid number, exit.
    }

    if (0 > input_line[2] || input_line[2] > 1000) {
      return; // Invalid number, exit.
    }


    // Check if the three numbers form a right-angled triangle
    // using the Pythagorean theorem: a^2 + b^2 = c^2.
    // Since the array is sorted descending, input_line[0] is the largest side (hypotenuse).
    if (Math.pow(input_line[0], 2) === Math.pow(input_line[1], 2) + Math.pow(input_line[2], 2)) {

      // If the condition holds true, print 'YES'.
      console.log('YES');

    } else {

      // Otherwise, if it's not a right-angled triangle, print 'NO'.
      console.log('NO');

    }

  } // End of for loop iterating through input lines.

} // End of main function.


// This helper function is used by the sort method to compare two numbers.
// It sorts numbers in descending order (largest to smallest).
function compareNumbers(a, b) {

  // Return b - a for descending order.
  // For ascending order, it would be a - b.
  return b - a;

} // End of compareNumbers function.