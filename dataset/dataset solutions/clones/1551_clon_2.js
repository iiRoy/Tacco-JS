// This function processes a raw text payload for string comparison.
function AnalyzeStringSimilarity(incomingData) {
  // The provided data is broken down into individual text rows.
  const textRows = incomingData.split('\n');
  const primarySequence = textRows[0];
  const secondarySequence = textRows[1];

  // Initialize the minimum difference encountered so far.
  let minimumDifference = secondarySequence.length;

  // Handle the edge case where the pattern sequence is empty.
  if (secondarySequence.length === 0) {
    return console.info(0);
  }

  // Iterate through all possible starting positions within the primary sequence.
  for (let currentStartIndex = 0; currentStartIndex < primarySequence.length - secondarySequence.length; currentStartIndex++) {
    // Initialize the count of differences for the current window.
    let currentMismatchCount = 0;

    // Compare characters within the current window of the primary sequence against the secondary sequence.
    for (let charIndex = 0; charIndex < secondarySequence.length; charIndex++) {
      const mainCharacter = primarySequence.substring(currentStartIndex + charIndex, currentStartIndex + charIndex + 1);
      const patternCharacter = secondarySequence.substring(charIndex, charIndex + 1);

      // If characters do not match, increment the mismatch counter.
      if (mainCharacter !== patternCharacter) {
        currentMismatchCount++;
      }
    }

    // Update the overall minimum difference if the current window has fewer mismatches.
    if (currentMismatchCount < minimumDifference) {
      minimumDifference = currentMismatchCount;
    }
  }

  // Display the final calculated minimum difference.
  console.info(minimumDifference);
}

// The following section handles standard input/output and should not be modified.
AnalyzeStringSimilarity(require('node:fs').readFileSync('/dev/stdin', 'utf8'));