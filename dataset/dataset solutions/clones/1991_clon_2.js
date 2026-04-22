// Function to compute the number of valid RGB triplets in a given sequence.
function calculateDistinctTriplets(  sequenceSize, symbolSequence  )
{
  // Convert the input string into an array of individual characters for easier processing.
  const symbolChars = symbolSequence.split('');

  // Initialize counters for each specific color type found within the sequence.
  let   redOccurrences = 0,
        greenOccurrences = 0,
        blueOccurrences = 0;

  // Iterate through every character in the sequence to tally color occurrences.
  for (const currentSymbol of symbolChars) {
    if (currentSymbol === 'R')
      { redOccurrences++; } // Increment count for 'R'
    if (currentSymbol === 'G')
      { greenOccurrences++; } // Increment count for 'G'
    if (currentSymbol === 'B')
      { blueOccurrences++; } // Increment count for 'B'
  }

  // Calculate the total possible combinations if there were no constraints on position or distinctness.
  const initialProduct = redOccurrences * greenOccurrences * blueOccurrences;

  // Initialize a counter for combinations that violate the specific distinctness and spacing rules.
  let invalidForms = 0;

  // Outer loop: iterates through all possible starting positions for the first element of a triplet.
  for (let firstPosition = 0; firstPosition < sequenceSize; firstPosition++)
  {
    // Inner loop: iterates through all possible second positions, ensuring it's strictly after the first.
    for (let secondPosition = firstPosition + 1; secondPosition < sequenceSize; secondPosition++)
    {
      // Condition 1: If the characters at firstPosition and secondPosition are identical, this pair is not valid for a distinct triplet.
      if (symbolChars[firstPosition] === symbolChars[secondPosition])
      {
        continue;
      }

      // Calculate the third position based on the specific geometric progression rule (j - i = k - j, or k = 2j - i).
      let thirdPosition = 2 * secondPosition - firstPosition;

      // Condition 2: Check if the calculated third position is within the bounds of the sequence
      // AND if its character is distinct from both the first and second positions.
      if (thirdPosition >= sequenceSize ||
          symbolChars[thirdPosition] === symbolChars[firstPosition] ||
          symbolChars[thirdPosition] === symbolChars[secondPosition])
      {
        continue;
      }

      // If all conditions are met (distinct characters, valid positions, and specific spacing), it's an invalid triplet by problem definition.
      invalidForms++;
    }
  }

  // Output the final count of valid RGB triplets by subtracting the identified invalid ones from the initial total.
  console.log(initialProduct - invalidForms);
}

// Read the program input from standard input, typically provided by the execution environment.
const programData = require('fs') .readFileSync('/dev/stdin', 'utf8') .split('\n');

// Invoke the main calculation function with the parsed input values.
// The first line of input is the sequence size (N), parsed as an integer.
// The second line is the symbol sequence (S).
calculateDistinctTriplets(parseInt(programData[0]), programData[1]);