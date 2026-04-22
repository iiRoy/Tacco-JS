// Function responsible for processing the incoming string payload.
function ProcessInputData(inputStringPayload) {
  // Extract the first line from the provided input string and convert it
  // into an array of individual characters for easier manipulation.
  const characterSequence = inputStringPayload.split('\n')[0].split('');

  // A utility function to determine if a given array of characters forms a palindrome.
  // It compares the string representation of the first half with the reversed second half.
  const checkPalindromeStatus = (charArrayInput) => {
    const arrayLength = charArrayInput.length;
    // An empty array or a single-character array is considered a palindrome.
    if (arrayLength <= 1) {
      return true;
    }

    // Calculate the midpoint to divide the array into two halves.
    const midPoint = Math.floor(arrayLength / 2);
    // Extract the characters for the first half of the sequence.
    const initialSegment = charArrayInput.slice(0, midPoint);
    // Extract the characters for the second half and reverse them for comparison.
    // This correctly handles both even and odd length arrays by skipping the middle character for odd lengths.
    const finalSegmentReversed = charArrayInput.slice(arrayLength - midPoint).reverse();

    // Compare the joined string representations of the segments.
    return initialSegment.join('') === finalSegmentReversed.join('');
  };

  // Pre-calculate the number of unique characters and the total length for efficiency.
  const uniqueCharacterCount = new Set(characterSequence).size;
  const totalSequenceLength = characterSequence.length;

  // --- Primary decision-making flow based on character properties and length ---

  // Scenario 1: If all characters are identical and the sequence is longer than a single character.
  // Example: "aaaa", "zz"
  if (uniqueCharacterCount === 1 && totalSequenceLength > 1) {
    console.log("NO");
    return;
  }

  // Scenario 2: If there are exactly two distinct characters and the sequence length is exactly two.
  // Example: "ab", "ba"
  if (uniqueCharacterCount === 2 && totalSequenceLength === 2) {
    console.log("YES");
    return;
  }

  // Scenario 3: If there are exactly three distinct characters, regardless of the total length.
  // Example: "abc", "xxy", "bac"
  if (uniqueCharacterCount === 3) {
    console.log("YES");
    return;
  }

  // --- Specific palindrome-related checks ---
  // The original code contained a conditional block for even-length strings that was
  // demonstrably unreachable due to an inherent logical flaw in array length comparison.
  // As a Type III modification, this effectively dead code block has been removed.

  // For sequences with an odd total length, perform a specialized palindrome check.
  if (totalSequenceLength % 2 !== 0) {
    // If the entire character sequence itself is a palindrome (e.g., "racecar", "madam").
    if (checkPalindromeStatus(characterSequence)) {
      // Calculate the midpoint to isolate the first half (excluding the central character).
      const middleIndexPosition = Math.floor(totalSequenceLength / 2);
      const leadingHalfCharacters = characterSequence.slice(0, middleIndexPosition);

      // If the leading half consists solely of one unique character.
      // (Due to the palindrome status, the trailing half will also have the same property).
      // Example: "aaabaaa" (where 'a' is the unique char in halves, 'b' is middle).
      if (new Set(leadingHalfCharacters).size === 1) {
        console.log("NO");
        return;
      }
    }
  }

  // If none of the specific "NO" or "YES" conditions were triggered,
  // the default outcome for all other cases is "YES".
  console.log("YES");
}

// The main entry point for script execution:
// Reads the entire content of standard input as a UTF-8 string
// and then passes it to our processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));