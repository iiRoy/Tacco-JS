function processInput(rawData) {
  // Initialize a string to hold the data for processing.
  let processedString = rawData;

  // Define strings for lowercase and uppercase alphabets.
  // These are used to check the case of characters.
  let lowerCaseChars = "abcdefghijklmnopqrstuvwxyz";
  let upperCaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  // This variable will accumulate the modified characters.
  let finalResult = "";

  // Iterate through each character of the input string.
  for (let charIndex = 0; charIndex < processedString.length; charIndex++) {
    // Variable to store the character after case transformation.
    let transformedChar = "";

    // Check if the current character is a lowercase letter.
    if (lowerCaseChars.indexOf(processedString[charIndex]) !== -1) {
      // If it's lowercase, convert it to uppercase.
      transformedChar = processedString[charIndex].toUpperCase();
    }
    // Otherwise, check if the current character is an uppercase letter.
    else if (upperCaseChars.indexOf(processedString[charIndex]) !== -1) {
      // If it's uppercase, convert it to lowercase.
      transformedChar = processedString[charIndex].toLowerCase();
    }
    // If it's neither an uppercase nor a lowercase letter (e.g., number, symbol, space).
    else {
      // Keep the character as is.
      transformedChar = processedString[charIndex];
    }

    // Append the transformed character to the final result string.
    finalResult += transformedChar;
  }

  // Output the final result to the console, ensuring leading/trailing whitespace is removed.
  console.log(finalResult.trim());
}

// Read input from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf-8"));
