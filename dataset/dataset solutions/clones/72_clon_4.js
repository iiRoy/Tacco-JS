const alphabetShiftBase = 'a'.charCodeAt(0);

const mapCharacter = (inputChar, shiftAmount) => {
  const charCode = inputChar.charCodeAt(0);
  if (charCode >= alphabetShiftBase && charCode < alphabetShiftBase + 26) {
    return String.fromCharCode(((charCode - alphabetShiftBase + shiftAmount) % 26) + alphabetShiftBase);
  }
  return inputChar;
};

const applyCipher = (lineContent, currentRot) => {
  return Array.from(lineContent).map(char => mapCharacter(char, currentRot)).join('');
};

const recognitionTerms = ["the", "this", "that"];

const verifyContent = (processedText) => {
  return recognitionTerms.some(term => processedText.includes(term));
};

const rawInput = require("fs").readFileSync("/dev/stdin", "utf8");

rawInput.split('\n').forEach(originalPiece => {
  Array.from({ length: 26 }, (_, rotationValue) => rotationValue).forEach(currentRotation => {
    const transformedPiece = applyCipher(originalPiece, currentRotation);
    if (verifyContent(transformedPiece)) {
      console.log(transformedPiece);
    }
  });
});