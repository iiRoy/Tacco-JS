function ProcessInput(rawData) {
  // Split the incoming raw data by space to get individual string tokens.
  var tokenizedData = rawData.split(" ");

  // Parse the first token as an integer, using base 10.
  var firstNumber = parseInt(tokenizedData[0], 10);

  // Parse the second token as an integer, also using base 10.
  var secondNumber = parseInt(tokenizedData[1], 10);

  // Initialize an empty string to build the final result.
  var resultString = "";

  // Check if the first number is strictly less than the second number.
  if (firstNumber < secondNumber) {
    // If 'firstNumber' is smaller, append 'firstNumber' to the result 'secondNumber' times.
    for (var loopCounter = 0; loopCounter < secondNumber; loopCounter++) {
      resultString += firstNumber;
    }
  } else {
    // Otherwise (if 'firstNumber' is greater than or equal to 'secondNumber'),
    // append 'secondNumber' to the result 'firstNumber' times.
    for (var loopCounter = 0; loopCounter < firstNumber; loopCounter++) {
      resultString += secondNumber;
    }
  }

  // Print the constructed string to the console.
  console.log(resultString);
}

// Read input from standard input using Node.js 'fs' module and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
