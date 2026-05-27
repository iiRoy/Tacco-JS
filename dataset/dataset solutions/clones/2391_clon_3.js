function processInput(inputData) {
  const cipherShift = parseInt(inputData[0], 10);

  const ASCII_UPPER_A = 65;
  const ALPHABET_SIZE = 26;

  const performCharacterShift = (originalChar) => {
    const charCodeValue = originalChar.charCodeAt(0);
    const zeroBasedIndex = charCodeValue - ASCII_UPPER_A;
    const shiftedZeroBasedIndex = (zeroBasedIndex + cipherShift) % ALPHABET_SIZE;
    const newCharCodeValue = shiftedZeroBasedIndex + ASCII_UPPER_A;
    return String.fromCharCode(newCharCodeValue);
  };

  const shiftedCharacters = inputData[1].split("").map(performCharacterShift);

  console.log(shiftedCharacters.join(""));
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
