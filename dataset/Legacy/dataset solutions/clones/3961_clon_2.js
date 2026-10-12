function processInput(rawData) {
  // Remove leading/trailing whitespace from the raw input string.
  let cleanedData = rawData.trim();

  // Split the cleaned string by spaces and convert each part to a number.
  // Store the resulting array of numbers.
  const numericValues = cleanedData.split(" ").map(Number);

  // Check if the sum of the first two numbers is greater than or equal to the third number.
  // Log "Yes" if true, otherwise log "No".
  console.log((numericValues[0] + numericValues[1] >= numericValues[2]) ? "Yes" : "No");
}

// Read the entire content from standard input, decode it as UTF-8,
// and pass it to our main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
