process.stdin.resume();
process.stdin.setEncoding('utf8'); // Set the character encoding for incoming data
process.stdin.on('data', function (receivedData) {
  // This function executes when data is received from standard input.
  let processedValue = receivedData; // Assign the incoming data to a new variable.
  console.log(Math.pow(processedValue, 3)); // Calculate the cube of the value and print it.
});
