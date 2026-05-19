const ProcessInput = function (initialString) {
  // This helper function reverses a given string.
  function reverseString(originalText) {
    let textObject = new String(originalText);
    let reversedResult = "";
    for (let idx = textObject.length; idx > 0; idx--) {
      reversedResult += textObject.charAt(idx - 1);
    }
    return reversedResult;
  }

  let inputStrObj = new String(initialString);
  let strLength = inputStrObj.length;

  // First, print the reversed version of the initial string.
  console.log(reverseString(initialString));

  // Check if the entire string is a palindrome.
  if (reverseString(initialString) === initialString) {
    // If it is, check the first half (excluding the middle character for odd lengths).
    let firstHalf = inputStrObj.substring(0, (strLength - 1) / 2);

    // Check if the first half is also a palindrome.
    if (reverseString(firstHalf) === firstHalf) {
      // If both are palindromes, check the second half.
      // The second half starts after the middle character (for odd lengths) and ends before the last character.
      let secondHalf = inputStrObj.substring((strLength + 3) / 2 - 1, strLength);

      // Check if the second half is a palindrome.
      if (reverseString(secondHalf) === secondHalf) {
        console.log("Yes"); // All conditions met.
      } else {
        console.log("No"); // Second half not a palindrome.
      }
    } else {
      console.log("No"); // First half not a palindrome.
    }
  } else {
    console.log("No"); // Initial string not a palindrome.
  }
};

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
