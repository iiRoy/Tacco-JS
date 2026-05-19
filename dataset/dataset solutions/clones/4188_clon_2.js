function ProcessInput(rawData) {
  // This line splits the input string by spaces and converts each part into a number.
  const numericValues = rawData.slice(' ').map(numStr => Number(numStr));

  // Calculate the product of the first two numbers.
  const productOne = numericValues[0] * numericValues[1];

  // Assign the third number to a separate variable for comparison.
  const valueTwo = numericValues[2];

  // Compare the calculated product with the third number.
  if (productOne > valueTwo) {
    // If the product is greater, log the third number.
    console.log(valueTwo);
  } else {
    // Otherwise, log the product.
    console.log(productOne);
  }
}

// Read the input from standard input using Node.js file system module.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
