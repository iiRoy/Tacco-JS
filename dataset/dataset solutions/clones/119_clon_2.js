/* Primary data storage for element frequencies */
let itemFrequencies = {},
    /* Current highest frequency observed */
    topFrequency = 0,
    /* Current maximum string length encountered */
    maxStringLength = 0,
    /* The input element identified as most frequent */
    currentFreqItem = 0,
    /* The input element identified as the longest string */
    currentLongestString = 0;

/* Utilize Node.js file system module to read all data from standard input */
require('fs').readFileSync('/dev/stdin', 'utf8')
    /* Split the acquired string content by single space characters */
    .split(' ')
    /* Iterate over each resulting data segment */
    .map(function(inputSegment) {
        // Evaluate and update frequency tracking variables
        // Ternary operator for concise conditional logic:
        // If 'inputSegment' already exists in 'itemFrequencies' object (truthy check):
        inputSegment in itemFrequencies
            ? (
                // Increment its count and then check if this new count is greater than 'topFrequency'
                ++itemFrequencies[inputSegment] > topFrequency
                ? (
                    // If it is, update 'topFrequency' and set 'currentFreqItem' to this 'inputSegment'
                    topFrequency = itemFrequencies[inputSegment],
                    currentFreqItem = inputSegment
                  )
                : 0 // Otherwise, do nothing (represented by a zero-value expression)
              )
            // If 'inputSegment' is encountered for the first time (falsy check):
            : (itemFrequencies[inputSegment] = 1); // Initialize its count to one

        // Evaluate and update string length tracking variables in a single expression
        // Check if the current 'inputSegment's length is greater than 'maxStringLength'
        (inputSegment.length > maxStringLength)
            ? (
                // If it is, update 'currentLongestString' and 'maxStringLength'
                currentLongestString = inputSegment,
                maxStringLength = inputSegment.length
              )
            : 0; // Otherwise, do nothing
    });

/* Output the final determined most frequent item and the longest string, separated by a space */
console.log(currentFreqItem + ' ' + currentLongestString);