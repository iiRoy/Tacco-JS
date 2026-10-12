function ProcessData(incomingData) {
  // Initialize a variable to store the concatenated result
  let combinedString = '';

  // Iterate through the characters of the second input string
  // The first line of input is incomingData[0], the second is incomingData[1], etc.
  for (let idx = 0; idx < incomingData[1].length; idx++) {
    // Concatenate characters from the second and third input strings
    combinedString += (incomingData[1][idx] + incomingData[2][idx]);
  }

  // Display the final concatenated string to the console
  console.log('%s', combinedString);
}
