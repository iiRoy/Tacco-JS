'use strict';

// Main processing function for the input data
function processInput(inputData) {
  // Split the entire input string into individual lines
  const lines = inputData.split('\n');

  // Remove the first line, which might be a header or count
  lines.shift();

  // Process each remaining line to create structured data entries
  const dataEntries = lines.map((currentLine, lineIndex) => {
    // Split the line by space to get components
    const tempArray = currentLine.split(' ');
    // Convert the second component to an integer (base 10)
    tempArray[1] = parseInt(tempArray[1], 10);
    // Add the original 1-based index of the line as the third component
    tempArray[2] = lineIndex + 1;
    return tempArray;
  });

  // Create an object to group entries by their first component (key)
  const groupedData = {};

  // Populate the groupedData object
  dataEntries.forEach(entry => {
    // Initialize an array for the key if it doesn't exist
    groupedData[entry[0]] = groupedData[entry[0]] || [];
    // Add the current entry to the corresponding group
    groupedData[entry[0]].push(entry);
  });

  // Get all unique keys from the grouped data and sort them alphabetically
  const sortedKeys = Object.keys(groupedData).sort();

  // Iterate through the sorted keys
  sortedKeys.forEach(currentKey => {
    // For each key, get its associated entries and sort them in descending order
    // based on their second component (the integer value)
    const sortedEntries = groupedData[currentKey].sort((entryA, entryB) => entryB[1] - entryA[1]);
    // Iterate through the sorted entries for the current key
    sortedEntries.forEach(outputEntry => {
      // Print the third component (original 1-based index) of each entry
      console.log(outputEntry[2]);
    });
  });
}

// Read input from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
