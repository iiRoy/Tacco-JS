function processInput(rawData) {
  // This function takes a string of space-separated numbers as input.
  // It aims to find a specific common divisor of the first two numbers.
  const parameters = rawData.split(' ');

  // Parse the first number from the input string.
  const firstNum = Number(parameters[0]);
  // Parse the second number from the input string.
  const secondNum = Number(parameters[1]);
  // Parse the index 'K' for the K-th largest common divisor.
  const targetIndex = Number(parameters[2]);

  // Determine which of the two numbers is smaller and which is larger.
  // This helps in optimizing the search for divisors.
  const [smallerVal, largerVal] = firstNum < secondNum ? [firstNum, secondNum] : [secondNum, firstNum];

  // Generate a list of all common divisors between 1 and 'smallerVal'.
  const commonDivisors = Array.from(new Array(smallerVal), (_, idx) => idx + 1).reduce((accumulator, currentDivisor) => {
    // Check if 'currentDivisor' divides both 'smallerVal' and 'largerVal' evenly.
    if (Number.isInteger(smallerVal / currentDivisor) && Number.isInteger(largerVal / currentDivisor)) {
      // If it's a common divisor, add it to our list.
      return [...accumulator, currentDivisor];
    }
    // Otherwise, continue with the existing list.
    return accumulator;
  }, []); // Start with an empty array of common divisors.

  // The 'commonDivisors' array is sorted in ascending order.
  // To get the K-th largest, we need to access it from the end of the array.
  // 'splice' modifies the array and returns an array of removed elements.
  // We want the element at (length - targetIndex) position.
  // The [0] at the end extracts the single element from the returned array.
  console.log(commonDivisors.splice(commonDivisors.length - targetIndex, 0b1)[0]);
}
