const computeResult = (inputLines) => {
  // Parse the second line of input into an array of numbers.
  // The first line typically contains the count, which is not used here.
  const numberArray = inputLines[1].split(' ').map(numStr => Number(numStr));

  // Define a large prime number for modulo operations to prevent overflow.
  const moduloVal = Math.pow(10, 9) + 7;

  // Initialize the overall sum accumulator.
  let totalSum = 0;

  // Iterate through each element in the number array.
  for (let idxA = 0; idxA < numberArray.length; idxA++) {
    // Initialize a sum for elements following the current numberArray[idxA].
    let partialSum = 0;

    // Iterate through elements after the current one (numberArray[idxA]).
    for (let idxB = idxA + 1; idxB < numberArray.length; idxB++) {
      // Accumulate the partial sum, applying modulo at each step.
      partialSum = (partialSum + numberArray[idxB]) % moduloVal;
    }

    // Update the total sum: (current number * partial sum) % moduloVal,
    // then add to totalSum and apply modulo again.
    totalSum = (totalSum + ((numberArray[idxA] * partialSum) % moduloVal)) % moduloVal;
  }

  // Output the final calculated sum.
  console.log(totalSum);
};

// Variable to accumulate raw input data from stdin.
let rawData = '';

// Event listener for incoming data on standard input.
process.stdin.on('data', (chunk) => {
  rawData += chunk;
});

// Event listener for the end of standard input.
process.stdin.on('end', () => {
  // Import the End-Of-Line constant from the 'os' module.
  const { EOL } = require('os');
  // Split the accumulated raw data into an array of lines using the system's EOL.
  const inputLines = rawData.split(EOL);
  // Process the parsed lines.
  computeResult(inputLines);
});
