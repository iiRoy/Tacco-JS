function processInput(rawData) {
  // Trim any leading or trailing whitespace from the raw input string.
  rawData = rawData.trim();

  // Split the processed string by spaces and assign the first part.
  const firstPart = rawData.split(" ")[0];
  // Split the processed string by spaces and assign the second part.
  const secondPart = rawData.split(" ")[1];
  // Split the processed string by spaces and assign the third part.
  const thirdPart = rawData.split(" ")[2];

  // Extract the first character of each part, convert it to uppercase,
  // and then concatenate these uppercase characters before printing to console.
  console.log(
    firstPart.substr(0, 1).toUpperCase() +
    secondPart.substr(0, 1).toUpperCase() +
    thirdPart.substr(0, 1).toUpperCase()
  );
}

// Read the entire content of standard input as a UTF-8 string
// and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
