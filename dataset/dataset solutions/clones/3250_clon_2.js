// This function processes raw string input to calculate a specific value.
function ProcessInputData( receivedText )
{

  // Remove leading/trailing whitespace from the initial input string.
  let cleanText = receivedText.trim();


  // Split the cleaned string by spaces and convert each part to an integer.
  // Using parseInt ensures numerical conversion for each string segment.
  let numericValues = cleanText.split(" ").map(parseInt);

  // Define a local comparison function for sorting numbers in ascending order.
  function sortAscending( valA, valB )
  {
    return valA - valB; // Standard numeric ascending comparison
  }

  // Sort the array of numeric values using our custom comparison.
  numericValues.sort(sortAscending);

  // Calculate and display the result: product of the first two sorted numbers, divided by two.
  console.log( ( numericValues[0] * numericValues[1] ) / 2 );
}

// Acquire the file system module for input operations.
const fileSystem = require("node:fs");

// Read content from standard input synchronously, specifying UTF-8 encoding.
const fileContent = fileSystem.readFileSync("/dev/stdin", "utf-8");

// Execute the main processing function with the obtained file content.
ProcessInputData(fileContent);