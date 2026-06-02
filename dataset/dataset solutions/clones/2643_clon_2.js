const ProcessInput = rawData => {
  // Split the raw input string into an array of lines using the newline character.
  let lines = rawData.split("\n");

  // The first line is considered the primary string to search within.
  const mainString = lines[0];
  // The second line is the target word whose characters we need to find sequentially.
  const targetWord = lines[1];

  /**
   * This recursive utility function attempts to locate the target word's characters
   * one by one within a dynamically expanding segment of the main string.
   *
   * @param {number} charIndex - The current index of the character in `targetWord` that we are searching for.
   * @param {string} currentSegment - The current portion of `mainString` being examined.
   * @param {boolean} hasFoundPrevious - A flag indicating if the previous character of `targetWord`
   *                                     was successfully found within the *current* `currentSegment`.
   *                                     This helps determine if `mainString` can be appended.
   * @param {number} totalOffset - The cumulative character offset from the very beginning of the original `mainString`.
   * @returns {number} The total offset if the `targetWord` is found, or -1 if it cannot be constructed.
   */
  const findSequence = (charIndex, currentSegment, hasFoundPrevious, totalOffset) => {
    // Base case: If we have successfully found all characters of the target word,
    // return the accumulated total offset.
    if (charIndex === targetWord.length) {
      return totalOffset;
    }

    // Attempt to find the current character of the target word within the current segment.
    const foundPosition = currentSegment.indexOf(targetWord[charIndex]);

    // Check if the character was found in the current segment.
    if (foundPosition !== -1) {
      // If the character is found:
      // Recursively call the function for the next character in `targetWord`.
      // The `currentSegment` is updated to start from the `foundPosition` to ensure sequential search.
      // `hasFoundPrevious` is set to `true` because we just found a character.
      // `totalOffset` is incremented by the `foundPosition` within the `currentSegment`.
      return findSequence(
        charIndex + 1,
        currentSegment.slice(foundPosition, currentSegment.length),
        true,
        totalOffset + foundPosition
      );
    } else {
      // If the character was NOT found in the current segment:
      // We need to decide whether to extend the `currentSegment` or give up.
      if (hasFoundPrevious) {
        // If `hasFoundPrevious` is true, it means we found the *previous* character
        // in this segment, but not the current one. This implies we should try
        // extending the `currentSegment` by appending the `mainString` to it.
        // We retry finding the *same* character (`charIndex`) in the extended segment.
        // `hasFoundPrevious` is reset to `false` because we are effectively starting
        // a new search attempt within the newly extended segment.
        return findSequence(charIndex, currentSegment + mainString, false, totalOffset);
      } else {
        // If `hasFoundPrevious` is false, it means we couldn't find the current character
        // even after potentially extending the segment in a previous step (or it's the very first attempt).
        // In this scenario, it's impossible to form the target word, so we return -1.
        return -1;
      }
    }
  };

  // Initiate the recursive search process.
  // Start with the first character of the target word (index 0).
  // The initial segment to search within is the `mainString`.
  // `hasFoundPrevious` is `false` initially as no character has been found yet.
  // `totalOffset` starts at 1, as per the problem's specific requirement for the initial offset.
  console.log(findSequence(0, mainString, false, 1));
};

// Read the entire content from standard input (`/dev/stdin`) as a UTF-8 string.
// Then, pass this raw input string to the `ProcessInput` function for execution.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
