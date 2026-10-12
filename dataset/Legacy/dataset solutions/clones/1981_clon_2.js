process.stdin.setEncoding('utf-8'); // Configure standard input for UTF-8 character encoding

// Attach an event handler for incoming data on the standard input stream
process.stdin.on('data', function (inputVal) {
  // Initialize a variable to accumulate the total result
  let totalResult = 0;

  // Loop from 1 up to, but not including, the numeric value of the input plus one
  // This effectively iterates from 1 to the input value (inclusive)
  for (let counter = 1; counter < Number(inputVal) + 1; counter++) {
    // Check if the current counter value is not divisible by 3 AND not divisible by 5
    if (counter % 3 !== 0 && counter % 5 !== 0) {
      // If the condition is met, add the current counter value to the running total
      totalResult = totalResult + counter;
    }
  }

  // Output the final calculated total to the console
  console.log(totalResult);
});
