'use strict';
(function(inputData) {
  var rawData = inputData.toString();

  // Helper function to programmatically create the initial frequency map for all lowercase English letters
  function createAlphabetFrequencyMap() {
    let initialMap = {};
    const startCharCode = 'a'.charCodeAt(0);
    const endCharCode = 'z'.charCodeAt(0);
    for (let i = startCharCode; i <= endCharCode; i++) {
      initialMap[String.fromCharCode(i)] = 0;
    }
    return initialMap;
  }

  // Helper function to format a single output line
  function generateOutputLine(letterKey, frequencyMap) {
    return letterKey + ' : ' + frequencyMap[letterKey];
  }

  var finalOutput = (function(charArray) {
    const alphaCharacterPattern = /[A-Za-z]/; // Helper constant for the regular expression
    let charCounts = createAlphabetFrequencyMap(); // Initialize the frequency map using the helper function

    // Iterate through each character in the input array
    charArray.forEach(function(currentCharacter) {
      // Check if the current character is an alphabet letter
      if (alphaCharacterPattern.test(currentCharacter)) {
        const lowerCaseCharacter = currentCharacter.toLowerCase(); // Convert to lowercase using a helper variable
        // Increment the count for the corresponding letter in the map
        // The hasOwnProperty check acts as a guard clause, though not strictly necessary given the regex and map initialization
        if (charCounts.hasOwnProperty(lowerCaseCharacter)) {
          charCounts[lowerCaseCharacter]++;
        }
      }
    });

    var countKeys = Object.keys(charCounts); // Get all keys (letters) from the frequency map
    return countKeys.map(function(letter) { // Map each letter to its formatted output string
      return generateOutputLine(letter, charCounts); // Use the helper function for formatting
    }).join('\n'); // Join all formatted strings with newline characters

  }(rawData.split(''))); // Split the raw input string into an array of characters

  console.log(finalOutput); // Print the final formatted output
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
