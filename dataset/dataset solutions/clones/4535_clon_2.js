function processInput(rawData) {
    // Split the incoming raw data string into an array of individual lines.
    linesArray = rawData.split('\n');

    // The first line of input is treated as a length indicator.
    // Note: In the original code, this is a string that gets implicitly converted to a number during loop initialization.
    initialStringLength = linesArray[0];

    // The second line of input is the primary string to be processed.
    originalString = linesArray[1];

    // Convert the original string into a mutable array of characters for easier manipulation.
    charList = linesArray[1].split('');

    // Initialize two empty strings to accumulate parentheses for balancing.
    prefixParens = '';
    suffixParens = '';

    // First pass: Iterate backwards through the character list to find and remove balanced parenthesis pairs.
    // This loop effectively removes '()' pairs from the innermost ones outwards.
    for (outerIndex = initialStringLength; outerIndex >= 0; outerIndex -= 1) {
        // If the character at the current outer index is a closing parenthesis,
        // we search for a matching opening parenthesis before it.
        if (charList[outerIndex] === ')') {
            // Start searching backwards from the character immediately preceding the current closing parenthesis.
            for (innerIndex = outerIndex - 1; innerIndex >= 0; innerIndex -= 1) {
                // If an opening parenthesis is found, it forms a balanced pair with the current closing one.
                if (charList[innerIndex] === '(') {
                    // Remove the closing parenthesis from the list.
                    charList.splice(outerIndex, 1);
                    // Remove the opening parenthesis from the list.
                    charList.splice(innerIndex, 1);
                    // Since a pair has been successfully removed, we can break the inner loop
                    // and continue with the next iteration of the outer loop.
                    break;
                }
            }
        }
    }

    // Second pass: After removing all balanced pairs, process the remaining characters.
    // Any remaining ')' indicates a need for a preceding '(', and any remaining '(' needs a succeeding ')'.
    for (outerIndex = 0, remainingCharsCount = charList.length; outerIndex < remainingCharsCount; outerIndex += 1) {
        // If a closing parenthesis remains, it means it was unmatched.
        // An opening parenthesis is needed at the beginning of the string to balance it.
        if (charList[outerIndex] === ')') {
            prefixParens += '(';
        } else {
            // If an opening parenthesis remains, it means it was unmatched.
            // A closing parenthesis is needed at the end of the string to balance it.
            suffixParens += ')';
        }
    }

    // Output the final balanced string, constructed by concatenating the generated prefix,
    // the original input string, and the generated suffix.
    console.log(prefixParens + originalString + suffixParens);
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
