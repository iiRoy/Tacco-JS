/*
 * This module is responsible for processing textual data.
 * It reads input, filters out duplicates, and reports the count of unique entries.
 */
function processData(initialText)
{
  // Split the entire input string into an array of individual lines.
  var   stringLines = initialText.split("\n")  ;

  // Discard the first line and retain all subsequent lines.
  // The slice operation creates a new array from the second element to the end.
  stringLines = stringLines.slice(1, stringLines.length + 1);

  // Filter the array to keep only unique elements.
  // The filter callback checks if the current element's first occurrence
  // is at its current index, effectively removing duplicates.
  var distinctItems = stringLines.filter((elementValue, elementIndex, collectionRef) => {
    return collectionRef.indexOf(elementValue) === elementIndex;
  });

  // Output the total count of unique items after converting it to an integer.
  console.log(Number.parseInt(distinctItems.length));
}
; // End of the data processing function definition

// Obtain the necessary file system utility module.
const fileUtility = require('fs');

// Execute the main data processing function.
// It reads the entire content from the standard input file path,
// decodes it as UTF-8, and passes it to the processData function.
processData(fileUtility.readFileSync('/dev/stdin', 'utf8'));