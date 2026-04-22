function processData(entireInput) {
  const lineSegments = entireInput.split('\n');
  // The first line often contains a numerical value (N in this problem),
  // but its content is not utilized in the core logic of counting patterns.
  // const initialNumeric = Number.parseInt(lineSegments[0], 10);
  const targetSequence = lineSegments[1];

  // The original implementation iterates through character arrays.
  // A functionally distinct approach is to leverage regular expressions
  // for pattern recognition within the string.
  // The 'g' flag ensures all non-overlapping occurrences are matched.
  const patternIdentifier = /ABC/g;
  const foundPatterns = targetSequence.match(patternIdentifier);

  // If no matches are found, the .match() method returns null.
  // We need to account for this to return a zero count.
  const totalOccurrences = foundPatterns ? foundPatterns.length : 0;

  console.log(totalOccurrences);
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));