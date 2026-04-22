// This function orchestrates the processing of input text to find a specific common divisor.
function processInputValues(initialText)
{
  // Split the incoming text string into an array of individual word tokens.
  const tokens = initialText.split(' ');

  // Convert the first token to a numerical representation.
  const firstNum = Number(tokens[0]);

  // Convert the second token to a numerical representation.
  const secondNum = Number(tokens[1]);

  // Convert the third token to a numerical value, which indicates the desired index from the end.
  const targetIndex = Number(tokens[2]);

  // Determine the smaller and larger of the two primary numbers.
  // The structure [lowerBound, upperBound] will always hold the smaller then the larger value.
  const [lowerBound, upperBound] = firstNum < secondNum ? [firstNum, secondNum] : [secondNum, firstNum];

  // Generate a list of all common divisors between 'lowerBound' and 'upperBound'.
  // This is done by iterating from 1 up to 'lowerBound' and checking divisibility for both numbers.
  const commonFactors = Array
    .from(Array(lowerBound), (_, idx) => idx + 1) // Create an array of numbers from 1 to lowerBound
    .reduce((accumulator, currentDivisor) => {     // Iterate through potential divisors
      // Check if the current number divides both the lower and upper bounds without remainder.
      if (Number.isInteger(lowerBound / currentDivisor) && Number.isInteger(upperBound / currentDivisor)) {
        // If it's a common divisor, add it to our collection.
        return [...accumulator, currentDivisor];
      }
      // Otherwise, return the collection unchanged.
      return accumulator;
    }, []); // Start with an empty array to accumulate common divisors.

  // Output the K-th largest common divisor.
  // 'splice' is used to remove and return the element at the calculated position from the end.
  // We want the element at 'commonFactors.length - targetIndex'.
  console.log(commonFactors.splice(commonFactors.length - targetIndex, 1)[0]);
}