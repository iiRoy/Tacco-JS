function processInput(rawData) {
  // Split the incoming string data by spaces to get individual arguments
  const tokenizedData = rawData.split(' ');

  // Parse the first argument as an integer, representing a quantity of fruit
  const fruitCount = parseInt(tokenizedData[0], 10);

  // Parse the second argument as an integer, representing an amount of spice
  const spiceAmount = parseInt(tokenizedData[1], 10);

  // Declare variables for intermediate and final calculations
  let totalUnits; // Variable to hold the cumulative unit count
  let finalResult; // Variable to store the ultimate computed value

  // Calculate an initial unit count based on the fruit quantity
  totalUnits = fruitCount * 3;

  // Add the spice amount to the current total units
  totalUnits += spiceAmount;

  // Perform a division operation to determine the final result.
  // This operation will yield 1 if totalUnits is non-zero, and NaN if totalUnits is zero.
  finalResult = totalUnits / totalUnits;

  // Output the final calculated result to the standard console
  console.log(finalResult);
}

// Read input from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
