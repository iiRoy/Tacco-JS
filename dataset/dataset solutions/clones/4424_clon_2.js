/*
 * This function processes a string of numerical data to compute a specific value.
 * It reads numbers, sorts them, and then calculates their Least Common Multiple (LCM).
 * @param {string} rawInputText - The raw input string containing numbers, separated by newlines.
 */
const calculateFinalResult = function (rawInputText) {
  // Parse the input string into an array of integers.
  let numericValues = rawInputText.split('\n')
                                  .filter( item => item.trim() !== '' ) // Remove any empty lines after splitting.
                                  .map( entry => parseInt(entry, 10) ); // Convert each non-empty string to an integer.

  // The first number in the sequence is treated as a special parameter or a count.
  const numberOfElements = numericValues.shift(); 

  // Sort the remaining numbers in descending order.
  let orderedList = numericValues.sort( (valA, valB) => valB - valA ); 

  // If there was only one number initially (excluding the shifted one, which means the list is empty or the shifted one was the only one),
  // return the first (and only) element of the sorted list.
  if ( numberOfElements === 1 ) { 
    return orderedList[0];
  }

  // Otherwise, compute the Least Common Multiple (LCM) of all numbers in the sorted list.
  // LCM(a, b) = (a * b) / GCD(a, b)
  return orderedList.reduce( (currentAccumulator, nextElement) => { 
    const commonFactor = findCommonDivisor(currentAccumulator, nextElement); // Find the GCD of the current result and the next element.
    return (currentAccumulator * nextElement) / commonFactor; // Calculate LCM.
  });

  // Helper function to determine the greatest common divisor (GCD) using the Euclidean algorithm.
  // This is a private utility function for the main calculation logic.
  function findCommonDivisor(firstNum, secondNum) {
    if ( secondNum === 0 ) {
      return firstNum;
    } else {
      return findCommonDivisor(secondNum, firstNum % secondNum); // Recursive call for GCD calculation.
    }
  }
}; // End of calculateFinalResult function definition.

// Execute the main processing logic using data from standard input and print the final computed value.
console.log(calculateFinalResult(require("fs").readFileSync("/dev/stdin", "utf8")));