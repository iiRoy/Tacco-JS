function getInputData() {
    // This function reads the entire content of standard input as a UTF-8 string.
    return require("fs").readFileSync("/dev/stdin", "utf8");
}

// Define an array containing all lowercase letters of the English alphabet.
var alphabetChars = 'abcdefghijklmnopqrstuvwxyz'.split('');

// Initialize an object to store the frequency count of each character.
var charCounts = getInputData() // Get the raw input string from stdin.
    .split('') // Split the input string into an array of individual characters.
    .reduce(function(accumulatorMap, currentCharacter) { // Iterate over each character to build the frequency map.
        // Convert the current character to lowercase to ensure case-insensitive counting.
        currentCharacter = currentCharacter.toLowerCase();
        // Check if the character is an alphabetic letter (a-z or A-Z).
        currentCharacter.match(/[a-zA-z]/)
            ? accumulatorMap[currentCharacter] = accumulatorMap[currentCharacter] + 1 || 1 // If it's a letter, increment its count or initialize to 1 if first occurrence.
            : null; // If not an alphabetic character, perform no action (as per original logic).
        return accumulatorMap; // Return the updated map for the next iteration.
    }, {}); // The initial value for the accumulator is an empty object.

// Iterate through each letter in our predefined alphabet array.
alphabetChars.forEach(function(letter) {
    // Print the letter and its corresponding count. If a letter was not found in the input, its count defaults to 0.
    console.log(letter + ' : ' + (charCounts[letter] ? charCounts[letter] : 0));
});
