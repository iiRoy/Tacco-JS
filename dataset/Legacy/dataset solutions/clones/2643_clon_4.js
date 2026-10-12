const Main = input => {
  input = input.split("\n");

  const sourceText = input[0];
  const targetWord = input[1];
  const sourceLength = sourceText.length;

  // Handle edge case: empty target word
  // The original code returns 1 for an empty word.
  if (targetWord.length === 0) {
    console.log(1);
    return;
  }

  // Handle edge case: empty source text
  // If source text is empty, no non-empty word can be formed.
  if (sourceLength === 0) {
    console.log(-1);
    return;
  }

  // currentAbsolutePosition tracks the 0-based index of the last character found
  // in the conceptually infinite repeating sourceText.
  let currentAbsolutePosition = -1;

  // Iterate through each character of the target word
  for (let charIndexInTarget = 0; charIndexInTarget < targetWord.length; charIndexInTarget++) {
    const charToLocate = targetWord[charIndexInTarget];

    // Calculate the 0-based absolute position in the infinite string
    // where the search for the current character should begin.
    // This is one position after the last character found.
    const searchStartAbsolute = currentAbsolutePosition + 1;

    // Determine the relative starting index within a single repetition of sourceText.
    const searchStartRelativeInSource = searchStartAbsolute % sourceLength;

    // First, attempt to find the character in the segment of sourceText
    // starting from searchStartRelativeInSource to the end of sourceText.
    const remainingSegmentOfSource = sourceText.substring(searchStartRelativeInSource);
    let foundRelativeIndexInSegment = remainingSegmentOfSource.indexOf(charToLocate);

    if (foundRelativeIndexInSegment !== -1) {
      // If the character is found within this segment, update the absolute position.
      currentAbsolutePosition = searchStartAbsolute + foundRelativeIndexInSegment;
    } else {
      // If not found in the remaining segment, it means we need to wrap around
      // to the beginning of sourceText to find the character.
      // Search for the character from the very beginning of sourceText.
      let foundRelativeIndexFromSourceStart = sourceText.indexOf(charToLocate);

      if (foundRelativeIndexFromSourceStart === -1) {
        // If the character is not found anywhere in sourceText,
        // then it's impossible to form the target word.
        console.log(-1);
        return; // Exit the Main function
      } else {
        // The character is found by wrapping around.
        // Calculate the number of positions from searchStartAbsolute to the end of the current sourceText repetition,
        // then add the index from the beginning of the next sourceText repetition.
        const positionsToNextSourceStart = sourceLength - searchStartRelativeInSource;
        currentAbsolutePosition = searchStartAbsolute + positionsToNextSourceStart + foundRelativeIndexFromSourceStart;
      }
    }
  }

  // The problem requires a 1-based index for the final result.
  console.log(currentAbsolutePosition + 1);
};

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
