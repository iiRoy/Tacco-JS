function processInput(rawData) {
  const charToCheck = String(rawData);

  const VOWEL_SET = new Set(['a', 'i', 'u', 'e', 'o']);

  const checkCharacterType = (character) => {
    if (VOWEL_SET.has(character)) {
      return 'vowel';
    } else {
      return 'consonant';
    }
  };

  const resultType = checkCharacterType(charToCheck);
  console.log(resultType);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
