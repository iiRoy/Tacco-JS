console.log((inputData => {
  // Parse the input string:
  // 1. Remove leading/trailing whitespace.
  // 2. Split into lines.
  // 3. For each line, split by space and convert parts to integers.
  // 4. Destructure the result: first element of first line is numElements, second line is inputArray.
  const [[numElements], inputArray] = inputData.trim().split('\n').map(lineStr => lineStr.split(' ').map(strVal => strVal | 0));

  // Initialize an array to store counts and a modulo constant.
  // The array 'elementCounts' will have a size of numElements + 1, filled with zeros.
  const elementCounts = Array(numElements + 1).fill(0);
  const primeModulo = 1000000007; // A large prime number for modulo operations.

  // Set the initial count for the zero index.
  elementCounts[0] = 3;

  // Initialize the accumulator for the final product.
  let finalProduct = 1;

  // Iterate through the inputArray to perform calculations.
  for (let idx = 0; idx < numElements; idx++) {
    // Update the final product using the current element's count and modulo.
    finalProduct = (finalProduct * elementCounts[inputArray[idx]]) % primeModulo;

    // Decrement the count for the current element's value.
    elementCounts[inputArray[idx]]--;

    // Increment the count for the next consecutive value.
    elementCounts[inputArray[idx] + 1]++;
  }

  // Return the final calculated product as a string.
  return `${finalProduct}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
