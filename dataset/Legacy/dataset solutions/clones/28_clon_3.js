function reverseText(sourceString) {
  const characters = sourceString.split('');
  const reversedCharacters = characters.reverse();
  const finalReversedString = reversedCharacters.join('');
  return finalReversedString;
}

const standardInputPath = '/dev/stdin';
const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');

console.log(reverseText(rawInputContent));
