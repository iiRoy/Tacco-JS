'use strict';
function processStringWithShift(inputStr) {
  const inputLines = inputStr.split("\n");
  let targetString = inputLines[0];
  let shiftAmount = parseInt(inputLines[1], 10);

  // Helper function to shift a character code and handle wrap-around 'z' to 'a'
  const applyCharShiftWithWrap = (initialCharCode, shiftValue) => {
    let newCharCode = initialCharCode + shiftValue;
    const charCodeA = 'a'.charCodeAt(0);
    const charCodeZ = 'z'.charCodeAt(0);

    if (newCharCode > charCodeZ) {
      // Calculate how much it went past 'z' and wrap around from 'a'
      newCharCode = charCodeA + (newCharCode - charCodeZ - 1);
    }
    return String.fromCharCode(newCharCode);
  };

  // Convert string to a mutable array of characters for efficient modification
  const charArray = Array.from(targetString);
  const lastCharIndex = charArray.length - 1;

  for (let charIndex = 0; charIndex < charArray.length; charIndex++) {
    const currentCharacter = charArray[charIndex];
    const currentCharCode = currentCharacter.charCodeAt(0);

    if (charIndex === lastCharIndex) {
      // Logic for the very last character
      const effectiveShift = shiftAmount % 26;
      charArray[charIndex] = applyCharShiftWithWrap(currentCharCode, effectiveShift);
    } else {
      // Logic for all characters except the last one
      const charPosFromA = currentCharCode - 'a'.charCodeAt(0); // 0 for 'a', 1 for 'b', ..., 25 for 'z'
      const costToMakeA = 26 - charPosFromA; // Shifts needed to reach 'a' by wrapping around (e.g., 'z' needs 1, 'y' needs 2)

      // Only apply if we have enough shift amount and the character is not already 'a'
      if (shiftAmount >= costToMakeA && currentCharacter !== "a") {
        shiftAmount -= costToMakeA;
        charArray[charIndex] = "a";
      }
    }
  }

  // Join the character array back into a string
  const finalString = charArray.join('');
  console.log(finalString);
}

processStringWithShift(require("fs").readFileSync("/dev/stdin", "utf8"));
