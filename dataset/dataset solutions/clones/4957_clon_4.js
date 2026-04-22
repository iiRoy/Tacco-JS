function transformText(inputMessage, shiftValue) {
  const resultCharacters = [];
  let currentBudget = shiftValue;
  const messageSize = inputMessage.length;

  for (let position = 0; position < messageSize; ++position) {
    const currentGlyph = inputMessage[position];
    const glyphNumericalValue = currentGlyph.charCodeAt(0) - 97; // 'a' is 0, 'b' is 1, etc.

    // Calculate the cost to change the current character to 'a'
    const expenseToMakeA = (26 - glyphNumericalValue) % 26; // If 'a', expense is 0

    const isFinalGlyph = (position === messageSize - 1);

    if (isFinalGlyph) {
      if (expenseToMakeA > 0 && currentBudget >= expenseToMakeA) {
        // Sufficient budget to convert the last character to 'a'
        resultCharacters.push('a');
        currentBudget -= expenseToMakeA;
      } else {
        // Insufficient budget or already 'a'. Apply remaining budget as a direct shift.
        const finalGlyphValue = (glyphNumericalValue + currentBudget) % 26;
        resultCharacters.push(String.fromCharCode(97 + finalGlyphValue));
        currentBudget = 0; // Budget is considered spent after the final character
      }
    } else { // Not the last character
      if (expenseToMakeA > 0 && currentBudget >= expenseToMakeA) {
        // Sufficient budget to convert this character to 'a'
        resultCharacters.push('a');
        currentBudget -= expenseToMakeA;
      } else {
        // Insufficient budget or already 'a'. Pass through unchanged for now.
        resultCharacters.push(currentGlyph);
      }
    }
  }

  return resultCharacters.join('');
}

function executeCipher(fullInput) {
  const inputSegments = fullInput.trim().split('\n');
  const initialString = inputSegments[0];
  const transformationBudget = parseInt(inputSegments[1], 10);
  console.log(transformText(initialString, transformationBudget));
}

executeCipher(require("fs").readFileSync("/dev/stdin", "utf8"));