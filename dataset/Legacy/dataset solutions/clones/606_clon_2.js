var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data
var processedText = rawData.trim();

var greatestLength = 0; // Initialize a variable to store the maximum length found

// Use a regular expression to find patterns and update the maximum length
processedText = processedText.replace(/(J+)(O+)(I+)/g, function(fullMatch, firstGroup, secondGroup, thirdGroup) {
    let currentMinLength = 0; // Temporary variable for the current match's minimum length

    // Check if the lengths of the first and third groups are greater than or equal to the second group's length
    if (firstGroup.length >= secondGroup.length && thirdGroup.length >= secondGroup.length) {
        currentMinLength = secondGroup.length; // If so, the minimum length is the length of the second group
    }

    // Update the overall greatest length found so far
    greatestLength = Math.max(greatestLength, currentMinLength);

    return fullMatch; // Return the original matched string to keep it in the text
});

// Output the final calculated maximum length
console.log(greatestLength);
