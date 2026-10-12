process.stdin.resume();
process.stdin.setEncoding('utf8');

const ALPHABET_STRING = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ALPHABET_LENGTH = ALPHABET_STRING.length; // 26
const ALPHA_CHAR_ARRAY = ALPHABET_STRING.split('');

var inputLinesBuffer = [];
var inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

function calculateShiftedCharacter(originalCharacter, shiftValue, referenceAlphabet) {
  const charOriginalIndex = referenceAlphabet.indexOf(originalCharacter);
  // The original code implicitly assumes charOriginalIndex is always >= 0.
  // If it were -1, ( -1 + shiftValue ) % ALPHABET_LENGTH would yield an incorrect index,
  // and referenceAlphabet[incorrectIndex] would be undefined.
  // Given the problem context (Caesar cipher on uppercase letters), this is safe.
  const charShiftedIndex = (charOriginalIndex + shiftValue) % ALPHABET_LENGTH;
  return referenceAlphabet[charShiftedIndex];
}

inputProcessor.on('line', (currentInputLine) => {
  inputLinesBuffer.push(currentInputLine);
});

inputProcessor.on('close', () => {
  var shiftMagnitude = parseInt(inputLinesBuffer[0]);
  var sourceCharacters = inputLinesBuffer[1].split('');
  var outputCharacters = [];

  for (var charPosition = 0; charPosition < sourceCharacters.length; charPosition++) {
    const currentSourceChar = sourceCharacters[charPosition];
    const transformedChar = calculateShiftedCharacter(currentSourceChar, shiftMagnitude, ALPHA_CHAR_ARRAY);
    outputCharacters.push(transformedChar);
  }

  const finalCipherResult = outputCharacters.join('');
  console.log(finalCipherResult);
});
