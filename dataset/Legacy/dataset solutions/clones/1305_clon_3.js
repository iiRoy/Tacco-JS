const fileSystemHandler = require('fs');
const standardInputPath = '/dev/stdin';
const textEncoding = 'utf8';

const sourceContent = fileSystemHandler.readFileSync(standardInputPath, textEncoding);

let transformedCharacters = [];
const contentSize = sourceContent.length;

const UPPERCASE_A_CODE = 65;
const UPPERCASE_Z_CODE = 90;

for (let charPosition = 0; charPosition < contentSize; charPosition++) {
  const currentCharacter = sourceContent.charAt(charPosition);
  const characterAsciiCode = sourceContent.charCodeAt(charPosition);

  const isUpperCase = (characterAsciiCode >= UPPERCASE_A_CODE && characterAsciiCode <= UPPERCASE_Z_CODE);

  if (isUpperCase) {
    transformedCharacters.push(currentCharacter.toLowerCase());
  } else {
    transformedCharacters.push(currentCharacter.toUpperCase());
  }
}

const finalProcessedString = transformedCharacters.join('');
console.log(finalProcessedString.trim());
