function processInput(inputString) {
  'use strict';

  // Extract the target sequence length from the first line of the provided text.
  const sequenceLength = parseInt(inputString.split("\n").shift());

  // Define the fundamental building blocks (nucleotides) for the sequences.
  const nucleotideSet = ["A", "T", "G", "C"];

  // Establish a large prime number for modulo arithmetic to manage result size.
  const modulusValue = 1000000007;

  // Initialize the primary data structure to hold valid sequence counts for the current iteration.
  let currentPatterns = [];

  // Create an auxiliary data structure to serve as a template for resetting counts in each step.
  const initialPatternCounts = [];

  // This anonymous function, executed immediately, generates all valid 3-character starting sequences.
  (function generateValidTriplets(initialFragment) {
    const combinationQueue = [initialFragment]; // Begin with an empty fragment.

    // Continue processing fragments until the queue is empty.
    while (combinationQueue.length !== 0) {
      const currentSequence = combinationQueue.shift(); // Retrieve the next fragment.

      // If the fragment is not yet 3 characters long, extend it with all possible nucleotides.
      if (currentSequence.length !== 3) {
        nucleotideSet.forEach(currentNucleotide => combinationQueue.push(currentSequence + currentNucleotide));
      } else {
        // If the fragment is 3 characters long, check if it's one of the disallowed patterns.
        // The forbidden patterns are 'ACG', 'AGC', 'GAC'.
        if (!currentSequence.match(/ACG|AGC|GAC/)) {
          currentPatterns[currentSequence] = 1; // Mark this valid 3-char sequence with an initial count of one.
          initialPatternCounts[currentSequence] = 0; // Prepare the reset template with a zero count.
        }
      }
    }
  })(""); // Invoke the function with an empty string to start the generation.


  // Handle the specific case where the desired sequence length is exactly three.
  if (sequenceLength === 3) {
    console.log(Object.keys(currentPatterns).length); // Output the total number of unique valid 3-char sequences.
  } else { // For sequence lengths greater than three, proceed with iterative calculation.
    // Loop to progressively build sequences from length 4 up to the target length.
    for (let iterationStep = 0; iterationStep < sequenceLength - 3; iterationStep++) {
      // Create a fresh container for the next iteration's pattern counts, initialized with zeros.
      const nextIterationPatterns = Object.assign([], initialPatternCounts);

      // Iterate through each valid pattern found in the current iteration.
      Object.keys(currentPatterns).forEach(currentPatternKey => {
        const currentPatternValue = currentPatterns[currentPatternKey]; // Get the count associated with this pattern.

        // Append each possible nucleotide to the current pattern to form a longer sequence.
        nucleotideSet.forEach(currentNucleotide => {
          const prospectiveSequence = currentPatternKey + currentNucleotide; // Construct a potential 4-char sequence.

          // Verify that this new sequence, or its 3-char suffixes, does not contain any forbidden motifs.
          // Forbidden motifs include: ACG, AGC, GAC, AG.C, A.GC
          if (!prospectiveSequence.match(/ACG|AGC|GAC|AG.C|A.GC/)) {
            // If the sequence is valid, update the count for its last three characters.
            // The modulo operation is applied here to prevent integer overflow.
            nextIterationPatterns[prospectiveSequence.slice(-3)] = (nextIterationPatterns[prospectiveSequence.slice(-3)] + currentPatternValue) % modulusValue;
          }
        });
      });
      currentPatterns = nextIterationPatterns; // Promote the new patterns to become the current patterns for the subsequent loop.
    }

    // After completing all iterations, sum up the counts of all remaining valid 3-char patterns.
    const overallTotal = Object.keys(currentPatterns).reduce((sumAccumulator, patternIdentifier) => sumAccumulator + currentPatterns[patternIdentifier], 0);

    // Display the final accumulated count, ensuring it's within the modulo range.
    console.log(overallTotal % modulusValue);
  }
}

// The following code block is responsible for reading input from standard input and invoking the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));