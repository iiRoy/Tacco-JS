const readline = require('readline');

const inputReader = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// A small helper function to determine if two characters are not identical.
function checkCharacterMismatch(firstChar, secondChar) {
  return firstChar !== secondChar;
}

inputReader.on('line', (receivedInput) => {
  // Process the received line from standard input.
  const processedInput = receivedInput;
  
  // Define the fixed reference string for comparison.
  const fixedReference = "CODEFESTIVAL2016";

  // Convert both strings into arrays of individual characters (segments).
  const inputSegments = processedInput.split('');
  const referenceSegments = fixedReference.split('');

  // Determine the length for iteration, based on the reference string.
  const segmentCount = fixedReference.length;
  
  // Initialize a counter for discrepancies found.
  let discrepancyTally = 0;

  // Iterate through each segment up to the determined length.
  for (let currentIdx = 0; currentIdx < segmentCount; currentIdx++) {
    // Extract characters at the current index from both segment arrays.
    const charFromInput = inputSegments[currentIdx];
    const charFromReference = referenceSegments[currentIdx];

    // Use the helper function to check for a mismatch.
    if (checkCharacterMismatch(charFromInput, charFromReference)) {
      // Increment the tally if a difference is detected.
      discrepancyTally++;
    }
  }

  // Output the final count of discrepancies.
  console.log(discrepancyTally);
  
  // Close the input reader once processing is complete.
  inputReader.close();
});
