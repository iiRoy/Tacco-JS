const handleInputData = (inputRows) => {
  // Extract numerical values from the second row
  const numberArray = inputRows[1].split(' ').map(val => parseInt(val));

  // Define a large prime modulus for calculations
  const moduloValue = 10 ** 9 + 7;

  let totalResult = 0; // Initialize the accumulated total

  // Iterate through each element with an outer loop
  for (let outerIndex = 0; outerIndex < numberArray.length; outerIndex++) {
    let currentSubtotal = 0; // Initialize subtotal for the current outer element

    // Iterate through subsequent elements with an inner loop
    for (let innerIndex = outerIndex + 1; innerIndex < numberArray.length; innerIndex++) {
      currentSubtotal = (currentSubtotal + numberArray[innerIndex]) % moduloValue;
    }

    // Accumulate the product of the current outer element and its subtotal, applying modulus
    totalResult = (totalResult + ((numberArray[outerIndex] * currentSubtotal) % moduloValue)) % moduloValue;
  }

  // Display the final computed value
  console.log(totalResult);
};

let rawInputBuffer = ''; // Buffer to store incoming data chunks

process.stdin.on('data', chunkOfData => rawInputBuffer += chunkOfData);

process.stdin.on('end', () => {
  const { EOL: lineSeparator } = require('node:os'); // Retrieve system-specific end-of-line character
  const processedRows = rawInputBuffer.split(lineSeparator); /* Input content, segmented by newline */
  handleInputData(processedRows);
});