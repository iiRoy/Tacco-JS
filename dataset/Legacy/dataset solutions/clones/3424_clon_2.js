process.stdin.resume(); // Activate standard input stream
process.stdin.setEncoding('utf8'); // Define the character encoding for input data

// An array to accumulate all incoming lines from the input source
var inputData = [];

// Initialize a line-reading interface using the 'readline' module
var inputProcessor = require('readline').createInterface({
  input: process.stdin,   // Designate standard input as the source
  output: process.stdout  // Designate standard output for internal readline operations
});

// Attach an event handler for each line received from the input stream
inputProcessor.on('line', (currentLine) => {
  // Append the newly read line to our collection of input data
  inputData.push(currentLine);
});

// Attach an event handler for when the input stream concludes
inputProcessor.on('close', () => {
  // Extract the first element from the collected input data, expected to be a number
  var inputNumber = inputData[0];

  // Evaluate if the extracted number matches any of the specified values
  if (inputNumber == 3 || inputNumber == 5 || inputNumber == 7) {
    // If a match is found, output "YES" to the console
    console.log("YES");
  } else {
    // Otherwise, output "NO" to the console
    console.log("NO");
  }
});
