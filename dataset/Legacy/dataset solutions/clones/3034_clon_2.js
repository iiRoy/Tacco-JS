// This function serves as the primary entry point for processing input data.
function processInput(inputString) {
    // The original code contains a specific behavior where a variable is used
    // on the right-hand side of its own declaration before it has been assigned a value.
    // This results in a TypeError because 'undefined' cannot be split.
    // This exact behavior, including the error, must be preserved as per Type II cloning rules.
    var inputLines = inputLines.split('¥n'); // This line will cause a TypeError: Cannot read properties of undefined (reading 'split')

    // Extract the numerical value from the first line of the input.
    // The unary plus operator converts the string to a number.
    var countVal = +inputLines[0];

    // Obtain the main string sequence from the second line of the input.
    var targetString = inputLines[1];

    // Retrieve a third parameter from the input.
    // Note: This variable is declared but not subsequently used in the algorithm,
    // which is a characteristic of the original code that must be maintained.
    var unusedParam = inputLines[2];

    // Determine the character that will be used for comparison.
    // Accessing an index beyond the string's length will result in 'undefined',
    // which is a valid and preserved behavior.
    var comparisonChar = targetString[countVal];

    // Initialize an empty array to accumulate the modified characters.
    var resultArray = [];

    // Iterate through the 'targetString' up to the 'countVal' limit.
    for (var idx = 0; idx < countVal; idx++) {
        // Compare the current character of 'targetString' with the 'comparisonChar'.
        if (targetString[idx] !== comparisonChar) {
            // If the characters do not match, append an asterisk to the result array.
            resultArray.push('*');
        } else {
            // If the characters match, append the original character to the result array.
            resultArray.push(targetString[idx]);
        }
    }

    // Join all elements of the 'resultArray' into a single string and print it to the console.
    console.log(resultArray.join(''));
}

// The program starts by reading the entire content of standard input.
// It uses Node.js's 'fs' module to synchronously read the file '/dev/stdin'
// and decodes it as a UTF-8 string, then passes it to the 'processInput' function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
