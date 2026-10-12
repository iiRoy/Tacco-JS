function ProcessInput(rawData) {
  // Declare a variable to hold the initial string
  let initialString;
  // Split the raw input data into an array of lines
  const lineData = rawData.split("\n");
  // The first line of input is our target string
  initialString = lineData[0];
  // Initialize the minimum number of attempts required to -1 (indicating not yet found)
  let minimumAttempts = -1;

  // Iterate through all lowercase English alphabet characters
  // This loop tries each character ('a' through 'z') as the potential final character
  for (let charIndex = "a".charCodeAt(0); charIndex < "z".charCodeAt(0) + 1; charIndex++) {
    // Check if the initial string already consists of a single repeated character
    // If it does, no operations are needed, so the attempt count is 0
    if (/^([a-z])\1*$/.test(initialString)) {
      minimumAttempts = 0;
      break; // Exit the outer loop as the minimum is 0
    }

    // Create a temporary string for the current propagation process
    let currentString = initialString;
    // Initialize an empty string to build the result of each propagation step
    let nextString = "";
    // Convert the current character code back to a character
    const targetChar = String.fromCharCode(charIndex);
    // Initialize the attempt counter for the current target character
    let currentAttempts = 0;

    // This loop simulates the propagation process until the string becomes uniform
    while (true) {
      // Iterate through the current string, excluding the last character
      // This loop builds the 'nextString' based on 'currentString' and 'targetChar'
      for (let position = 0; position < currentString.length - 1; position++) {
        // If the character at the current position matches the target character
        if (targetChar === currentString.charAt(position)) {
          nextString += targetChar; // Append the target character
        }
        // Else, if the character at the next position matches the target character
        else if (targetChar === currentString.charAt(position + 1)) {
          nextString += targetChar; // Append the target character
        }
        // Otherwise, no propagation occurs from adjacent characters, so keep the original character
        else {
          nextString += currentString.charAt(position); // Append the original character
        }
      }

      // Increment the attempt counter after one full propagation step
      currentAttempts++;

      // Check if the 'nextString' now consists of a single repeated character
      if (/^([a-z])\1*$/.test(nextString)) {
        break; // Exit the inner while loop if the string is uniform
      }

      // Prepare for the next iteration: the 'nextString' becomes the 'currentString'
      currentString = nextString;
      // Reset 'nextString' for the next propagation step
      nextString = "";
    }

    // After the propagation for a 'targetChar' is complete,
    // update the overall minimum attempts if the current character's attempts are fewer
    if (minimumAttempts === -1 || minimumAttempts > currentAttempts) {
      minimumAttempts = currentAttempts;
    }
  }

  // Output the final calculated minimum number of attempts
  console.log(minimumAttempts);
}

// Do not modify the following line; it handles standard input/output
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
