function Main(rawText) {
  const processedText = rawText.trim();
  const charSequence = Array.from(processedText);
  const sequenceLength = charSequence.length;

  const requiredAdjustments = charSequence.slice(0, Math.floor(sequenceLength / 2))
    .reduce((accumulator, currentCharacter, index) => {
      const symmetricIndex = sequenceLength - 1 - index;
      const symmetricCharacter = charSequence[symmetricIndex];
      return accumulator + (currentCharacter !== symmetricCharacter ? 1 : 0);
    }, 0);

  console.log(requiredAdjustments);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
