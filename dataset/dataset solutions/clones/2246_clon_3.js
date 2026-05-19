function processInputData(rawInputString) {
  const searchCharacter = rawInputString.trim();

  const characterSequence = [];
  const firstCharCode = 'a'.charCodeAt(0);
  const lastCharCode = 'z'.charCodeAt(0);

  for (let charCode = firstCharCode; charCode <= lastCharCode; charCode++) {
    characterSequence.push(String.fromCharCode(charCode));
  }

  const initialCharIndex = characterSequence.indexOf(searchCharacter);
  const nextCharIndex = initialCharIndex + 1;

  console.log(characterSequence[nextCharIndex]);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
