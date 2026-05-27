// This module handles processing of incoming text data.
function ProcessInput(rawData) {
  // Declare two variables to store the numerical values extracted from the input.
  let firstNum, secondNum;

  // Extract the first number from the initial line of the raw data.
  // It splits by newline, takes the first line, splits by space, and takes the first part.
  firstNum = Number(rawData.split('\n')[0].split(' ')[0]);

  // Extract the second number from the initial line of the raw data.
  // It follows the same parsing logic but takes the second part after splitting by space.
  secondNum = Number(rawData.split('\n')[0].split(' ')[1]);

  // Evaluate the relationship between the two numbers and print the appropriate result.
  if (firstNum === secondNum) {
    // If both numbers are exactly the same, the result is 0.
    console.log(0);
  } else if ((firstNum + secondNum) % 2 === 0) {
    // If the sum of the two numbers is an even number, print half of their sum.
    console.log((firstNum + secondNum) / 2);
  } else {
    // In all other cases (i.e., if the sum is odd), it's considered impossible.
    console.log('IMPOSSIBLE');
  }
}

// The following line is responsible for reading input from standard input and passing it to the processing function.
// It should not be altered as it manages the interaction with the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
