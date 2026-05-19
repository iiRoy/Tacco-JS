function processData(rawData) {
  // Remove any leading or trailing whitespace from the raw input string.
  rawData = rawData.trim();

  // Split the cleaned string by spaces and convert each resulting substring into a number.
  const numericValues = rawData.split(" ").map(Number);
 
  // Calculate the product of the first two numbers, then find the minimum between that product and the third number.
  // The final result is then printed to the standard output.
  console.log(Math.min(numericValues[0] * numericValues[1], numericValues[2]));
}

// Read the entire content from standard input, decode it as UTF-8, and pass it to the processing function.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
