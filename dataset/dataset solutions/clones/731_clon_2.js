process.stdin.resume();

process.stdin.setEncoding('utf8'); // Configure the standard input stream to use UTF-8 encoding.

process.stdin.on('data', function(inputData) {
  // This function is executed when data is received from standard input.
  // The 'inputData' parameter contains the raw string data.

  // Split the incoming data by newline characters to process each line separately.
  let linesOfInput = inputData.split('\n');

  // Iterate over each line using a for...in loop, which provides the index of each line.
  for (let lineIndex in linesOfInput) {
    // For the current line, split it by spaces to get an array of string representations of numbers.
    let parsedNumbers = linesOfInput[lineIndex].split(' ');

    // Check if any of the first three elements are non-zero after a bitwise OR operation.
    // This acts as a quick check for valid input lines that are not entirely empty or '0 0 0'.
    if (parsedNumbers[0] | parsedNumbers[1] | parsedNumbers[2]) {
      // Convert the string elements to integers using a bitwise OR with 0.
      // This is a common JavaScript idiom for type coercion to integer.
      parsedNumbers[0] |= 0;
      parsedNumbers[1] |= 0;
      parsedNumbers[2] |= 0;

      // Initialize a variable to keep track of the maximum calculated value.
      let maximumValue = 0;

      // Calculate the first scaling factor based on the first input number.
      const factorA = parsedNumbers[0] / 100 + 1;
      // Calculate the second scaling factor based on the second input number.
      const factorB = parsedNumbers[1] / 100 + 1;

      // Begin a nested loop structure to explore combinations of two counters.
      // The outer loop iterates from 1 up to (but not including) 1000.
      for (let firstCounter = 1; firstCounter < 1000; firstCounter++) {
        // The inner loop also iterates from 1 up to (but not including) 1000.
        for (let secondCounter = 1; secondCounter < 1000; secondCounter++) {
          // Calculate a temporary sum using 'firstCounter', 'secondCounter', and 'factorA'.
          // The result of the multiplication is converted to an integer using bitwise OR with 0.
          // If this temporary sum matches the third input number, proceed.
          if ((firstCounter * factorA | 0) + (secondCounter * factorA | 0) === parsedNumbers[2]) {
            // If the condition is met, calculate a new potential maximum value using 'factorB'.
            // Update 'maximumValue' if the newly calculated value is greater than the current 'maximumValue'.
            maximumValue = Math.max(maximumValue, (firstCounter * factorB | 0) + (secondCounter * factorB | 0));
          }
        }
      }
      // After checking all combinations for the current line, print the final maximum value.
      console.log(maximumValue);
    }
  }
});
