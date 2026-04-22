function ProcessInput(rawData) {
  // Split the entire input string into individual lines.
  rawData = rawData.split("\n");
  // Extract the first line and convert it into an array of characters.
  var primarySequence = rawData[0].split("");
  // Extract the second line and convert it into an array of characters.
  var secondarySequence = rawData[1].split("");
  var comparisonResult = "Yes"; // Initialize the outcome as positive.

  // Continue processing as long as the secondary sequence has elements.
  while (secondarySequence.length !== 0) {
    // Iterate through elements starting from the second character in the current sequence.
    for (let idx = 1; idx < secondarySequence.length; idx++) {
      // Check for character equality at the current position in the secondary sequence.
      if (secondarySequence[0] === secondarySequence[idx]) {
        // If secondary characters match, ensure primary characters also match.
        if (primarySequence[0] !== primarySequence[idx]) {
          comparisonResult = "No"; // Mismatch found, set result to negative.
          break; // Exit the inner loop.
        }
      }
      // Check for character equality at the current position in the primary sequence.
      if (primarySequence[0] === primarySequence[idx]) {
        // If primary characters match, ensure secondary characters also match.
        if (secondarySequence[0] !== secondarySequence[idx]) {
          comparisonResult = "No"; // Mismatch found, set result to negative.
          break; // Exit the inner loop.
        }
      }
    }
    // If a mismatch was detected in the inner loop, exit the outer loop.
    if (comparisonResult === "No") {
      break;
    }

    // Remove the first character from both sequences for the next iteration.
    primarySequence.shift();
    secondarySequence.shift();
  }

  // Output the final comparison outcome.
  console.log('%s', comparisonResult);
}

// This function provides a way to test the logic in a browser environment.
function TestExecution() {
  // Retrieve user-provided text from a DOM element.
  var userInput = document.getElementById("input").value;
  // Pass the user input to the main processing function.
  ProcessInput(userInput);
}

// Execute the primary function with input read from standard input (Node.js environment).
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));