process.stdin.setEncoding('utf-8'); // Configure standard input for UTF-8 character encoding.

// Attach an event listener to process standard input data.
process.stdin.on('data', function (inputLine) {
  // Split the incoming line by space to get individual arguments.
  const parsedValues = inputLine.split(' ');

  // Extract the first value from the parsed array.
  let firstVal = parsedValues[0];
  // Extract the second value from the parsed array.
  let secondVal = parsedValues[1];

  // Determine the final result based on a conditional expression.
  // If firstVal is less than or equal to secondVal, use firstVal; otherwise, use firstVal minus one.
  let resultValue = (firstVal <= secondVal) ? firstVal : firstVal - 1;

  // Output the calculated result to the console.
  console.log(resultValue);
});
