// This function serves as the primary entry point for processing the given input.
function ProcessInput(rawData) {
  // The input string is broken down into an array of individual characters.
  const charArray = rawData.split("");
  // An array is initialized to store the determined arithmetic operators (+ or -).
  let operationSigns = [];

  /**
   * This recursive helper function attempts to find a sequence of operations
   * that leads to a specific target sum.
   * @param {number} currentIndex - Represents the current position (from right to left) in the character array being evaluated.
   * @param {number} currentSum - The running total accumulated during the recursive calls.
   * @returns {boolean} Returns true if a valid combination is discovered, otherwise false.
   */
  function CalculatePath(currentIndex, currentSum) {
    // Base condition: When all characters have been processed (reached the beginning of the array).
    if (currentIndex === 0) {
      // If the final accumulated sum matches the desired target (which is 0 in this recursive context,
      // as we're working towards an overall sum of 7), a solution has been found.
      if (currentSum === 0) {
        return true; // A successful path is identified.
      }
    } else {
      // Recursive step: First, attempt to add the numeric value of the current character.
      // The character is converted to a number using the Number constructor.
      if (CalculatePath(currentIndex - 1, currentSum + Number(charArray[currentIndex - 1])) === true) {
        // If adding the number leads to a solution, it implies that the operation
        // applied to this number in the final expression should be a subtraction.
        operationSigns[currentIndex - 1] = "-";
        return true;
      }
      // If adding did not yield a solution, then attempt to subtract the numeric value.
      else if (CalculatePath(currentIndex - 1, currentSum - Number(charArray[currentIndex - 1])) === true) {
        // If subtracting the number leads to a solution, it implies that the operation
        // applied to this number in the final expression should be an addition.
        operationSigns[currentIndex - 1] = "+";
        return true;
      }
      // If neither adding nor subtracting the current number results in a valid path,
      // then this particular branch of the recursion is unsuccessful.
      else {
        return false;
      }
    }
    // If the base case is met (currentIndex is 0) but the currentSum is not 0, return false.
    return false;
  }

  // Initiate the recursive search process. We start with 4 characters to process
  // and an initial target sum of 7.
  if (CalculatePath(4, 7) === true) {
    // If the recursive function successfully finds a path,
    // the resulting arithmetic expression is constructed and printed to the console.
    console.log(charArray[0] + operationSigns[1] + charArray[1] + operationSigns[2] + charArray[2] + operationSigns[3] + charArray[3] + "=7");
  } else {
    // If no valid combination of operations is found to reach the target sum,
    // an error message is displayed.
    console.log("program error");
  }
}

// The program reads its input from standard input, assuming UTF-8 encoding,
// and then passes this data to the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
