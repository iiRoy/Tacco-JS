process.stdin.resume();
process.stdin.setEncoding('utf8');

// Array to store each line read from standard input
var inputRows = [];

// Create an interface for reading input line by line
var inputHandler = require('readline').createInterface({
  input: process.stdin, // Use standard input
  output: process.stdout // Use standard output (though not directly written to here)
});

// Event listener for each line received
inputHandler.on('line', (currentLineText) => {
  inputRows.push(currentLineText); // Add the current line to our collection
});

// Function to sort numbers in descending order
function descendingSorter(firstVal, secondVal) {
  return secondVal - firstVal; // For descending order
}

// Event listener for when the input stream closes
inputHandler.on('close', () => {
  // Parse the first line as the count of elements
  var countOfElements = Number(inputRows[0]);

  // Split the second line by spaces to get string representations of numbers
  var stringNumbersArray = inputRows[1].split(' ');

  // Convert string numbers to actual numbers
  var numericValues = stringNumbersArray.map(function(currentStringValue) {
    return Number(currentStringValue);
  });

  // Sort the numeric values in descending order using our custom sorter
  numericValues.sort(descendingSorter);

  // Initialize scores for two players
  var playerOneScore = 0;
  var playerTwoScore = 0;

  // Iterate through the sorted numbers, assigning them alternately
  for (let loopIndex = 0; loopIndex < countOfElements; loopIndex++) {
    // If the index is odd, it's player one's turn (Alice in original logic)
    if (loopIndex % 2 === 1) {
      playerOneScore += numericValues[loopIndex];
    } else {
      // Otherwise, it's player two's turn (Bob in original logic)
      playerTwoScore += numericValues[loopIndex];
    }
  }

  // Output the difference between player one's score and player two's score
  console.log(playerOneScore - playerTwoScore);
});
