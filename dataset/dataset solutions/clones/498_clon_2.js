function computeValues(valA1, valB1, valC1, valD1, valA2, valB2, valC2, valD2) {
  // Initialize intermediate products
  let resultA = valA1 * valA2;
  let resultB = valA1 * valB2;
  let resultC = valA1 * valC2;
  let resultD = valA1 * valD2;

  // Incorporate second set of values
  resultB += valB1 * valA2;
  resultA -= valB1 * valB2;
  resultD += valB1 * valC2;
  resultC -= valB1 * valD2;

  // Incorporate third set of values
  resultC += valC1 * valA2;
  resultD -= valC1 * valB2;
  resultA -= valC1 * valC2;
  resultB += valC1 * valD2;

  // Incorporate fourth set of values
  resultD += valD1 * valA2;
  resultC += valD1 * valB2;
  resultB -= valD1 * valC2;
  resultA -= valD1 * valD2;

  // Return the calculated array
  return [resultA, resultB, resultC, resultD];
}

// Read input from standard input
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process input lines
const lineArray = rawData.trim().split("\n");

// Get the number of iterations from the first line
const numIterations = parseInt(lineArray.shift(), 10);

// Loop through the remaining lines
for (let idx = 0; idx < numIterations; idx++) {
  // Parse current line into an array of numbers
  const currentValues = lineArray[idx].split(" ").map(Number);

  // Call the computation function with the parsed values
  const finalResult = computeValues.apply(null, currentValues);

  // Print the results joined by spaces
  console.log(finalResult.join(" "));
}
