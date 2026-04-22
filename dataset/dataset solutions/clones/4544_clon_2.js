// This module handles character validation against an alphabet.
function ProcessInput(incomingText) {
  // Normalize the input string by removing leading/trailing whitespace.
  incomingText = incomingText.trim();

  // Define the set of available lowercase English alphabet characters.
  const characterPool = "abcdefghijklmnopqrstuvwxyz".split("");

  // Iterate through each character of the provided input string.
  for (let charIndex = 0; charIndex < incomingText.length; charIndex++) {
    // Extract the current character for examination.
    let currentChar = incomingText.slice(charIndex, charIndex + 1);

    // Check if the current character exists within our character pool.
    if (characterPool.indexOf(currentChar) !== -1) {
      // If found, remove it from the pool to ensure unique usage.
      characterPool.splice(characterPool.indexOf(currentChar), 1);
    } else {
      // If a character is not found in the pool (or already used),
      // it means the input is invalid based on the unique character rule.
      console.log("no");
      return; // Exit the function immediately upon invalidity.
    }
  }

  // If the loop completes without returning, all characters were valid and unique.
  console.log("yes");
}

// Entry point: Read input from standard input and process it.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));