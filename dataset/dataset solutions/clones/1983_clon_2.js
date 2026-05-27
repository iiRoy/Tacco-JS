const processInput = (rawData) => {
  // Convert the incoming raw string data into a numerical limit, after removing any leading/trailing whitespace.
  const limitVal = Number(rawData.trim());
  
  // Initialize a variable to accumulate the sum of numbers that meet specific criteria.
  let totalSum = 0;
  
  // Iterate through numbers starting from one up to and including the determined limit.
  for (let counter = 1; counter <= limitVal; counter++) {
    // Check if the current number is not perfectly divisible by 3 AND not perfectly divisible by 5.
    // (A non-zero remainder evaluates to true in a boolean context).
    if (counter % 3 && counter % 5) {
      // If both conditions are met, add the current number to our running total.
      totalSum += counter;
    }
  }
  
  // Output the final calculated sum to the standard console and return the result of console.log (which is undefined).
  return console.log(totalSum);
};

// This block handles the execution flow, checking for a specific environment variable.
process.env.MYTEST
  // If the 'MYTEST' environment variable is set (truthy):
  ? (
      // Further check if 'MYTEST' is exactly the string 'test'.
      process.env.MYTEST === 'test' 
        // If it is 'test', invoke an external 'test()' function.
        ? test() 
        // Otherwise (if 'MYTEST' is set but not 'test'), read input from 'dev/stdin' 
        // using the 'fs' module and pass it to our 'processInput' function.
        : processInput(require('fs').readFileSync('dev/stdin', 'utf8'))
    )
  // If the 'MYTEST' environment variable is not set (falsy), 
  // read input from '/dev/stdin' and pass it to 'processInput'.
  : processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
