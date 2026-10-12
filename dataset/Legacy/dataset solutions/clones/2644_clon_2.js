console.log((inputStr => {
  // The input string is expected to contain two lines: the source string and the target string.
  // We trim any leading/trailing whitespace and split it by the newline character.
  const [sourceStr, targetStr] = inputStr.trim().split('\n');

  // Initialize an array of 26 empty arrays. Each sub-array will store the indices
  // where a particular character (a-z) appears in the source string, effectively
  // creating a lookup table for character positions.
  const charIndices = Array.from({
    length: 26
  }, _unused => []);

  // Store the lengths of the source and target strings for repeated use,
  // improving readability and potentially performance.
  const sourceLen = sourceStr.length;
  const targetLen = targetStr.length;

  // Populate the 'charIndices' array. For each character in the source string,
  // we calculate its 0-indexed alphabet position (e.g., 'a' is 0, 'b' is 1)
  // and push its index in the source string to the corresponding sub-array.
  for (let charIdx = 0; charIdx < sourceLen; charIdx++) {
    charIndices[sourceStr.charCodeAt(charIdx) - 97].push(charIdx);
  }

  // To handle cyclic matching, we duplicate the indices. For each character,
  // we add its original index plus the source string length to its list.
  // This allows us to find characters that "wrap around" the source string.
  for (let charIdx = 0; charIdx < sourceLen; charIdx++) {
    charIndices[sourceStr.charCodeAt(charIdx) - 97].push(charIdx + sourceLen);
  }

  // 'offsetArr' keeps track of the current search position within each character's
  // list of indices in 'charIndices'. It's initialized to all zeros.
  const offsetArr = Array(26).fill(0);

  // 'currentPos' tracks the current position in the conceptual doubled source string.
  // 'cycleCount' counts how many full cycles of the source string have been traversed.
  let currentPos = -1;
  let cycleCount = 0;

  // Iterate through each character of the target string to find its sequence
  // in the source string.
  for (let targetCharIndex = 0; targetCharIndex < targetLen; targetCharIndex++) {
    // Get the 0-indexed alphabet value for the current target character.
    const charValue = targetStr.charCodeAt(targetCharIndex) - 97;

    // Get the total number of occurrences for this character in our doubled source string.
    const listOfIndicesLength = charIndices[charValue].length;

    // If the character does not exist in the source string at all, it's impossible
    // to form the target string, so we return '-1'.
    if (!listOfIndicesLength) {
      return '-1';
    }

    // Search for the next occurrence of 'charValue' in 'charIndices' that is
    // strictly greater than 'currentPos'. We advance 'offsetArr[charValue]'
    // until such an index is found or we exhaust the list for that character.
    for (; offsetArr[charValue] < listOfIndicesLength; offsetArr[charValue]++) {
      if (currentPos < charIndices[charValue][offsetArr[charValue]]) {
        break;
      }
    }

    // Update 'currentPos' to the index of the found character.
    currentPos = charIndices[charValue][offsetArr[charValue]];

    // If 'currentPos' is greater than or equal to the original source string length,
    // it means we have completed a full cycle of the source string.
    if (currentPos >= sourceLen) {
      cycleCount++; // Increment the cycle counter.
      currentPos -= sourceLen; // Adjust 'currentPos' to be relative to the start of the current cycle.
      offsetArr.fill(0); // Reset all character offsets for the next cycle search.
    }
  }

  // Calculate the final result: (number of full cycles * source string length) + (final position + 1).
  // The '+1' is because positions are 0-indexed, but the problem expects a 1-indexed length.
  return `${cycleCount * sourceLen + currentPos + 1}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8'))); // Read the entire input from standard input as a UTF-8 string.
