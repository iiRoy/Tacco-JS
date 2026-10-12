process.stdin.resume(); // Ensure standard input stream remains open
process.stdin.setEncoding('utf8'); // Set character encoding for input

// Array to store all incoming lines from standard input
let inputData = [];

// Create an interface for reading lines from standard input
const inputHandler = require('readline').createInterface({
  input: process.stdin, // Use standard input as the source
  output: process.stdout // Use standard output for any potential prompts (though not used here)
});

// Event listener for each line received from input
inputHandler.on('line', (currentLine) => {
  inputData.push(currentLine); // Add the current line to our collection
});

// Event listener for when the input stream closes
inputHandler.on('close', () => {
  // Parse the first line as the total number of items to process
  const itemCount = Number(inputData[0]);

  // Initialize a Set to store unique items
  const uniqueItems = new Set();

  // Loop through the subsequent lines, starting from the second line (index 1)
  // up to the 'itemCount' specified in the first line.
  for (let idx = 1; idx <= itemCount; idx++) {
    uniqueItems.add(inputData[idx]); // Add each item to the Set; duplicates are automatically ignored
  }

  // Output the total number of unique items found
  console.log(uniqueItems.size);
});
