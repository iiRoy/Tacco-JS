function analyzeCharacterPattern(sourceData) {
  const initialCharacter = sourceData.charAt(0);
  const subsequentCharacter = sourceData.charAt(1);
  const finalCharacter = sourceData.charAt(2);

  const uniqueCharacterCollection = new Set();
  uniqueCharacterCollection.add(initialCharacter);
  uniqueCharacterCollection.add(subsequentCharacter);
  uniqueCharacterCollection.add(finalCharacter);

  const resultPhrase = (uniqueCharacterCollection.size === 1) ? "No" : "Yes";

  console.log(resultPhrase);
}

analyzeCharacterPattern(require("fs").readFileSync("/dev/stdin", "utf8"));
