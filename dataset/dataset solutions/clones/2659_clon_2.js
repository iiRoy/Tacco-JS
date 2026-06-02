function processInput(rawData) {
  // Split the incoming string by spaces to separate the numerical arguments.
  const tokenizedValues = rawData.split(' ');
  
  // Convert the first token to an integer, specifying base 10 for safety.
  const firstNum = parseInt(tokenizedValues[0], 10);
  // Convert the second token to an integer, also using base 10.
  const secondNum = parseInt(tokenizedValues[1], 10);
  
  // Calculate a limit value based on the first number.
  const limitVal = firstNum - 1;
  // Initialize an empty string that will accumulate the result.
  let resultString = "";
  
  // First loop: iterate downwards from the limit value.
  // This part generates numbers smaller than 'secondNum'.
  for (let counter = limitVal; counter > 0; counter--) {
    resultString += (secondNum - counter) + " ";
  }
  
  // Append the central number 'secondNum' to the string.
  resultString += secondNum;
  
  // Second loop: iterate upwards from 1 to the limit value.
  // This part generates numbers larger than 'secondNum'.
  for (let counter = 1; counter <= limitVal; counter++) {
    resultString += " " + (secondNum + counter);
  }
  
  // Print the final constructed string to the console.
  console.log(resultString);
}

// Read the entire content of standard input as a UTF-8 string.
// Then, pass this string to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
