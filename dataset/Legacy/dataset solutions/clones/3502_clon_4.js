function Main(inputString) {
  const characterReplacements = new Map([
    ['1', '9'],
    ['9', '1']
  ]);

  const transformedCharacters = Array.from(inputString).map(singleCharacter => {
    return characterReplacements.has(singleCharacter) ? characterReplacements.get(singleCharacter) : singleCharacter;
  });

  const finalResult = transformedCharacters.join('');

  return finalResult;
}

console.log(Main(require("fs").readFileSync("/dev/stdin", "utf8")));
