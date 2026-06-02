function ProcessInput(rawData) {
  // Split the incoming string by spaces to get individual components.
  let parsedData = rawData.split(" ");

  // Extract the first character from the parsed data.
  let firstChar = parsedData[0];

  // Extract the second character from the parsed data.
  let secondChar = parsedData[1];

  // Initialize a variable to store the final outcome character.
  let resultChar;

  // Evaluate conditions based on the first character.
  if (firstChar !== "H") {
    // If the first character is not 'H'.
    if (secondChar === "H") {
      // If the second character is 'H', the result is 'D'.
      resultChar = "D";
    } else {
      // Otherwise (second character is not 'H'), the result is 'H'.
      resultChar = "H";
    }
  } else {
    // If the first character is 'H'.
    if (secondChar === "H") {
      // If the second character is 'H', the result is 'H'.
      resultChar = "H";
    } else {
      // Otherwise (second character is not 'H'), the result is 'D'.
      resultChar = "D";
    }
  }

  // Output the determined result character to the console.
  console.log('%s', resultChar);
}

// This function is for local testing purposes, typically triggered by a UI element.
function testFunction() {
  // Retrieve the value from an HTML input element with ID "input".
  let domInputVal = document.getElementById("input").value;
  // Pass the retrieved value to the primary processing function.
  ProcessInput(domInputVal);
}

// Execute the main processing function using input read from standard input,
// which is common in competitive programming environments.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
