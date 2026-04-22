function executeProcess(dataInput) {
  const lineSeparatorPosition = dataInput.indexOf('\n');
  const shiftValueString = dataInput.substring(0, lineSeparatorPosition);
  const shiftAmount = parseInt(shiftValueString, 10);
  const sourcePhrase = dataInput.substring(lineSeparatorPosition + 1);

  const phraseLength = sourcePhrase.length;
  const initialCharCodeA = 'A'.charCodeAt(0);
  const alphabetSize = 26;

  function transformRecursively(currentIndex, constructedOutput) {
    if (currentIndex >= phraseLength) {
      return constructedOutput;
    }

    const originalCharacterCode = sourcePhrase.charCodeAt(currentIndex);
    
    // Assuming input characters are always uppercase English letters as per problem context
    // and original code's behavior (alpha array contains only 'A'-'Z').
    const zeroBasedAlphabetIndex = originalCharacterCode - initialCharCodeA;
    const shiftedAlphabetIndex = (zeroBasedAlphabetIndex + shiftAmount) % alphabetSize;
    
    // Handle potential negative result from modulo for negative shifts, though problem context implies positive.
    // If original problem implies negative shifts, this needs adjustment to match original's undefined behavior.
    // For positive shifts, (X % 26) is always non-negative.
    const finalCharacterCode = initialCharCodeA + shiftedAlphabetIndex;
    const transformedCharacter = String.fromCharCode(finalCharacterCode);

    return transformRecursively(currentIndex + 1, constructedOutput + transformedCharacter);
  }

  const finalResult = transformRecursively(0, "");

  console.log(finalResult);
}
executeProcess(require("fs").readFileSync("/dev/stdin", "utf8"));