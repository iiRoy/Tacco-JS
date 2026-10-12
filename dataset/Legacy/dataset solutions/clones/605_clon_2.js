const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input string
let processedText = fileContent.trim();

// Initialize a variable to store the maximum length found
let greatestCount = 0;

/*
 * This regular expression looks for sequences of 'J's, 'O's, and 'I's.
 * (J+) matches one or more 'J's.
 * (O+) matches one or more 'O's.
 * (I+) matches one or more 'I's.
 * The 'g' flag ensures all occurrences are matched, not just the first.
 */
processedText = processedText.replace(/(J+)(O+)(I+)/g, function(fullMatch, firstGroup, secondGroup, thirdGroup) {
    // Calculate the minimum length among the three captured groups
    const currentMinLength = Math.min(firstGroup.length, secondGroup.length, thirdGroup.length);

    // Update the greatestCount if the current minimum length is larger
    greatestCount = Math.max(greatestCount, currentMinLength);

    // Return the full match unchanged, as per the original logic
    return fullMatch;
});

// Output the final maximum count to the console
console.log(greatestCount);
