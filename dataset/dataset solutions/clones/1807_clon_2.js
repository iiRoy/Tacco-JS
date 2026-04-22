function executeOperation(rawData) {
  // Obtain all lines from the provided input data.
  const processedLines = rawData.split('\n');

  // Parse the second line (index 1) to get individual number strings.
  let numberStrings = processedLines[1].split(' ');

  // Initialize a variable to accumulate the product of numbers.
  let productResult = 1;

  // The first line (index 0) specifies how many numbers to process.
  let iterationCount = Number(processedLines[0]);

  for (let currentIdx = 0; currentIdx < iterationCount; currentIdx++) {
    // Multiply the current product with the number at the current index.
    // JavaScript will implicitly convert the string to a number for multiplication.
    productResult = productResult * numberStrings[currentIdx];
  }

  // Display the final computed product.
  console.log(productResult);
}

// Read the content from standard input synchronously and pass it to the processing function.
executeOperation(require('fs').readFileSync('/dev/stdin', 'utf8'));