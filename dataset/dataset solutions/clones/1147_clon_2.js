const computeEditDistance = (rawTextData) => {
  // Obtain individual line segments from the entire input block
  const lineFragments = rawTextData.split('\n');

  // Designate the first parsed line as the primary sequence
  const primarySequence = lineFragments[0];
  // Designate the second parsed line as the secondary sequence
  const secondarySequence = lineFragments[1];

  // Capture the character count for the primary string
  const primarySequenceLength = primarySequence.length;
  // Capture the character count for the secondary string
  const secondarySequenceLength = secondarySequence.length;

  // Initialize a two-dimensional array to store interim distance computations
  // This matrix will ultimately contain the Levenshtein distance
  const calculationMatrix = [];

  // Populate the initial column of the calculation matrix
  // This represents the cost of transforming an empty string to a prefix of the primary sequence by insertions
  for (let currentPrimaryIndex = 0; currentPrimaryIndex <= primarySequenceLength; currentPrimaryIndex++) {
    calculationMatrix[currentPrimaryIndex] = []; // Establish an inner array for the current row
    calculationMatrix[currentPrimaryIndex][0] = currentPrimaryIndex; // Cost is simply the index for deletions
  }

  // Populate the initial row of the calculation matrix
  // This represents the cost of transforming an empty string to a prefix of the secondary sequence by insertions
  for (let currentSecondaryIndex = 0; currentSecondaryIndex <= secondarySequenceLength; currentSecondaryIndex++) {
    calculationMatrix[0][currentSecondaryIndex] = currentSecondaryIndex; // Cost is simply the index for insertions
  }

  // Iterate through the matrix, commencing from the second row and column (index 1)
  // This loop calculates the minimum edit operations (insertions, deletions, substitutions)
  // for all possible prefixes of the two sequences
  for (let currentPrimaryIndex = 1; currentPrimaryIndex <= primarySequenceLength; currentPrimaryIndex++) {
    for (let currentSecondaryIndex = 1; currentSecondaryIndex <= secondarySequenceLength; currentSecondaryIndex++) {
      // Determine the expense of character replacement: zero if characters match, one otherwise
      const characterMismatchCost = (primarySequence[currentPrimaryIndex - 1] === secondarySequence[currentSecondaryIndex - 1]) ? 0 : 1;

      // Compute the minimum of three potential operations:
      // 1. Deletion from primary: value from cell above + 1
      // 2. Insertion into primary: value from cell to the left + 1
      // 3. Substitution: value from diagonal cell (top-left) + characterMismatchCost
      calculationMatrix[currentPrimaryIndex][currentSecondaryIndex] = Math.min(
        Math.min(calculationMatrix[currentPrimaryIndex - 1][currentSecondaryIndex] + 1,
                 calculationMatrix[currentPrimaryIndex][currentSecondaryIndex - 1] + 1),
        calculationMatrix[currentPrimaryIndex - 1][currentSecondaryIndex - 1] + characterMismatchCost
      );
    }
  }

  // The final minimum edit distance is located at the bottom-right corner of the matrix
  console.log(calculationMatrix[primarySequenceLength][secondarySequenceLength]);
};

// Initiate the distance computation by supplying content read from standard input
computeEditDistance(require('node:fs').readFileSync('/dev/stdin', 'utf8'));