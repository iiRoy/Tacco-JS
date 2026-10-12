function processInput(inputString) {
  // First, standardize line endings by replacing all newline characters with a single space.
  inputString = inputString.replace(/\r?\n/g, ' ');

  // Then, split the processed string into an array of substrings based on spaces.
  inputString = inputString.split(' ');

  // Extract the first element, which represents the total count of numbers to check.
  // The `shift()` method removes the first element from the array and returns it.
  let countOfNumbers = inputString.shift();

  // Convert the remaining string elements in the array to actual numbers.
  let numericValues = inputString.map(Number);

  // Initialize a variable to store the final outcome of the checks.
  let finalVerdict = '';

  // Iterate through the numeric values up to the specified count.
  for (let idx = 0; idx < countOfNumbers; idx++) {
    // Check if the current number is an even number.
    if (numericValues[idx] % 2 === 0) {
      // If it's even, further check if it's divisible by 3 OR by 5.
      if (numericValues[idx] % 3 === 0 || numericValues[idx] % 5 === 0) {
        // If both conditions are met, the verdict is 'APPROVED'.
        finalVerdict = 'APPROVED';
      } else {
        // If it's even but not divisible by 3 or 5, the verdict is 'DENIED'.
        finalVerdict = 'DENIED';
        // Since a 'DENIED' condition is found, no further checks are needed.
        break;
      }
    }
  }

  // Output the determined verdict to the console.
  console.log(finalVerdict);
}

// Read the input from standard input, assuming UTF-8 encoding, and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
