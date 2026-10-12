const processInput = (inputData) => {
  // This function processes the given input data to calculate a product.
  const lines = inputData.split('\n'); // Divides the input string into an array of lines.

  const count = +lines[0]; // Parses the first line as a number, representing the count of elements.
  const numbersAsStrings = lines[1].split(' '); // Splits the second line by spaces to get an array of number strings.

  let productResult = 1n; // Initializes a BigInt variable to hold the cumulative product, starting with 1.

  // Iterates through each number string to calculate the product.
  for (let idx = 0; idx < count; idx++) {
    productResult *= BigInt(numbersAsStrings[idx]); // Converts the current number string to a BigInt and multiplies it with the running product.
  }

  // Checks if the final product exceeds a predefined BigInt threshold (10^8).
  if (productResult > BigInt(10) ** BigInt(8)) {
    productResult = -1n; // If the product is too large, it's reset to -1n.
  }

  console.log(`${productResult}`); // Prints the final calculated product to the console.
};

// Reads the entire content of standard input synchronously and passes it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
