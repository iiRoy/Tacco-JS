function displayMessage(messageContent) {
  console.log(messageContent); // Outputs the provided text to the console.
}

function ProcessData(incomingData) {
  // The input string is first trimmed and then split into an array of lines.
  let processedLines = incomingData.trim().split("\n");

  // Parse the first number from the first line of input.
  let firstSegmentValue = parseInt(processedLines[0].split(" ")[0]);

  // Parse the second number from the first line of input.
  let secondSegmentValue = parseInt(processedLines[0].split(" ")[1]);

  // The second line of input is treated as the target string for validation.
  let targetString = processedLines[1];

  // Iterate through each character of the target string.
  for (let charIndex = 0; charIndex < targetString.length; charIndex++) {
    // Extract the current character at the current index.
    let currentCharacter = targetString.slice(charIndex, charIndex + 1);

    // Check if the current index matches the first number AND the character is NOT a hyphen.
    if (charIndex === firstSegmentValue && currentCharacter !== "-") {
      displayMessage("No"); // If condition met, output "No" and exit.
      return;
    }
    // Otherwise, check if the current index does NOT match the first number AND the character IS a hyphen.
    else if (charIndex !== firstSegmentValue && currentCharacter === "-") {
      displayMessage("No"); // If this condition met, output "No" and exit.
      return;
    }
  }
  // If the loop completes without returning, it means all conditions were met.
  displayMessage("Yes");
}

// Read input from standard input, trim it, and pass it to the main processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
