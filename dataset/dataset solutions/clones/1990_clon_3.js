function processInputData(rawData) {
  // Helper function to parse raw text data into an array of lines.
  // This abstracts the string manipulation for cleaner main logic.
  const extractLines = (textPayload) => textPayload.trim().split('\n');
  const processedInputLines = extractLines(rawData);

  // Parse the sequence length from the first line, ensuring it's an integer.
  const sequenceElementCount = parseInt(processedInputLines[0], 10);
  // Extract the character sequence string from the second line.
  const characterSequence = processedInputLines[1];

  // --- Input Data Validation (Type III addition for robustness) ---
  // This section adds checks for malformed or insufficient input,
  // which is a structural enhancement to make the code more robust.
  if (
    isNaN(sequenceElementCount) ||
    sequenceElementCount <= 0 ||
    !characterSequence ||
    characterSequence.length === 0 ||
    characterSequence.length !== sequenceElementCount
  ) {
    // In a real-world application, this might throw an error or return an error code.
    // For competitive programming, we assume valid input, but this demonstrates an added check.
    console.error("Error: Input data is malformed or does not meet expected constraints.");
    // A graceful exit or default value might be used here, but for this problem,
    // we'll proceed, potentially with incorrect results, to demonstrate the structural change.
  }

  // --- Categorize Character Indices (Type II and III changes) ---
  // Instead of simple R, G, B, more descriptive variable names are used.
  // The data structure remains an array of indices.
  const positionsOfRedChars = [];
  const positionsOfGreenChars = [];
  const positionsOfBlueChars = [];

  // Iterate through the character sequence to populate the index arrays.
  // Changed from a `forEach` loop to a traditional `for` loop for structural variation.
  // Also, switched from `if/else if` chain to a `switch` statement.
  for (let currentPosition = 0; currentPosition < characterSequence.length; ++currentPosition) {
    const charAtCurrentPosition = characterSequence[currentPosition]; // Renamed 'e' to 'charAtCurrentPosition'
    switch (charAtCurrentPosition) {
      case 'R':
        positionsOfRedChars.push(currentPosition);
        break;
      case 'G':
        positionsOfGreenChars.push(currentPosition);
        break;
      case 'B':
        positionsOfBlueChars.push(currentPosition);
        break;
      default:
        // Added a default case for unexpected characters, demonstrating robustness.
        // In this specific problem context, it might not be strictly necessary
        // as inputs are usually guaranteed to be 'R', 'G', 'B'.
        // console.warn(`Warning: Encountered unexpected character '${charAtCurrentPosition}' at index ${currentPosition}.`);
        break;
    }
  }

  // --- Initial Calculation: Total Potential Distinct Triplets (Type II & III changes) ---
  // This calculates the total number of triplets (i, j, k) where S[i], S[j], S[k] are distinct
  // (i.e., one 'R', one 'G', one 'B') without any index-based restrictions (like j-i != k-j).
  // Renamed 'count' to 'totalCandidateTriplets'.
  let totalCandidateTriplets =
    positionsOfRedChars.length * positionsOfGreenChars.length * positionsOfBlueChars.length;

  // --- Calculate Equidistant Triplet Exceptions (Type II & III changes) ---
  // This section identifies triplets that *do* satisfy the equidistant condition (j - i === k - j)
  // AND have distinct characters, which need to be subtracted from the total.
  // Renamed 'notCount' to 'equidistantViolationsCount'.
  let equidistantViolationsCount = 0;

  // Outer loop for the first index of the triplet.
  for (let firstElementIndex = 0; firstElementIndex < sequenceElementCount; firstElementIndex++) { // Renamed 'i'
    // Inner loop for the second index, ensuring it's strictly greater than the first.
    for (let secondElementIndex = firstElementIndex + 1; secondElementIndex < sequenceElementCount; secondElementIndex++) { // Renamed 'j'
      // Calculate the third index based on the equidistant property:
      // secondElementIndex - firstElementIndex === thirdElementIndex - secondElementIndex
      // This simplifies to: thirdElementIndex = (2 * secondElementIndex) - firstElementIndex
      // Using bit shift `<< 1` instead of `* 2` for a minor stylistic/performance variation.
      const derivedThirdElementIndex = (secondElementIndex << 1) - firstElementIndex;

      // --- Guard Clause (Type III addition) ---
      // Check if the derived third index is within the bounds of the character sequence.
      // If it's out of bounds, this potential triplet is invalid, so we skip to the next iteration.
      if (derivedThirdElementIndex >= sequenceElementCount) {
        continue; // Move to the next `secondElementIndex`
      }

      // Retrieve the characters at the three identified positions.
      const charAtFirstPosition = characterSequence[firstElementIndex];
      const charAtSecondPosition = characterSequence[secondElementIndex];
      const charAtThirdPosition = characterSequence[derivedThirdElementIndex];

      // --- Distinct Character Check (Type II & III changes) ---
      // Evaluate if all three characters are unique (e.g., one 'R', one 'G', one 'B').
      // Stored in a boolean variable for improved readability.
      const areAllCharactersUnique = (
        charAtFirstPosition !== charAtSecondPosition &&
        charAtSecondPosition !== charAtThirdPosition &&
        charAtFirstPosition !== charAtThirdPosition
      );

      // If the characters are distinct AND the indices are equidistant,
      // this triplet represents a "bad" case that must be subtracted.
      if (areAllCharactersUnique) {
        equidistantViolationsCount++;
      }
    }
  }

  // --- Final Result Calculation and Output (Type II changes) ---
  // The final answer is the total number of possible distinct RGB triplets
  // minus those specific triplets that also meet the equidistant condition.
  const finalCalculatedResult = totalCandidateTriplets - equidistantViolationsCount;
  console.log(finalCalculatedResult);
}

// --- Input Reading Mechanism (Type III change for modularity) ---
// Encapsulating the standard input reading into a small helper function.
const retrieveStandardInput = () => require("node:fs").readFileSync("/dev/stdin", "utf8");

// Execute the main processing logic with the data read from standard input.
processInputData(retrieveStandardInput());