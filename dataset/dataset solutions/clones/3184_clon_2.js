// This function processes the entire input string provided.
function ProcessInput(rawData) {
  // Divide the incoming text into an array of strings using space as a delimiter.
  let numberArray = rawData.split(" ");

  // Iterate through the array to convert each string element into an integer.
  for (let idx = 0; idx < numberArray.length; idx++) {
    numberArray[idx] = parseInt(numberArray[idx], 10); // Explicitly specify base 10 for parsing.
  }

  let finalResult; // A variable to hold the calculated outcome.

  // Evaluate a condition based on the first two numbers in the array.
  // If the second number is perfectly divisible by the first number, perform addition.
  if (numberArray[1] % numberArray[0] === 0) {
    finalResult = numberArray[1] + numberArray[0];
  } else {
    // Otherwise, perform subtraction.
    finalResult = numberArray[1] - numberArray[0];
  }

  // Display the computed result to the console.
  console.log(finalResult);
}

// The following line handles reading from standard input and invoking the main processing function.
// It should not be altered as it manages the program's interaction with the environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
