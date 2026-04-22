function characterProcessor(incomingData) {
  const subjectChar = String(incomingData).trim().charAt(0);

  let currentAlphaPosition;
  const charValue = subjectChar.charCodeAt(0);

  if (charValue >= 97 && charValue <= 122) { // Check if character is 'a' through 'z'
    currentAlphaPosition = charValue - 97;
  } else {
    currentAlphaPosition = -1; // Mimic `indexOf` returning -1 for not found
  }

  const subsequentPosition = currentAlphaPosition + 1;

  let finalSymbol;
  if (subsequentPosition === 0) { // This corresponds to `alphabet[0]` for original `indexOf` returning -1
    finalSymbol = String.fromCharCode(97); // 'a'
  } else if (subsequentPosition >= 1 && subsequentPosition <= 25) { // Valid positions for 'b' through 'z'
    finalSymbol = String.fromCharCode(97 + subsequentPosition);
  } else { // Position is 26 (for 'z') or any other out-of-bounds index
    finalSymbol = undefined; // Mimic `alphabet[26]` behavior
  }

  console.log(finalSymbol);
}

characterProcessor(require('node:fs').readFileSync(0, 'utf8'));