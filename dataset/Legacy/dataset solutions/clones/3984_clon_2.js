function ProcessInput(rawData) {
  // The raw input string is split into an array of substrings based on space delimiters.
  var parsedData = rawData.split(" ");

  // This anonymous function encapsulates the core logic for counting palindromic numbers.
  var calculatePalindromeCount = (numericStrings) => {
    // Parse the first two elements of the input array as integers to define the range.
    var startNum = parseInt(numericStrings[0]);
    var endNum = parseInt(numericStrings[1]);

    // Initialize a variable to keep track of the total number of palindromes found.
    var palindromeCounter = 0;

    // This nested function determines if a given number is a palindrome based on its string representation.
    var isPalindrome = (currentNumber) => {
      // Convert the numeric input into a string for character-by-character analysis.
      var numAsString = currentNumber.toString();
      // Extract the latter half of the string. For odd lengths, this starts from the middle character.
      var secondHalf = numAsString.slice(Math.floor(numAsString.length / 2));
      // Extract the first half (including the middle character for odd lengths), reverse it, and join back.
      var firstHalfReversed = numAsString.slice(0, Math.floor(numAsString.length / 2) + 1).split("").reverse().join("");

      // Compare the two halves. If they are identical, the number is considered a palindrome.
      if (secondHalf === firstHalfReversed) {
        return true;
      } else {
        // Otherwise, it is not a palindrome.
        return false;
      }
    };

    // Iterate through each integer from the starting number to the ending number (inclusive).
    for (var currentValue = startNum; currentValue <= endNum; currentValue++) {
      // Check if the current number is a palindrome using the helper function.
      if (isPalindrome(currentValue)) {
        // If it is, increment the palindrome counter.
        palindromeCounter++;
      }
    }

    // Output the final tally of palindromic numbers to the console.
    console.log(palindromeCounter);
  };

  // Invoke the palindrome counting function, passing the prepared input data.
  calculatePalindromeCount(parsedData);
}

// The following lines are responsible for reading standard input and initiating the program.
// They should remain unchanged to ensure proper execution in the target environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
