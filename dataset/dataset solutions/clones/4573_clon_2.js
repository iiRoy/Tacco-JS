process.stdin.resume(); // Initiate the input stream for reading.
process.stdin.setEncoding('utf8'); // Configure the character encoding for incoming data.

// This section defines the primary logic for handling input data.
process.stdin.on('data', function (incomingBlockOfData) {
  // Convert the received data chunk to a string and break it into an array of substrings using space as a delimiter.
  let numericalStringsArray = incomingBlockOfData.toString().split(' ');

  // Parse the first three elements of the array into integer constants.
  const minimumValue = parseInt(numericalStringsArray[0], 10);
  const maximumValue = parseInt(numericalStringsArray[1], 10);
  const targetValue = parseInt(numericalStringsArray[2], 10);

  // Evaluate if the third parsed value falls inclusively within the range defined by the first two.
  if ( minimumValue <= targetValue && targetValue <= maximumValue )
  {
    console.log("Yes"); // Output the affirmative response if the condition holds true.
  }
  else
  {
    console.log("No");  // Output the negative response otherwise.
  }
});