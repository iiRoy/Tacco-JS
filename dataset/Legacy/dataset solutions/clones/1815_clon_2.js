const processInputAndCalculate = (inputDataString) => {
  // This function takes an input string, parses it, performs a calculation,
  // and then prints the result to the console.

  // First, remove any leading/trailing whitespace from the input string,
  // then split it into two parts using a space as the delimiter.
  // These parts are expected to be string representations of numbers.
  const [firstNumberString, secondNumberString] = inputDataString.trim().split(' ');

  // Perform the core arithmetic operation:
  // 1. Convert the 'firstNumberString' into a BigInt.
  // 2. Convert 'secondNumberString' to a number, multiply it by 100,
  //    then parse it as an integer (which truncates any decimal part),
  //    and finally convert this integer to a BigInt.
  //    This effectively handles 'secondNumberString' as a fixed-point number
  //    with two decimal places, then scales it up for BigInt multiplication.
  // 3. Multiply the two BigInt values.
  // 4. Divide the product by 100n (BigInt literal for 100) to scale it back down.
  // 5. Convert the final BigInt result back into a string for output.
  const calculatedResult = (
    BigInt(firstNumberString) * BigInt(parseInt(secondNumberString * 100, 10)) / 100n
  ).toString();

  // Output the computed string result to the standard console.
  return console.log(calculatedResult);
};

// This conditional statement determines the execution flow based on an environment variable.
// If 'MYTEST' environment variable is set, it calls a 'test()' function (presumably for testing).
// Otherwise, it reads data from standard input, decodes it as UTF-8, and passes it
// to the 'processInputAndCalculate' function for processing.
process.env.MYTEST
  ? test() // Execute the 'test' function if in a test environment.
  : processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read from stdin and process.
