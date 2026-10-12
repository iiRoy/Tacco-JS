const rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read raw input from standard input stream

let inputLines = rawData.trim().split('\n'); // Split the raw data into an array of lines, removing any leading or trailing whitespace

// Main loop to process multiple sets of data
while (inputLines.length > 1) {
  // The first line of each set indicates the number of key-value pairs for the translation map
  const mapEntryCount = parseInt(inputLines.shift(), 10);

  // Initialize an empty object to store the key-value translations
  const translationMap = {};

  // Populate the translation map with entries from the input lines
  for (let idx = 0; idx < mapEntryCount; idx++) {
    // Each line contains a key and its corresponding value, separated by a space
    const pairParts = inputLines[idx].trim().split(' ');
    translationMap[pairParts[0]] = pairParts[1]; // Store the key-value pair
  }

  // Remove the processed map entries from the input lines array
  inputLines = inputLines.slice(mapEntryCount);

  // The next line indicates the number of keys to query for translation
  const queryCount = parseInt(inputLines.shift(), 10);

  // Initialize an empty string to build the translated output
  let resultString = '';

  // Iterate through the query keys and build the result string
  for (let idx = 0; idx < queryCount; idx++) {
    const currentKey = inputLines[idx].trim(); // Get the current key to look up

    // If the key exists in the translation map, append its translated value; otherwise, append the original key
    resultString += (translationMap.hasOwnProperty(currentKey)) ? translationMap[currentKey] : currentKey;
  }

  // Remove the processed query keys from the input lines array
  inputLines = inputLines.slice(queryCount);

  // Output the final translated string for the current data set
  console.log(resultString);

  // Check if the next line is "0", which signals the end of all input batches
  if (inputLines[0] === '0') {
    break; // Exit the main processing loop
  }
}
