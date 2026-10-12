function processInput(rawData) {
  const allInputCharacters = rawData.split('');
  const uniqueCharactersCollection = new Set(allInputCharacters);
  let sortedUniqueCharactersArray = Array.from(uniqueCharactersCollection).sort();

  const removedFirstCharacter = sortedUniqueCharactersArray.shift();

  const fullLowercaseAlphabet = Array.from({ length: 26 }, (_, charCodeOffset) => String.fromCharCode(97 + charCodeOffset));

  const existingCharactersLookup = new Set(sortedUniqueCharactersArray);
  let firstMissingCharacter = '';

  for (let letterIndex = 0; letterIndex < fullLowercaseAlphabet.length; letterIndex++) {
    const currentAlphabetLetter = fullLowercaseAlphabet[letterIndex];
    if (!existingCharactersLookup.has(currentAlphabetLetter)) {
      firstMissingCharacter = currentAlphabetLetter;
      break;
    }
  }

  const finalResult = firstMissingCharacter === '' ? 'None' : firstMissingCharacter;
  console.log(finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
