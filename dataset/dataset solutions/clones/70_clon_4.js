const textReader = require('readline');

const inputProcessor = textReader.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

const ASCII_A_LOWERCASE = 97; // 'a'.charCodeAt(0)

const transformChar = (inputChar, totalShift) => {
  const charCode = inputChar.charCodeAt(0);
  if (charCode >= ASCII_A_LOWERCASE && charCode <= ASCII_A_LOWERCASE + 25) {
    const shiftedCode = ((charCode - ASCII_A_LOWERCASE + totalShift) % 26) + ASCII_A_LOWERCASE;
    return String.fromCharCode(shiftedCode);
  }
  return inputChar;
};

const applyFullCipher = (sourceString, totalShiftAmount) => {
  return Array.from(sourceString).map(char => transformChar(char, totalShiftAmount)).join('');
};

const checkTerms = (content) => {
  const targetWords = ['the', 'this', 'that'];
  return targetWords.some(word => content.includes(word));
};

inputProcessor.on('line', (currentLineData) => {
  for (let s = 1; s <= 26; s++) {
    const processedContent = applyFullCipher(currentLineData, s);
    if (checkTerms(processedContent)) {
      process.stdout.write(processedContent + '\n');
      break;
    }
  }
});