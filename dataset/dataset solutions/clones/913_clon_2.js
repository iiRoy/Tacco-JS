const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data
let lineSegments = rawData.trim().split("\n");

// Main processing loop
while (true) {
  // Read the number of items for the current test case
  let countOfItems = parseInt(lineSegments.shift(), 10);

  // If the count is zero, terminate the program
  if (countOfItems === 0) {
    break;
  }

  // Extract the relevant items for this test case
  const currentItems = lineSegments.splice(0, countOfItems);

  // Initialize an object to store unique extracted prefixes
  const uniquePrefixes = {};
  // Initialize a variable to track the maximum length of an extracted prefix
  let maxLength = 0;

  // Iterate over each item in the current test case
  currentItems.forEach(function(currentItem) {
    const currentString = currentItem;
    let extractedPrefix = currentString[0]; // Start with the first character

    let vowelFound = false; // Flag to indicate if a vowel has been encountered

    // Iterate through the characters of the current string
    for (let idx = 0; idx < currentString.length; idx++) {
      // If a vowel was previously found, append the current character to the prefix
      if (vowelFound) {
        extractedPrefix += currentString[idx];
      }
      // Update the vowelFound flag based on the current character
      vowelFound = (/[aiueo]/.test(currentString[idx]));
    }

    // Mark the extracted prefix as present in our unique set
    uniquePrefixes[extractedPrefix] = true;
    // Update the maximum prefix length if necessary
    maxLength = Math.max(maxLength, extractedPrefix.length);
  });

  // Find the shortest common prefix length
  for (let len = 1; len <= maxLength; len++) {
    const tempPrefixMap = {}; // Temporary map for prefixes of current length

    // Iterate through the unique prefixes found
    for (const prefixKey in uniquePrefixes) {
      // Store the truncated prefix of the current length
      tempPrefixMap[prefixKey.slice(0, len)] = true;
    }

    // If the number of unique truncated prefixes equals the original item count,
    // then 'len' is the answer
    if (Object.keys(tempPrefixMap).length === countOfItems) {
      console.log(len);
      break; // Found the answer, move to the next test case
    }

    // If we've checked up to the maximum prefix length and haven't found a solution
    if (len === maxLength) {
      console.log(-1); // No unique prefix length found
    }
  }
}
