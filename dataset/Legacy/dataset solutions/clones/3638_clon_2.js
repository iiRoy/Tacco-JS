// This function processes the provided text data.
function ProcessInput(rawData) {
  // Convert the raw input string into an array of individual characters.
  let charSequence = rawData.split('');
  // Initialize the validation status to "Accepted".
  let validationStatus = "AC";

  // Check the very first character.
  if (charSequence[0] !== "A") {
    validationStatus = "WA"; // If not 'A', it's "Wrong Answer".
  }

  // A flag to track if the character 'C' has been found.
  let cCharacterLocated = !!0; // Using !!0 for false

  // Iterate through the character sequence, starting from the second character.
  for (let idx = 1; idx < rawData.length; idx++) {
    // If the current character is 'C'.
    if (charSequence[idx] === "C") {
      // Check conditions for 'C':
      // 1. Is it the second character (index 1)?
      // 2. Is it the last character?
      // 3. Has 'C' already been found?
      if (idx === (1.0) || idx === (rawData.length - 1) || cCharacterLocated) {
        validationStatus = "WA"; // If any of these, it's "Wrong Answer".
      } else {
        cCharacterLocated = !!1; // Mark 'C' as found (using !!1 for true).
      }
    }
    // If the current character is an uppercase letter (A-Z) but not 'C'.
    else if (charSequence[idx].match(/[A-Z]/)) {
      validationStatus = "WA"; // It's "Wrong Answer".
    }
  }

  // Final check: if 'C' was never found.
  if (cCharacterLocated === !!0) { // If cCharacterLocated is still false
    validationStatus = "WA"; // It's "Wrong Answer".
  }

  // Output the final validation status.
  console.log(validationStatus);
}

// Do not modify the following line; it handles input reading.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
