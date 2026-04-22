function analyzeSequence(
  numericValue, // Renamed N
  charData      // Renamed S
) {
  // This block checks if the supplied numeric value is odd.
  if (
    numericValue
    %
    2
    !==
    0
  )
  {
    console.log('No'); // If odd, output "No" to the console.
  }

  // Declare a variable to store the initial segment of the character data.
  let initialSegment = charData.substring(
    0,
    numericValue / 2
  );

  // Declare a constant to hold the concluding part of the character data.
  const finalSegment = charData.substring(
    numericValue / 2,
    numericValue
  );

  // Evaluate if the two extracted segments are identical.
  if (
    initialSegment
    ===
    finalSegment
  ) {
    console.log('Yes'); // If they match, print "Yes".
  }
}

// Acquire the entire content of the standard input file.
const inputContent = require('fs').readFileSync(
  '/dev/stdin',
  'utf8'
);

// Execute the sequence analysis routine.
// The raw file content is passed as the first argument, replicating the original call's structure.
// This implies the second parameter 'charData' will be 'undefined' during execution.
analyzeSequence(inputContent);