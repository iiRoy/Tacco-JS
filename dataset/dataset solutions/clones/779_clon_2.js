var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read all input from standard input synchronously

// Process the raw input: trim whitespace and split into an array of lines
var lineArray = (rawData.trim()).split("\n");

// The first line contains the number of test cases
var numCases = lineArray.shift();

// Define the character mappings for each digit on a T9-like keypad
var keypadChars = ["", ".,!? ", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"];

// Convert each string of characters into an array of individual characters
keypadChars = keypadChars.map(function(charSet) {
    return charSet.split("");
});

// Iterate through each test case provided in the input
for (var caseIndex = 0; caseIndex < numCases; caseIndex++) {
    // For the current test case, split the line into individual digits and convert them to numbers
    var digitSequence = lineArray[caseIndex].split("").map(Number);

    // Initialize an empty string to store the decoded message for the current case
    var outputString = "";

    // This variable will hold the character selected from the current sequence of presses
    var currentChar = "";

    // This counter tracks how many times a digit has been "pressed" consecutively
    var pressCount = -1;

    // Process each digit in the sequence for the current test case
    digitSequence.forEach(function(currentDigit) {
        // If the digit is greater than 0, it represents a character selection
        if (currentDigit > 0) {
            pressCount++; // Increment the press counter for the current digit
            // Select the character based on the digit and the current press count (modulo the length of available characters)
            currentChar = keypadChars[currentDigit][pressCount % keypadChars[currentDigit].length];
        } else {
            // If the digit is 0, it acts as a separator, indicating the end of a character selection sequence
            outputString += currentChar; // Append the selected character to the result string
            pressCount = -1; // Reset the press counter for the next character sequence
            currentChar = ""; // Clear the current character
        }
    });

    // Print the final decoded string for the current test case
    console.log(outputString);
}
