'use strict';

function processInput(incomingData) {
  const characterCollection = new Set();
  let totalLength = 0;

  // Iterate through the input string to populate the Set and count total characters.
  // This replaces the split() and then filter() or split() and then length property access.
  for (let charIndex = 0; charIndex < incomingData.length; charIndex++) {
    const currentCharacter = incomingData[charIndex];
    characterCollection.add(currentCharacter);
    totalLength++;
  }

  // Determine if the count of unique characters equals the total character count.
  // This is a direct comparison of Set size with the string's length.
  const areAllUnique = characterCollection.size === totalLength;

  // Output the result using a conditional expression.
  console.log(areAllUnique ? 'yes' : 'no');
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
