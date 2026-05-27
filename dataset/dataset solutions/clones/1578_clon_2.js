process.stdin.resume(); // Keep the input stream active
process.stdin.setEncoding('utf8'); // Set character encoding for input

// Array to store all incoming lines from standard input
var inputDataRows = [];

// Create an interface for reading input line by line
var inputProcessor = require('readline').createInterface({
  input: process.stdin, // Use standard input as the source
  output: process.stdout // Use standard output for any prompts (though none are used here)
});

// Event listener for each line received
inputProcessor.on('line', (currentLineContent) => {
  inputDataRows.push(currentLineContent); // Add the current line to our collection
});

// Event listener for when the input stream closes
inputProcessor.on('close', () => {
  // Parse the first line to get the count of elements
  var numberOfElements = parseInt(inputDataRows[0]);

  // Initialize variables for calculation
  var totalDifference = 0; // This will store the final sum
  var currentMaximum = 0; // Keeps track of the maximum number encountered so far

  // Loop through the elements specified by numberOfElements
  for (var loopIndex = 0; loopIndex < numberOfElements; loopIndex++) {
    // Parse each element from the second line of input
    var currentElementValue = parseInt(inputDataRows[1].split(' ')[loopIndex]);

    // Update the maximum number if the current element is greater
    currentMaximum = Math.max(currentMaximum, currentElementValue);

    // Add the difference between the current maximum and the current element to the total
    totalDifference += currentMaximum - currentElementValue;
  }

  // Output the final calculated sum to the console
  console.log(totalDifference);
});
