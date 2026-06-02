function Main(rawInput) {
  const sourceText = rawInput.split("\n")[0];

  const presentCharacters = new Set(sourceText);

  const alphabetSequence = Array.from({ length: 26 }, (_, index) =>
    String.fromCharCode('a'.charCodeAt(0) + index)
  );

  const firstMissingCharacter = alphabetSequence.find(charItem =>
    !presentCharacters.has(charItem)
  );

  if (firstMissingCharacter !== undefined) {
    console.log(firstMissingCharacter);
  } else {
    console.log("None");
  }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
