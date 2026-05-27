function processInput(inputString) {
  // Split the input string into an array of characters
  const characterArray = inputString.split('');

  // Get the last character, which represents the final digit
  const finalDigit = characterArray[characterArray.length - 1];

  // Initialize a string variable, though it's not used for output in this specific logic path.
  let resultString = "";

  // Check the value of the final digit to determine the output
  if (finalDigit == 2 || finalDigit == 4 || finalDigit == 5 || finalDigit == 7 || finalDigit == 9) {
    // If the digit is one of these, print 'hon'
    console.log('hon');
    return; // Exit the function
  } else if (finalDigit == 3) {
    // If the digit is 3, print 'bon'
    console.log('bon');
    return; // Exit the function
  } else if (finalDigit == 0 || finalDigit == 1 || finalDigit == 6 || finalDigit == 8) {
    // If the digit is one of these, print 'pon'
    console.log('pon');
    return; // Exit the function
  }
}

// Read the entire content from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
