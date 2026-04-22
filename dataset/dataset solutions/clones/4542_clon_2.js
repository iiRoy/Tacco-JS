'use strict' // Enforce strict mode for better code quality and error handling

// This function evaluates an incoming text string to determine if all its characters are unique.
function processTextUniqueness(incomingString) {
  // First, we transform the entire incoming string into an array of its constituent characters.
  // This allows for individual character access and manipulation.
  let characterSequence = incomingString.split('');

  // Next, we calculate the total quantity of characters present in our sequence.
  // This count will serve as a baseline for comparison later.
  const totalCharacterCount = characterSequence.length;

  // We then proceed to filter this character sequence to extract only the unique characters.
  // The filter operation checks if the first occurrence of a character matches its current position,
  // effectively identifying and isolating distinct characters.
  const uniqueCharacterCollection = characterSequence.filter((currentElement, elementIndex, entireCollection) => {
    return entireCollection.indexOf(currentElement) === elementIndex;
  });

  // A decision is made based on comparing the count of unique characters against the total character count.
  // If these two counts are identical, it implies that every character in the original string was unique.
  if (uniqueCharacterCollection.length === totalCharacterCount) {
    // Should all characters be unique, we output a positive confirmation.
    console.log('yes');
  }
  // Conversely, if the counts differ, it indicates the presence of duplicate characters.
  else {
    // In the event of duplicates, a negative confirmation is outputted.
    console.log('no');
  }
}

// Initiate the character uniqueness analysis.
// This involves reading the content from the standard input stream,
// interpreting it as a UTF-8 encoded string, and then passing it
// to our processing function.
processTextUniqueness(
  require('fs').readFileSync('/dev/stdin', 'utf8')
);