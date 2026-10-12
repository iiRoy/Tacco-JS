// This function processes the given raw input data.
function ProcessInput(rawData) {
  // Split the raw input into individual lines.
  rawData = rawData.split("\n");

  // Extract the first string from the input and convert it into an array of characters.
  let firstStringChars = rawData[0].split("");

  // Extract the second string from the input and convert it into an array of characters.
  let secondStringChars = rawData[1].split("");

  // Initialize a flag variable to "Yes", assuming a match until a discrepancy is found.
  let resultFlag = "Yes";

  // Continue processing as long as the second character array is not empty.
  while (secondStringChars.length !== 0) {
    // Iterate through the characters of the second string, starting from the second element.
    for (let idx = 1; idx < secondStringChars.length; idx++) {
      // Check for consistency: if the first character of 'secondStringChars' matches another character in 'secondStringChars'...
      if (secondStringChars[0] === secondStringChars[idx]) {
        // ...then their corresponding characters in 'firstStringChars' must also match.
        // If they do not match, set the flag to "No" and exit the inner loop.
        if (firstStringChars[0] !== firstStringChars[idx]) {
          resultFlag = "No";
          break;
        }
      }

      // Also check for consistency in the reverse direction:
      // If the first character of 'firstStringChars' matches another character in 'firstStringChars'...
      if (firstStringChars[0] === firstStringChars[idx]) {
        // ...then their corresponding characters in 'secondStringChars' must also match.
        // If they do not match, set the flag to "No" and exit the inner loop.
        if (secondStringChars[0] !== secondStringChars[idx]) {
          resultFlag = "No";
          break;
        }
      }
    }

    // If the result flag has been set to "No" during the inner loop,
    // it means a mismatch was found, so there's no need to continue.
    if (resultFlag === "No") {
      break; // Exit the outer loop.
    }

    // Remove the first character from both arrays to process the next pair of characters.
    firstStringChars.shift();
    secondStringChars.shift();
  }

  // Output the final determination.
  console.log('%s', resultFlag);
}

// This is a supplementary function for local testing purposes, often triggered by a UI event.
function testFunction() {
  // Retrieve input data from a specific HTML element.
  var localInput = document.getElementById("input").value;
  // Invoke the main processing function with the retrieved local input.
  ProcessInput(localInput);
}

// Execute the primary processing function, reading input from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
