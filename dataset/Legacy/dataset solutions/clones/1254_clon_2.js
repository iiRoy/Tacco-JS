var rawData = ""; // Initialize a variable to accumulate incoming data from standard input.

// Resume the standard input stream to start receiving data.
process.stdin.resume();

// Set the encoding for the standard input stream to UTF-8.
process.stdin.setEncoding('utf-8');

// Attach an event listener for 'data' events on the standard input.
// Each time a chunk of data is received, append it to our rawData variable.
process.stdin.on('data', function(dataSegment) {
  rawData += dataSegment; // Concatenate the received data segment.
});

// Attach an event listener for the 'end' event on the standard input.
// This event fires when there is no more data to be read.
process.stdin.on('end', function() {
  // Once all data is received, split the raw data by newline characters.
  // This typically separates lines of input.
  rawData = rawData.split("\n");

  // The problem implies the numbers are on the second line (index 1).
  // Split this line by spaces to get an array of number strings.
  let numberStrings = rawData[1].split(" ");

  // Calculate the minimum value from the array of number strings.
  // Math.min.apply is used to pass array elements as individual arguments.
  let minimumValue = Math.min.apply(null, numberStrings);

  // Calculate the maximum value from the array of number strings.
  let maximumValue = Math.max.apply(null, numberStrings);

  // Initialize a variable to store the sum of the numbers.
  let totalSum = 0;

  // Iterate through the array of number strings.
  for (let idx = 0; idx < numberStrings.length; ++idx) {
    // Convert each string to a number and add it to the total sum.
    totalSum += Number(numberStrings[idx]);
  }

  // Output the minimum, maximum, and sum values, separated by spaces.
  console.log(minimumValue + " " + maximumValue + " " + totalSum);
});
