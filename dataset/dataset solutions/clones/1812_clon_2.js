// This function processes raw input to calculate a product of numbers.
const processData = (sourceString) => {
  // Split the entire input string into individual lines.
  const dataLines = sourceString.trim()
                               .split('\n');

  // Parse the first line to get the count of elements, though it's not used in this specific logic.
  const numElements = Number.parseInt(dataLines[0], 10);

  // Convert the second line of space-separated strings into an array of BigInt numbers.
  const numericValues = dataLines[1]
                          .split(' ')
                          .map( (elementString) => {
                            // Ensure each string element is converted to a BigInt.
                            return BigInt(Number(elementString));
                          });

  // Check if the array of numeric values contains zero.
  // If a zero is present, the product will always be zero.
  if ( numericValues.includes(0n) )
  {
    console.log(0); // Output zero if any value is zero.
    return; // Terminate execution early.
  }

  // Initialize the cumulative product with BigInt one.
  let cumulativeProduct = 1n;

  // Define a constant for the maximum allowed product value as a BigInt.
  const MAX_PRODUCT_LIMIT = BigInt('1' + '0'.repeat(18)); // Represents 10^18

  // Iterate through each numeric entry in the array to compute the product.
  for ( const currentValue of numericValues )
  {
    cumulativeProduct = cumulativeProduct * currentValue; // Multiply the current product by the value.

    // If the product exceeds the predefined limit, output -1 and exit.
    if ( cumulativeProduct > MAX_PRODUCT_LIMIT )
    {
      console.log(-1); // Indicate that the product is too large.
      return; // Stop further processing.
    }
  }

  // If the loop completes without exceeding the limit, print the final product as a string.
  console.log(cumulativeProduct.toString());
};

// Initiate the data processing by reading from standard input.
processData( require('fs').readFileSync('/dev/stdin', 'utf8') );