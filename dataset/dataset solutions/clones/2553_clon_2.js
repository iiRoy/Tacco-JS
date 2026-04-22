function ProcessInputData(rawData) {
  // Break down the incoming text into individual lines
  let lineSegments = rawData.split("\n");

  // Extract the initial line and further split it by space characters
  let firstLineElements = lineSegments[0].split(" ");

  // Designate the first element as the primary sequence for validation
  let targetSequence = firstLineElements[0];

  // Initialize a boolean-like result indicator to "Yes"
  let validationResult = "Yes";

  /* Iterate through each character of the primary sequence to perform checks */
  for (let currentPosition = 0; currentPosition < targetSequence.length; currentPosition++) {

    // Determine the valid character set based on the 1-indexed position's parity
    var allowedCharacters; // Using 'var' to maintain original statement count and scope semantics
    if ((currentPosition + 1) % 2 === 0) {
      // For character positions that are even (e.g., 2nd, 4th, etc.)
      allowedCharacters = "LUD";
    } else {
      // For character positions that are odd (e.g., 1st, 3rd, etc.)
      allowedCharacters = "RUD";
    }

    // Check if the character at the current position is not permitted
    if (allowedCharacters.indexOf(targetSequence.substring(currentPosition, 1)) === -1) {
      // If an invalid character is encountered, update the result and terminate the loop
      validationResult = "No";
      break;
    }
  }

  // Display the final determined outcome
  console.log(validationResult);
}

// Execute the main function, reading content from standard input synchronously
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));