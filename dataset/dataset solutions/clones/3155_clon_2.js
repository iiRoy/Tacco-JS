function processInput(rawData) {
  // This function processes the given input string to find a specific common divisor.

  // Split the raw input string by spaces to get an array of string tokens.
  const tokens = rawData.split(' ');

  // Convert the string tokens into numerical values for calculations.
  let firstNum = Number(tokens[0]);
  let secondNum = Number(tokens[1]);
  let targetIndex = Number(tokens[2]);

  // Create an array containing the two numbers in ascending order.
  let orderedPair = firstNum < secondNum ? [firstNum, secondNum] : [secondNum, firstNum];

  // Generate a list of all common divisors between the two numbers.
  // It iterates from 1 up to the smaller number (orderedPair[0]).
  let commonDivisors = Array.from(
    Array(orderedPair[0]),
    (
      _, // Placeholder for the value, as it's not used
      idx // Current index, which will be 0-based
    ) => idx + 1 // Transform index to a 1-based number
  ).reduce(
    (
      accumulator, // The array accumulating common divisors
      currentDivisor // The number being tested as a potential divisor
    ) => {
      // Check if the current number divides both elements of the ordered pair evenly.
      if (
        Number.isInteger(orderedPair[0] / currentDivisor) &&
        Number.isInteger(orderedPair[1] / currentDivisor)
      ) {
        // If it's a common divisor, add it to our accumulator array.
        accumulator.push(currentDivisor);
        return accumulator;
      }
      // Otherwise, return the accumulator unchanged.
      return accumulator;
    },
    [] // Initialize the accumulator as an empty array.
  );

  // Extract the K-th (targetIndex-th) largest common divisor.
  // The splice method modifies the array and returns an array of removed elements.
  const finalAnswer = commonDivisors.splice(
    commonDivisors.length - targetIndex, // Calculate the starting index from the end
    1 // Remove only one element
  )[0]; // Get the first (and only) element from the returned array.

  // Output the final computed result to the standard output.
  console.log(finalAnswer);
}

// Read the entire content from standard input ('/dev/stdin') as a UTF-8 string,
// then pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));