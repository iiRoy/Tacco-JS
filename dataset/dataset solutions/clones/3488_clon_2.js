function processInput(rawData) {
  // This function processes the provided raw input string.

  // Extract the first numerical component from the input,
  // assuming it's separated by a space.
  const firstValue = parseInt(rawData.split(" ")[0], 10);

  // Obtain the second numerical component, expected on the second line.
  const secondValue = parseInt(rawData.split("\n")[1], 10);

  // Retrieve the third numerical component, located on the third line.
  const thirdValue = parseInt(rawData.split("\n")[2], 10);

  // Evaluate the first extracted number to determine the program's action.
  if (firstValue === 1) {
    // If the first value is one, print a specific greeting.
    console.log("Hello World");
  } else {
    // Otherwise, calculate and display the sum of the second and third values.
    console.log(secondValue + thirdValue);
  }
}

// Read the entire content from standard input synchronously and
// then pass it to our processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
