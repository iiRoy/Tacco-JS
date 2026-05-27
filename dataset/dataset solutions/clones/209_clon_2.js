require("fs")
  .readFileSync("/dev/stdin", "utf8") // Obtain content from standard input using UTF-8 encoding
  .split('\n') // Divide the input content into an array of strings, splitting by newline characters
  .map(function(inputStr) { // Iterate over each string element in the array
    let numVal = +inputStr; // Convert the current input string to a numerical value
    let resultAccumulator = 0; // Initialize a variable to accumulate the sum for the current number

    // Proceed only if the numerical value is truthy (i.e., not zero or falsy)
    if (numVal) {
      // Continuously perform integer division by 5 and add the result to the accumulator
      // The loop continues as long as the result of the division is non-zero
      while (numVal = Math.floor(numVal / 5)) { // Update numVal with its integer division by 5
        resultAccumulator += numVal; // Add the new numVal to the running total
      }
      console.log(resultAccumulator); // Output the final calculated sum for the current input line
    }
    // If numVal is 0 or falsy, no action is taken, mirroring the original's ternary '0' branch.
  });
