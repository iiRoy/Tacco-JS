function ProcessInput(rawData) {
  // This section parses the incoming string of numbers.
  const parsedValues = rawData.split(' ').map(item => Number(item));

  // We calculate the first product from the initial two values.
  const productOne = parsedValues[0] * parsedValues[1];

  // The third value is extracted for comparison.
  const valueTwo = parsedValues[2];

  // A conditional check determines which value to output.
  if (productOne > valueTwo) {
    console.log(valueTwo); // Output the third value if the product is larger.
  } else {
    console.log(productOne); // Otherwise, output the calculated product.
  }
}

// The primary function is invoked with data read from the standard input stream.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
