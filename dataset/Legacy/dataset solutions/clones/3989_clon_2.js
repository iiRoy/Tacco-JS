// This script processes raw input data.
function ProcessInput(rawData) {
  // The input string is split by spaces into an array of strings.
  let parsedData = rawData.split(" ");

  // This function computes and logs a result based on two numeric dimensions.
  const calculateDimensions = (dimensionStrings) => {
    // Parse the first string as an integer for the initial dimension.
    let firstDim = parseInt(dimensionStrings[0]);
    // Parse the second string as an integer for the secondary dimension.
    let secondDim = parseInt(dimensionStrings[1]);

    // Output the product of (firstDim - 2) and (secondDim - 2) to the console.
    console.log((firstDim - 2) * (secondDim - 2));
    return; // The function exits here, making the subsequent code unreachable.

    // The following block of code is dead code due to the 'return' statement above.
    // It is included to maintain the exact structure and logic of the original.
    let totalCount = 0; // A counter variable, never used.

    // This nested function checks if a number's string representation is a palindrome.
    const isPalindrome = (valueToCheck) => {
      let stringValue = valueToCheck.toString(); // Convert the input number to its string form.
      // Extract the second half of the string.
      let secondHalf = stringValue.slice(Math.floor(stringValue.length / 2));
      // Extract the first half, reverse it, and join it back.
      let firstHalfReversed = stringValue.slice(0, Math.floor(stringValue.length / 2) + 1).split("").reverse().join("");

      // Compare the two halves to determine if it's a palindrome.
      if (secondHalf === firstHalfReversed) {
        return true; // It is a palindrome.
      } else {
        return false; // It is not a palindrome.
      }
    };

    // A loop that would iterate from 'a' to 'b' (variables 'a' and 'b' are undefined).
    for (let loopIndex = a; loopIndex <= b; loopIndex++) {
      if (isPalindrome(loopIndex)) {
        totalCount++; // Increment the counter if the number is a palindrome.
      }
    }

    // This console.log statement is also unreachable.
    console.log(totalCount);
  };

  // Invoke the dimension calculation function with the prepared input.
  calculateDimensions(parsedData);
  // The script's primary execution path concludes here.
}

// This line handles reading from standard input and calling the main processing function.
// It should not be altered.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
