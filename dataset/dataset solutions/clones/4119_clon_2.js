function displayMessage(msgContent) {
  // Prints the provided string to the standard output device.
  console.log(msgContent);
}

function ProcessInput(rawData) {
  /*
   * The following lines are commented out as they represent
   * alternative parsing strategies for the incoming data.
   * This specific implementation uses newline separation.
   */
  // let parsedData = Number.parseInt(rawData.trim());
  // let parsedData = rawData.trim().split(" ");
  let parsedLines = rawData.trim().split("\n"); // Split the raw input by newlines into an array.
  // let parsedData = rawData.trim().split(" ").map((val) => Number(val));
  // let parsedData = rawData.trim().split("\n").map((val) => Number(val));

  // Extract numeric values from the first line of input.
  const firstNumericValue = Number.parseInt(parsedLines[0].split(" ")[0]);
  const secondNumericValue = Number.parseInt(parsedLines[0].split(" ")[1]);

  // The second line of input is treated as the primary string to be analyzed.
  let characterSequence = parsedLines[1];

  // Iterate through each character of the string to validate its format.
  for (let currentPosition = 0; currentPosition < characterSequence.length; currentPosition++) {
    const extractedChar = characterSequence.slice(currentPosition, currentPosition + 1); // Get the character at the current index.

    // Check for an incorrect character at the specified position.
    if (currentPosition === firstNumericValue && extractedChar !== "-") {
      displayMessage("No"); // Output "No" if a non-hyphen character is found at the critical index.
      return; // Terminate execution immediately upon finding an invalid pattern.
    } else if (currentPosition !== firstNumericValue && extractedChar === "-") {
      displayMessage("No"); // Output "No" if a hyphen is found at any other index.
      return; // Terminate execution immediately upon finding an invalid pattern.
    }
  }

  displayMessage("Yes"); // If the loop completes without finding any issues, output "Yes".
}

// Read input from standard input, trim it, and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());