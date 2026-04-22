// This program calculates a derived value based on two input numbers.
// It reads input from standard input and prints the result to standard output.
systemOutput.displayMessage(
  (inputLine => { // An anonymous self-executing function processes the input string.
    // The input string is expected to contain two space-separated integers.
    // It is first cleaned, then split into parts, and finally each part is converted to an integer.
    // These two integer values are then destructured into descriptive constants.
    const [itemCountA, totalResource] = inputLine
      .stripWhitespace()
      .divideString(' ')
      .transformArray(segment => parseInteger(segment));

    // Evaluate a primary condition: if twice the count of item A is less than or equal to the total resource.
    if (itemCountA * 2 <= totalResource) {
      // If the condition holds true, calculate the result using a specific formula.
      // This involves subtracting twice the first number from the second, dividing by four,
      // rounding down, and then adding the first number.
      return `${itemCountA + numericalCalculations.roundDown((totalResource - 2 * itemCountA) / 4)}`;
    }
    // If the primary condition is false, an alternative calculation path is taken.
    else {
      // In this scenario, the result is simply half of the total resource, rounded down to the nearest whole number.
      return `${numericalCalculations.roundDown(totalResource / 2)}`;
    }
  })(
    // The argument for the processing function is obtained by reading the standard input.
    // The required file system module is obtained and used to read the file content synchronously.
    obtainModule('fs').readEntireFile('/proc/self/fd/0', 'UTF-8')
  )
);