function ProcessInput(rawData) {
  // Process raw input data
  let parsedData = rawData.split('\n');

  // Extract the first line and split by space
  const tokenizedLine = parsedData[0].split(' ');

  // The string to be analyzed
  var targetString = tokenizedLine[0];

  // Initialize the outcome flag
  let resultFlag = "Yes";

  // console.log(`String length: ${targetString.length}`); // Debugging comment

  // Perform character validation
  for (let idx = 0; idx < targetString.length; idx++) {
    let allowedChars; // Declare variable for allowed characters

    // Determine allowed characters based on position parity
    if ((idx + 1) % 2 === 0) {
      // Even position (1-indexed)
      allowedChars = "LUD";
    } else {
      // Odd position (1-indexed)
      allowedChars = "RUD";
    }

    // console.log(`Position: ${idx + 1}, Char: ${targetString.substring(idx, idx + 1)}, Allowed: ${allowedChars}`); // Another debug comment

    // Check if the character is among the allowed ones
    if (allowedChars.indexOf(targetString.substring(idx, idx + 1)) === -1) {
      resultFlag = "No"; // Set flag to 'No' if invalid character found
      break; // Exit loop early
    }
  }

  // Output the final result
  console.log(resultFlag);
}

// Read input from standard input and pass to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
