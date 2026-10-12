function ProcessInput(rawData) {
  // This function processes the incoming raw data string.
  // It expects two space-separated integer values.

  // Split the input string into an array of substrings using a space as delimiter.
  let partsArray = rawData.split(" ");

  // Parse the first part as an integer, using base 10.
  let firstNumber = parseInt(partsArray[0], 10);

  // Parse the second part as an integer, also using base 10.
  let secondNumber = parseInt(partsArray[1], 10);

  // Check if the first number is perfectly divisible by the second number.
  if (firstNumber % secondNumber === 0) {
    // If it is perfectly divisible, output -1 to the console.
    console.log(-1);
    // Terminate the function execution.
    return;
  } else {
    // Otherwise (if not perfectly divisible), output the first number to the console.
    console.log(firstNumber);
  }
}

// Read the content from standard input synchronously,
// using UTF-8 encoding, and then pass it to our processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
