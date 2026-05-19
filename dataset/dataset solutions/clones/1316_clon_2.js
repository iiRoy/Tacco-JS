'use strict';
(function (inputBuffer) {
  // Convert the raw buffer content to a string.
  var inputString = inputBuffer.toString();

  // Process the input string to count character frequencies.
  var finalOutput = (function (charArray) {
    // This object will store the frequency of each lowercase letter.
    // It's pre-initialized with all lowercase letters set to zero.
    var frequencyMap = charArray
      .filter(function (character) {
        // Only consider alphabetic characters (A-Z, a-z).
        return /[A-Za-z]/.test(character);
      })
      .map(function (lowerChar) {
        // Convert all filtered characters to lowercase.
        return lowerChar.toLowerCase();
      })
      .reduce(
        function (accumulator, currentKey) {
          // Increment the count for the current character.
          accumulator[currentKey]++;
          return accumulator;
        },
        {
          a: 0,
          b: 0,
          c: 0,
          d: 0,
          e: 0,
          f: 0,
          g: 0,
          h: 0,
          i: 0,
          j: 0,
          k: 0,
          l: 0,
          m: 0,
          n: 0,
          o: 0,
          p: 0,
          q: 0,
          r: 0,
          s: 0,
          t: 0,
          u: 0,
          v: 0,
          w: 0,
          x: 0,
          y: 0,
          z: 0,
        }
      );

    // Get all the keys (characters) from the frequency map.
    var mapKeys = Object.keys(frequencyMap);

    // Format the output: "char : count" for each character, joined by newlines.
    return mapKeys
      .map(function (charKey) {
        return charKey + ' : ' + frequencyMap[charKey];
      })
      .join('\n');
  })(inputString.split('')); // Split the input string into an array of characters.

  // Print the final formatted output to the console.
  console.log(finalOutput);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
