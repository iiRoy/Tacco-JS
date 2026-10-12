function ProcessData(incomingText) {
  // The entire input data is initially in 'incomingText'.
  incomingText = incomingText.split("\n"); // Divide the input by newline characters into an array.
  incomingText = incomingText[0]; // Retain only the first line of the input.

  var finalOutput = ""; // Initialize an empty string to accumulate characters.
  console.log(incomingText); // Print the first line of the input to the console.

  // Iterate through the characters of the first line, selecting every other character.
  for (var counter = 1; counter <= incomingText.length; counter = counter + 2) {
    finalOutput += incomingText[counter - 1]; // Append the character at the current 0-indexed position to the result.
  }

  console.log(finalOutput); // Display the final constructed string.
}

// The following line should not be altered (it handles reading from standard input and invoking the main processing function).
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
