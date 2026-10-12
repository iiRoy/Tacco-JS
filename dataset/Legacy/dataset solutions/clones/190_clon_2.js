let currentVal = 'A'; // Initialize a string variable with a default value

// Activate standard input stream to listen for data
process.stdin.resume();

// Configure the encoding for incoming data from standard input
process.stdin.setEncoding('utf8');

// Attach an event listener for 'data' events on the standard input stream
process.stdin.on('data', function(dataSegment) {
  // Split the received data chunk by a comma to get an array of strings
  let parsedInput = dataSegment.split(',');

  // Check if the first element of the parsed input matches the current value
  if (parsedInput[0] === currentVal) {
    // If it matches, update the current value with the second element
    currentVal = parsedInput[1];
  }
  // Otherwise, check if the second element of the parsed input matches the current value
  else if (parsedInput[1] === currentVal) {
    // If it matches, update the current value with the first element
    currentVal = parsedInput[0];
  }
});

// Attach an event listener for the 'end' event on the standard input stream
process.stdin.on('end', function(finalDataSegment) {
  // Once all input has been received, print the final value of the variable to the console
  console.log(currentVal);
});
