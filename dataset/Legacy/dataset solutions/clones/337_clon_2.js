let inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// Variables to hold parsed information from a line and the current line being processed.
let currentEntryData = [];
let currentLine = '';

// An array to store the parsed data, where each element is an array [word, pageNumber].
const dataEntries = [];

// Process each line from the input until no more lines are available.
while ((currentLine = inputLines.shift()) !== undefined) {
  // Splits the current line into parts based on space.
  currentEntryData = currentLine.split(' ');
  // Adds the word (first part) and the page number (second part, converted to a number)
  // to the main data entries array.
  dataEntries.push([currentEntryData[0], Number(currentEntryData[1])]);
}

// Sorts the data entries. The primary sort key is the word (alphabetical),
// and the secondary sort key is the page number (numerical).
dataEntries.sort(function(entryA, entryB) {
  // Compare words first.
  if (entryA[0] < entryB[0]) {
    return -1;
  }
  if (entryA[0] > entryB[0]) {
    return 1;
  }
  // If words are the same, compare page numbers.
  if (entryA[1] < entryB[1]) {
    return -1;
  }
  if (entryA[1] > entryB[1]) {
    return 1;
  }
  // If both word and page number are the same, their order doesn't matter.
  return 0;
});

// Variables to keep track of the last processed word and the page numbers associated with it.
let previousWord = '';
let pageNumbers = [];

// Iterate through the sorted data entries to group page numbers by word.
dataEntries.forEach(function(currentEntry, currentIndex) {
  // If the current word is different from the previous one, it means a new word group starts.
  if (previousWord !== currentEntry[0]) {
    // If it's not the very first entry, print the page numbers for the *previous* word.
    if (currentIndex !== 0) {
      console.log(pageNumbers.join(' '));
      // Reset the page numbers array for the new word.
      pageNumbers = [];
    }
    // Print the new word itself.
    console.log(currentEntry[0]);
  }
  // Add the current page number to the list for the current word.
  pageNumbers.push(currentEntry[1]);
  // Update the previous word to the current word for the next iteration.
  previousWord = currentEntry[0];
});

// After the loop, print the page numbers for the very last word group.
console.log(pageNumbers.join(' '));
