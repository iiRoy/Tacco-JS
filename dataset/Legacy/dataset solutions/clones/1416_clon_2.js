function getInputData() {
  // This function is responsible for reading input from standard input.
  // It uses Node.js's 'fs' module to read the entire content of /dev/stdin.
  let inputContent = require("fs").readFileSync("/dev/stdin", "utf8");
  // The content is then split into an array of lines, handling both Unix and Windows newlines.
  return inputContent.split(/\n\r?/);
}

// A utility function to generate a sequential array of numbers.
function generateSequence(startVal, endVal) {
  const resultArray = []; // Initialize an empty array to hold the numbers.
  // Loop from the starting value up to and including the ending value.
  for (let idx = startVal; idx <= endVal; idx++) {
    resultArray.push(idx); // Add the current number to the array.
  }
  return resultArray; // Return the array containing the sequence.
}

// Initialize a complete deck of cards, represented as an object where keys are suits
// and values are arrays of ranks (1 through 13).
const cardSet = {
  S: generateSequence(1, 13), // Spades
  H: generateSequence(1, 13), // Hearts
  C: generateSequence(1, 13), // Clubs
  D: generateSequence(1, 13), // Diamonds
};

// Process the input lines. The first line is typically a count and is skipped.
// The 'every' method is used to iterate, and returning 'true' continues the iteration.
getInputData().slice(1).every(function (inputLine) {
  // Split each input line by space to separate the suit and the rank.
  const lineParts = inputLine.split(' ');
  const suitChar = lineParts[0]; // Extract the suit character (e.g., 'S').
  const cardRank = +lineParts[1]; // Extract the rank and convert it to a number.

  // Remove the specified card from the 'cardSet'.
  // First, find the index of the cardRank within its suit's array, then remove it.
  cardSet[suitChar].splice(cardSet[suitChar].indexOf(cardRank), 1);
  return true; // Indicate that the iteration should continue for the next line.
});

// This loop iterates over the remaining suits in the 'cardSet'.
// The original code had a commented-out section here for printing the remaining cards.
for (const suitKey in cardSet) {
  // console.log(cardSet[suitKey].map(function(cardValue) { return suitKey + ' ' + cardValue; }).join("\n"));
}
