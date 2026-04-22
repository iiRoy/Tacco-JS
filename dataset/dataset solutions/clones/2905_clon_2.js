'use strict';

// Main processing function for the incoming data stream
function processInputData(incomingText) {

  // Split the entire input string into an array of individual lines
  const processedLines = incomingText.split('\n');

  // Remove the first line, which often contains metadata like a count
  processedLines.shift();

  // Transform each remaining line into a structured record
  const parsedRecords = processedLines.map((currentItemString, currentIndex) => {
    // Split the current line by spaces to get its components
    const tempRecordArray = currentItemString.split(' ');
    
    // Convert the second component to an integer (base 10)
    tempRecordArray[1] = parseInt(tempRecordArray[1], 10);
    
    // Store the original 1-based index of the line
    tempRecordArray[2] = currentIndex + 1;
    
    // Return the newly structured array for this record
    return tempRecordArray;
  });
  
  // Initialize an empty object to group records by their first component
  const groupedData = {};

  // Iterate over each parsed record to populate the grouped data object
  parsedRecords.forEach(currentRecord => {
    // If a group for this record's category doesn't exist, create an empty array
    groupedData[currentRecord[0]] = groupedData[currentRecord[0]] || [];
    
    // Add the current record to its corresponding category group
    groupedData[currentRecord[0]].push(currentRecord);
  });

  // Retrieve all category keys from the grouped data and sort them alphabetically
  const sortedCategories = Object.keys(groupedData).sort();

  // Iterate through each sorted category
  sortedCategories.forEach(currentCategory => {
    // Sort the items within the current category based on their second component in descending order
    const sortedCategoryItems = groupedData[currentCategory].sort((recordA, recordB) => recordB[1] - recordA[1]);
    
    // For each item in the now-sorted category, display its original index
    sortedCategoryItems.forEach(itemToPrint => outputStream.displayMessage(itemToPrint[2]));
  });
}

// Define a placeholder for the global require function and the console object
// In a real scenario, 'getModule' would be actual 'require' and 'outputStream' would be 'console'
const getModule = (moduleName) => {
  if (moduleName === 'node:fs') {
    return {
      readTextFromFile: (path, encoding) => require('fs').readFileSync(path, encoding)
    };
  }
  return {};
};

const outputStream = {
  displayMessage: (msg) => console.log(msg)
};

// Execute the main processing function by reading input from a file
processInputData(getModule('node:fs').readTextFromFile('/data/input.txt', 'utf8'));